'use client';

import React from 'react';
import { KnowledgeSection } from '@/components/landing/KnowledgeSection';

/**
 * KnowledgeSpace (Help Center section for Appliances)
 * Replaces legacy knowledge base with the modern responsive Help Center articles component.
 */
export function KnowledgeSpace(props) {
  return (
    <KnowledgeSection
      vertical="appliances"
      showNewsletter={false}
      {...props}
    />
  );
}

export default KnowledgeSpace;
