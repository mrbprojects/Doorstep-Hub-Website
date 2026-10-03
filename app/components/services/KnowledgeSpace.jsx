'use client';

import React from 'react';
import { KnowledgeSection } from '@/components/landing/KnowledgeSection';

/**
 * KnowledgeSpace (Help Center section for Services)
 * Replaces legacy knowledge base with modern Help Center component.
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
