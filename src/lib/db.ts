import { db, auth } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';

const CACHE_KEY = 'reset_fitness_audits_cache';

export const getCachedAudits = (): Audit[] => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error('Failed to parse cached audits', e);
    return [];
  }
};

export const setCachedAudits = (audits: Audit[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(audits));
  } catch (e) {
    console.error('Failed to cache audits', e);
  }
};

export type Score = 'PASS' | 'FAIL' | 'NEEDS_ATTENTION' | 'NA' | null;

export interface Audit {
  id: string;
  userId: string;
  date: string;
  quarter: string;
  facilityLocation: string;
  auditorName: string;
  items: Record<string, Score>;
  itemComments?: Record<string, string>;
  itemImages?: Record<string, string[]>;
  comments: string;
  lastSavedAt: number;
}

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const saveAudit = async (audit: Audit): Promise<void> => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  const auditToSave = {
    ...audit,
    userId: auth.currentUser.uid,
    items: JSON.stringify(audit.items),
    itemComments: audit.itemComments ? JSON.stringify(audit.itemComments) : undefined,
    itemImages: audit.itemImages ? JSON.stringify(audit.itemImages) : undefined,
  };
  await setDoc(doc(db, 'audits', audit.id), auditToSave);
};

export const getAudits = async (): Promise<Audit[]> => {
  if (!auth.currentUser) return [];
  const q = query(collection(db, 'audits'), where('userId', '==', auth.currentUser.uid));
  const snapshot = await getDocs(q);
  const audits = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      items: JSON.parse(data.items),
      itemComments: data.itemComments ? JSON.parse(data.itemComments) : {},
      itemImages: data.itemImages ? JSON.parse(data.itemImages) : {},
    } as Audit;
  }).sort((a, b) => b.lastSavedAt - a.lastSavedAt);
  
  setCachedAudits(audits);
  return audits;
};

export const onAuditsUpdate = (callback: (audits: Audit[]) => void) => {
  if (!auth.currentUser) return () => {};
  const q = query(collection(db, 'audits'), where('userId', '==', auth.currentUser.uid));
  return onSnapshot(q, (snapshot) => {
    const audits = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        items: JSON.parse(data.items),
        itemComments: data.itemComments ? JSON.parse(data.itemComments) : {},
        itemImages: data.itemImages ? JSON.parse(data.itemImages) : {},
      } as Audit;
    }).sort((a, b) => b.lastSavedAt - a.lastSavedAt);
    
    setCachedAudits(audits);
    callback(audits);
  });
};

export const getAudit = async (id: string): Promise<Audit | undefined> => {
  const docRef = doc(db, 'audits', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      items: JSON.parse(data.items),
      itemComments: data.itemComments ? JSON.parse(data.itemComments) : {},
      itemImages: data.itemImages ? JSON.parse(data.itemImages) : {},
    } as Audit;
  }
  return undefined;
};

export const deleteAudit = async (id: string): Promise<void> => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  await deleteDoc(doc(db, 'audits', id));
};
