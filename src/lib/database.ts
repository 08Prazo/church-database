import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Soul, AdminUser, UserRole, AppUser } from '../types';
import { INITIAL_SUPER_ADMIN_EMAIL } from './constants';

const LOCAL_SOULS_KEY = 'new_brook_souls_db';
const LOCAL_ADMINS_KEY = 'new_brook_admins_db';

// Helper to get local stored souls
function getLocalSouls(): Soul[] {
  try {
    const raw = localStorage.getItem(LOCAL_SOULS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save local stored souls
function saveLocalSouls(souls: Soul[]) {
  try {
    localStorage.setItem(LOCAL_SOULS_KEY, JSON.stringify(souls));
  } catch {
    // Ignore storage quota
  }
}

// Helper to get local stored admins
export function getLocalAdmins(): AdminUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_ADMINS_KEY);
    if (!raw) {
      // Seed with initial super admin
      const initial: AdminUser[] = [
        {
          email: INITIAL_SUPER_ADMIN_EMAIL.toLowerCase(),
          role: 'super_admin',
          assignedBy: 'system',
          assignedAt: Date.now()
        }
      ];
      localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: AdminUser[] = JSON.parse(raw);
    if (!parsed.some(a => a.email.toLowerCase() === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase())) {
      parsed.push({
        email: INITIAL_SUPER_ADMIN_EMAIL.toLowerCase(),
        role: 'super_admin',
        assignedBy: 'system',
        assignedAt: Date.now()
      });
      localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return [
      {
        email: INITIAL_SUPER_ADMIN_EMAIL.toLowerCase(),
        role: 'super_admin',
        assignedBy: 'system',
        assignedAt: Date.now()
      }
    ];
  }
}

function saveLocalAdmins(admins: AdminUser[]) {
  try {
    localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(admins));
  } catch {
    // Ignore storage quota
  }
}

/**
 * Determine the user's role:
 * - adekoyapraise08@gmail.com is ALWAYS initial Super Admin
 * - Firestore 'admins' collection
 * - Local admins storage
 */
export async function determineUserRole(email: string): Promise<UserRole> {
  const normalized = email.trim().toLowerCase();
  if (normalized === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase()) {
    return 'super_admin';
  }

  // Check Firestore first if available
  if (db) {
    try {
      const adminDocRef = doc(db, 'admins', normalized);
      const snapshot = await getDoc(adminDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.role === 'super_admin') return 'super_admin';
        if (data.role === 'admin') return 'admin';
      }
    } catch {
      // Fall through to local check on network/rule error
    }
  }

  // Fallback to local admin registry
  const localAdmins = getLocalAdmins();
  const match = localAdmins.find(a => a.email.toLowerCase() === normalized);
  if (match) {
    return match.role;
  }

  return 'user';
}

/**
 * Subscribe to souls according to user role:
 * - Regular Users: only see their own added souls
 * - Admins and Super Admins: see all souls
 */
export function subscribeToSouls(
  currentUser: AppUser,
  callback: (souls: Soul[]) => void
): () => void {
  const isAdminOrSuper = currentUser.role === 'admin' || currentUser.role === 'super_admin';

  if (db) {
    try {
      const soulsRef = collection(db, 'souls');
      let q = query(soulsRef, orderBy('createdAt', 'desc'));

      if (!isAdminOrSuper) {
        // Users only see their own added souls
        q = query(
          soulsRef,
          where('createdByEmail', '==', currentUser.email.toLowerCase()),
          orderBy('createdAt', 'desc')
        );
      }

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: Soul[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Omit<Soul, 'id'>;
            list.push({ ...data, id: d.id });
          });
          callback(list);
        },
        (error) => {
          console.warn('Firestore subscription fallback to local storage:', error.message);
          // Fallback to local storage
          const allLocal = getLocalSouls();
          const filtered = isAdminOrSuper
            ? allLocal
            : allLocal.filter(s => s.createdByEmail.toLowerCase() === currentUser.email.toLowerCase());
          callback(filtered);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Firestore query error, using local data:', err);
    }
  }

  // Pure local storage subscription
  const updateFromLocal = () => {
    const allLocal = getLocalSouls();
    const filtered = isAdminOrSuper
      ? allLocal
      : allLocal.filter(s => s.createdByEmail.toLowerCase() === currentUser.email.toLowerCase());
    callback(filtered);
  };

  updateFromLocal();
  const listener = () => updateFromLocal();
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}

