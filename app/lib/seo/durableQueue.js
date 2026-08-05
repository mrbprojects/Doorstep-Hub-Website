/**
 * Persistent Durable SEO Job Queue
 * Manages SEO background jobs with persistent storage, idempotency keys,
 * backoff retries, and strict job state transitions.
 */

import fs from 'fs';
import path from 'path';

const STORAGE_PATH = path.join(process.cwd(), 'scratch', 'seo_jobs.json');

export const JOB_STATES = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    RETRY_SCHEDULED: 'RETRY_SCHEDULED',
    DEAD_LETTER: 'DEAD_LETTER',
    CANCELLED: 'CANCELLED'
};

// Ensure storage directory exists
function ensureStorage() {
    const dir = path.dirname(STORAGE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(STORAGE_PATH)) {
        fs.writeFileSync(STORAGE_PATH, JSON.stringify({ jobs: [], deduplicationMap: {} }, null, 2), 'utf8');
    }
}

function readStore() {
    ensureStorage();
    try {
        const raw = fs.readFileSync(STORAGE_PATH, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return { jobs: [], deduplicationMap: {} };
    }
}

function writeStore(store) {
    ensureStorage();
    try {
        fs.writeFileSync(STORAGE_PATH, JSON.stringify(store, null, 2), 'utf8');
    } catch (e) {
        console.error('[Durable Queue] Write Error:', e);
    }
}

/**
 * Enqueues a durable job with idempotency key.
 */
export function enqueueDurableJob(type, payload, idempotencyKey = null) {
    const store = readStore();
    const key = idempotencyKey || `${type}_${payload.url || payload.id}_${Date.now()}`;

    // Idempotency check: Skip if pending or processing job with same key exists
    const existing = store.jobs.find(j => j.idempotencyKey === key && [JOB_STATES.PENDING, JOB_STATES.PROCESSING, JOB_STATES.RETRY_SCHEDULED].includes(j.state));
    if (existing) {
        return { enqueued: false, reason: 'Duplicate job already in queue', jobId: existing.id };
    }

    const job = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        idempotencyKey: key,
        type,
        payload,
        state: JOB_STATES.PENDING,
        attempts: 0,
        maxRetries: 5,
        createdTime: new Date().toISOString(),
        updatedTime: new Date().toISOString(),
        nextRunTime: new Date().toISOString(),
        logs: []
    };

    store.jobs.push(job);
    writeStore(store);

    return { enqueued: true, jobId: job.id, job };
}

/**
 * Processes pending durable jobs.
 */
export async function processDurableQueue(processorFn) {
    const store = readStore();
    const now = new Date().toISOString();

    const pendingJobs = store.jobs.filter(j => 
        (j.state === JOB_STATES.PENDING || j.state === JOB_STATES.RETRY_SCHEDULED) && 
        j.nextRunTime <= now
    );

    for (const job of pendingJobs) {
        job.state = JOB_STATES.PROCESSING;
        job.attempts += 1;
        job.updatedTime = new Date().toISOString();
        writeStore(store);

        try {
            const result = await processorFn(job);
            if (result.success) {
                job.state = JOB_STATES.SUCCESS;
                job.logs.push({ time: new Date().toISOString(), status: 'SUCCESS', response: result });
            } else {
                handleJobFailure(job, result.error || 'Execution failed');
            }
        } catch (err) {
            handleJobFailure(job, err.message);
        }

        job.updatedTime = new Date().toISOString();
        writeStore(store);
    }
}

function handleJobFailure(job, errorMessage) {
    job.logs.push({ time: new Date().toISOString(), status: 'FAILED', error: errorMessage, attempt: job.attempts });

    if (job.attempts < job.maxRetries) {
        job.state = JOB_STATES.RETRY_SCHEDULED;
        const delaySeconds = Math.pow(2, job.attempts) * 60; // 2m, 4m, 8m...
        job.nextRunTime = new Date(Date.now() + delaySeconds * 1000).toISOString();
    } else {
        job.state = JOB_STATES.DEAD_LETTER;
    }
}

export function getJobStats() {
    const store = readStore();
    const stats = { total: store.jobs.length };
    Object.values(JOB_STATES).forEach(s => {
        stats[s] = store.jobs.filter(j => j.state === s).length;
    });
    return stats;
}
