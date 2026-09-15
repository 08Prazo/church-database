import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('user');

  useEffect(() => {
    let unsubscribeRoleDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (unsubscribeRoleDoc) {
        unsubscribeRoleDoc();
        unsubscribeRoleDoc = null;
      }

      if (!currentUser || !currentUser.email) {
        setRole('user');
        setLoading(false);
        return;
      }

      const emailNormalized = currentUser.email.toLowerCase();

      try {
        const adminDocRef = doc(db, 'admins', emailNormalized);

        // Check if system has been bootstrapped; if not, first user can bootstrap as super admin
        const bootstrapRef = doc(db, 'system', 'bootstrap');
        const bootstrapSnap = await getDoc(bootstrapRef);
        if (!bootstrapSnap.exists()) {
          try {
            await setDoc(adminDocRef, {
              email: emailNormalized,
              role: 'super_admin',
              addedBy: 'Initial Setup',
              addedAt: serverTimestamp(),
            });
            await setDoc(bootstrapRef, {
              bootstrappedBy: emailNormalized,
              bootstrappedAt: serverTimestamp(),
            });
            setRole('super_admin');
            setLoading(false);
          } catch (initErr) {
            console.warn('Bootstrap initialization notice:', initErr);
          }
        }

        // Check role in Firestore admins collection with real-time listener
        unsubscribeRoleDoc = onSnapshot(
          adminDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.role === 'super_admin') {
                setRole('super_admin');
              } else if (data.role === 'admin') {
                setRole('admin');
              } else {
                setRole('user');
              }
            } else {
              setRole('user');
            }
            setLoading(false);
          },
          (err) => {
            console.warn('Role snapshot listener error:', err);
            setRole('user');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Failed to setup role listener:', err);
        setRole('user');
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRoleDoc) {
        unsubscribeRoleDoc();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Sign-in failed:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await fbSignOut(auth);
      setRole('user');
    } catch (error: any) {
      console.error('Sign-out failed:', error);
      throw error;
    }
  };

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        isAdmin,
        isSuperAdmin,
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
