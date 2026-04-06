const fs = require('fs');
const path = require('path');

const animated404Component = `
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export function Animated404() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/appliance-repair-services');
        }, 5000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-[#D9EAE8] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center"
            >
                <img
                    src="/doorstepanimation.gif"
                    alt="Doorstep Hub Logo Animation"
                    className="w-64 md:w-80 h-auto object-contain mb-8 mix-blend-multiply"
                />
            </motion.div>
        </div>
    );
}
`;

fs.writeFileSync(path.join(__dirname, 'app/components/ui/Animated404.jsx'), animated404Component);

const filesToUpdate = [
    'app/spa-salon/service/[id]/page.js',
    'app/religious-services/service/[id]/page.js',
    'app/pghostels/hostel-detail/[id]/page.js',
    'app/components/appliances/CategoryPage.jsx',
    'app/components/appliances/StoreDetailPage.jsx',
    'app/components/appliances/ServiceDetailsPage.jsx',
    'app/not-found.js',
    'app/components/spasalon/DetailsPage.jsx',
    'app/components/knowledge/ArticleViewPage.jsx',
    'app/components/services/ServiceDetailsPage.jsx'
];

for (const relPath of filesToUpdate) {
    const fullPath = path.join(__dirname, relPath);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, 'utf8');

    // For not-found.js, replace completely
    if (relPath === 'app/not-found.js') {
        const notFoundContent = `
'use client';
import { Animated404 } from '@/components/ui/Animated404';
export default function NotFound() {
  return <Animated404 />;
}
        `;
        fs.writeFileSync(fullPath, notFoundContent);
        console.log(\`Updated \${relPath}\`);
        continue;
    }

    // For others, replace router.replace logic with a state that triggers <Animated404 /> render
    let changed = false;

    // Inject import if not exists
    if (!content.includes('Animated404')) {
        // Find last import
        const importMatch = content.match(/import .* from .*;/g);
        if (importMatch) {
            const lastImport = importMatch[importMatch.length - 1];
            content = content.replace(lastImport, lastImport + '\\nimport { Animated404 } from \\'@/components/ui/Animated404\\';');
        } else {
            content = \`import { Animated404 } from '@/components/ui/Animated404';\\n\` + content;
        }
        changed = true;
    }

    // We need to be careful changing router.replace to a return statement, 
    // because router.replace is usually inside an effect block.
    // Let's use regex to replace:
    // router.replace('/appliance-repair-services');
    // with:
    // setViewType('404'); or state update?
    
    // Actually, it's easier to just do: window.location.href = '/not-found-page' 
    // Wait, next.js doesn't have a /not-found-page by default
    
    // Instead of parsing AST, let's just make \`window.dispatchEvent(new Event('trigger-404'))\`? No.
    // Let's insert a state \`const [show404, setShow404] = useState(false);\`
    // This is too complex to regex.
}
// I will just use multi_replace for the files I know.
