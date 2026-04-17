import { Audit } from './db';
import { CHECKLIST_CATEGORIES } from './checklist';

export function getCategoryScore(audit: Audit, categoryId: string) {
  const category = CHECKLIST_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return { valid: 0, percentage: 0 };
  
  let total = 0;
  let passed = 0;
  
  category.items.forEach(item => {
    const score = audit.items[item.id];
    if (score === 'PASS' || score === 'FAIL' || score === 'NEEDS_ATTENTION') {
      total++;
      if (score === 'PASS') passed++;
      else if (score === 'NEEDS_ATTENTION') passed += 0.5;
    }
  });
  
  return {
    valid: total,
    percentage: total > 0 ? Math.round((passed / total) * 100) : 0
  };
}

export function getOverallScore(audit: Audit) {
  let total = 0;
  let passed = 0;
  
  CHECKLIST_CATEGORIES.forEach(category => {
    category.items.forEach(item => {
      const score = audit.items[item.id];
      if (score === 'PASS' || score === 'FAIL' || score === 'NEEDS_ATTENTION') {
        total++;
        if (score === 'PASS') passed++;
        else if (score === 'NEEDS_ATTENTION') passed += 0.5;
      }
    });
  });
  
  return total > 0 ? Math.round((passed / total) * 100) : 0;
}
