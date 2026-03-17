import { Audit } from './db';
import { CHECKLIST_CATEGORIES } from './checklist';

export function getCategoryScore(audit: Audit, categoryId: string) {
  const category = CHECKLIST_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return { pass: 0, fail: 0, na: 0, unanswered: 0, valid: 0, percentage: 0 };

  let pass = 0, fail = 0, na = 0, unanswered = 0;
  category.items.forEach(item => {
    const score = audit.items[item.id];
    if (score === 'PASS') pass++;
    else if (score === 'FAIL') fail++;
    else if (score === 'NA') na++;
    else unanswered++;
  });

  const valid = pass + fail;
  const percentage = valid > 0 ? Math.round((pass / valid) * 100) : 0;
  return { pass, fail, na, unanswered, valid, percentage };
}

export function getOverallScore(audit: Audit) {
  let pass = 0, fail = 0;
  CHECKLIST_CATEGORIES.forEach(cat => {
    const catScore = getCategoryScore(audit, cat.id);
    pass += catScore.pass;
    fail += catScore.fail;
  });
  const valid = pass + fail;
  return valid > 0 ? Math.round((pass / valid) * 100) : 0;
}
