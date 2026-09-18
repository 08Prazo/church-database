import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { AppUser, UserRole } from '../types';
import { determineUserRole } from '../lib/database';
import { INITIAL_SUPER_ADMIN_EMAIL } from '../lib/constants';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGmailAddress: (email: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_USER_KEY = 'new_brook_session_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to construct AppUser from email & uid
  const buildAppUser = async (email: string, uid: string, displayName?: string): Promise<AppUser> => {
    const role: UserRole = await determineUserRole(email);
    return {
      uid,
      email: email.toLowerCase(),
      displayName: displayName || email.split('@')[0],
      role
    };
  };

  useEffect(() => {
    // 1. Check local session storage first for quick restore
    try {
      const stored = localStorage.getItem(LOCAL_SESSION_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppUser;
        // Verify role
        determineUserRole(parsed.email).then((role) => {
          setUser({ ...parsed, role });
          setLoading(false);
        }).catch(() => {
          setUser(parsed);
          setLoading(false);
        });
      }
    } catch {
      // Ignore
    }

    // 2. Firebase Auth listener
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (fbUser && fbUser.email) {
        const appUser = await buildAppUser(
          fbUser.email,
          fbUser.uid,
          fbUser.displayName || undefined
        );
        setUser(appUser);
        localStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(appUser));
      } else {
        // If not logged in via Firebase Auth, keep local session if present, otherwise null
        const stored = localStorage.getItem(LOCAL_SESSION_USER_KEY);
        if (!stored) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Google Authentication is initializing. Please try the Gmail address login below.');
    }
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user && result.user.email) {
      const appUser = await buildAppUser(
        result.user.email,
        result.user.uid,
        result.user.displayName || undefined
      );
      setUser(appUser);
      localStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(appUser));
    }
  };

  const signInWithGmailAddress = async (email: string, displayName?: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    const uid = 'gmail_' + btoa(trimmed).replace(/=/g, '');
    const appUser = await buildAppUser(trimmed, uid, displayName);
    setUser(appUser);
    localStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(appUser));
  };

  const signOut = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch {
      // ignore
    }
    localStorage.removeItem(LOCAL_SESSION_USER_KEY);
    setUser(null);
  };

  const refreshRole = async () => {
    if (user) {
      const role = await determineUserRole(user.email);
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(updated));
    }
  };

  const isSuperAdmin = user?.role === 'super_admin' || user?.email.toLowerCase() === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase();
  const isAdmin = isSuperAdmin || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithGmailAddress,
        signOut,
        refreshRole,
        isSuperAdmin: !!isSuperAdmin,
        isAdmin: !!isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