/**
 * Add a new soul record
 */
export async function addSoul(
  data: Omit<Soul, 'id' | 'createdAt'>
): Promise<string> {
  const newId = 'soul_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newSoul: Soul = {
    ...data,
    id: newId,
    createdByEmail: data.createdByEmail.toLowerCase(),
    createdAt: Date.now()
  };

  // 1. Always update local storage first for snappy UI and offline guarantee
  const localList = getLocalSouls();
  localList.unshift(newSoul);
  saveLocalSouls(localList);

  // 2. Sync to Firestore if available
  if (db) {
    try {
      const docRef = doc(db, 'souls', newId);
      await setDoc(docRef, newSoul);
    } catch (err) {
      console.warn('Could not save to Firestore, saved locally:', err);
    }
  }

  return newId;
}

/**
 * Update an existing soul
 */
export async function updateSoul(
  id: string,
  updates: Partial<Omit<Soul, 'id' | 'createdAt' | 'createdByEmail' | 'createdByUid'>>
): Promise<void> {
  // 1. Update local storage
  const localList = getLocalSouls();
  const index = localList.findIndex(s => s.id === id);
  if (index !== -1) {
    localList[index] = { ...localList[index], ...updates };
    saveLocalSouls(localList);
  }

  // 2. Update Firestore
  if (db) {
    try {
      const docRef = doc(db, 'souls', id);
      await updateDoc(docRef, updates);
    } catch (err) {
      console.warn('Could not update in Firestore, updated locally:', err);
    }
  }
}

/**
 * Delete a soul
 */
export async function deleteSoul(id: string): Promise<void> {
  // 1. Delete from local storage
  const localList = getLocalSouls();
  const filtered = localList.filter(s => s.id !== id);
  saveLocalSouls(filtered);

  // 2. Delete from Firestore
  if (db) {
    try {
      const docRef = doc(db, 'souls', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Could not delete in Firestore, deleted locally:', err);
    }
  }
}

/**
 * Subscribe to list of Admins & Super Admins (for Super Admin management panel)
 */
export function subscribeToAdmins(
  callback: (admins: AdminUser[]) => void
): () => void {
  if (db) {
    try {
      const adminsRef = collection(db, 'admins');
      const unsubscribe = onSnapshot(
        adminsRef,
        (snapshot) => {
          const list: AdminUser[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as AdminUser;
            list.push({ ...data, email: d.id.toLowerCase() });
          });
          // Ensure initial super admin is always present
          if (!list.some(a => a.email.toLowerCase() === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase())) {
            list.unshift({
              email: INITIAL_SUPER_ADMIN_EMAIL.toLowerCase(),
              role: 'super_admin',
              assignedBy: 'system',
              assignedAt: Date.now()
            });
          }
          callback(list);
        },
        () => {
          callback(getLocalAdmins());
        }
      );
      return unsubscribe;
    } catch {
      // Fallback
    }
  }

  callback(getLocalAdmins());
  const interval = setInterval(() => {
    callback(getLocalAdmins());
  }, 2000);
  return () => clearInterval(interval);
}

/**
 * Add or update an Admin / Super Admin role
 */
export async function setAdminRole(
  email: string,
  role: 'admin' | 'super_admin',
  assignedBy: string
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const adminData: AdminUser = {
    email: normalized,
    role,
    assignedBy,
    assignedAt: Date.now()
  };

  // Local storage
  const local = getLocalAdmins();
  const filtered = local.filter(a => a.email.toLowerCase() !== normalized);
  filtered.push(adminData);
  saveLocalAdmins(filtered);

  // Firestore
  if (db) {
    try {
      const docRef = doc(db, 'admins', normalized);
      await setDoc(docRef, adminData);
    } catch (err) {
      console.warn('Could not update admin in Firestore:', err);
    }
  }
}

/**
 * Remove an Admin / Super Admin
 */
export async function removeAdminRole(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (normalized === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('The initial Super Admin cannot be removed.');
  }

  // Local storage
  const local = getLocalAdmins();
  const filtered = local.filter(a => a.email.toLowerCase() !== normalized);
  saveLocalAdmins(filtered);

  // Firestore
  if (db) {
    try {
      const docRef = doc(db, 'admins', normalized);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Could not delete admin in Firestore:', err);
    }
  }
}
