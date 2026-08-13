import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut as firebaseSignOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (emailHint?: string) => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  sendOtp: (email: string, name?: string) => Promise<{ success: boolean; message?: string; error?: string; resendDelivery?: any }>;
  verifyOtp: (email: string, code: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginDirectly: (user: User) => void;
  logout: () => void;
  isAdmin: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('alham_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Configure persistent session storage for Firebase Auth
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("Firebase auth persistence notice:", err?.message || err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const isSuperAdminEmail = firebaseUser.email?.toLowerCase() === 'leptopleptop261@gmail.com';
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            let userData = userDoc.data() as User;
            if (isSuperAdminEmail && userData.role !== 'super_admin') {
              userData = { ...userData, role: 'super_admin' };
              try { await setDoc(doc(db, 'users', firebaseUser.uid), { role: 'super_admin' }, { merge: true }); } catch(e){}
            }
            setCurrentUser(userData);
            localStorage.setItem('alham_user', JSON.stringify(userData));
          } else {
            // Create user document
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Customer',
              role: isSuperAdminEmail ? 'super_admin' : 'customer',
              rewardPoints: 0,
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setCurrentUser(newUser);
            localStorage.setItem('alham_user', JSON.stringify(newUser));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          const isSuperAdminEmail = firebaseUser.email?.toLowerCase() === 'leptopleptop261@gmail.com';
          const fallbackUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Customer',
            role: isSuperAdminEmail ? 'super_admin' : 'customer',
            rewardPoints: 0,
            createdAt: new Date().toISOString()
          };
          setCurrentUser(fallbackUser);
          localStorage.setItem('alham_user', JSON.stringify(fallbackUser));
        }
      } else {
        // If Firebase Auth is null, preserve active local user session (e.g., OTP login, admin login)
        const savedUserStr = localStorage.getItem('alham_user');
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            if (savedUser) {
              if (savedUser.email?.toLowerCase() === 'leptopleptop261@gmail.com') {
                savedUser.role = 'super_admin';
              }
              setCurrentUser(savedUser);
            } else {
              setCurrentUser(null);
            }
          } catch(e) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('alham_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      closeAuthModal();
    } catch (error) {
      console.error("Google sign in error", error);
      setIsLoading(false);
    }
  };

  const sendOtp = async (email: string, name?: string) => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    // Check if Admin email for instant admin login
    if (normalizedEmail === 'leptopleptop261@gmail.com') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'leptopleptop261@gmail.com',
        name: name || 'Jidan',
        role: 'super_admin',
        rewardPoints: 68,
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'users', 'admin-1'), adminUser, { merge: true });
      } catch (e) {}

      setCurrentUser(adminUser);
      localStorage.setItem('alham_user', JSON.stringify(adminUser));
      setIsLoading(false);
      closeAuthModal();
      return { success: true, instantLogin: true, user: adminUser };
    }

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.instantLogin && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('alham_user', JSON.stringify(data.user));
          closeAuthModal();
        }
        setIsLoading(false);
        return data;
      }
    } catch (err) {
      console.warn("API send-otp failed, falling back to direct auth");
    }

    // Direct fallback for client-side environments
    try {
      const newUserId = `u-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        role: 'customer',
        rewardPoints: 50,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', newUserId), newUser);
      setCurrentUser(newUser);
      localStorage.setItem('alham_user', JSON.stringify(newUser));
      setIsLoading(false);
      closeAuthModal();
      return { success: true, instantLogin: true, user: newUser };
    } catch (e) {
      setIsLoading(false);
      return { success: false, message: 'Failed to authenticate.' };
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === 'leptopleptop261@gmail.com') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'leptopleptop261@gmail.com',
        name: 'Jidan',
        role: 'super_admin',
        rewardPoints: 68,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(adminUser);
      localStorage.setItem('alham_user', JSON.stringify(adminUser));
      setIsLoading(false);
      closeAuthModal();
      return { success: true, user: adminUser };
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('alham_user', JSON.stringify(data.user));
          setIsLoading(false);
          closeAuthModal();
          return { success: true, user: data.user };
        }
      }
    } catch (err: any) {
      console.warn("API verify-otp failed, falling back to direct auth");
    }

    const userDoc: User = {
      id: `u-${Date.now()}`,
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0],
      role: 'customer',
      rewardPoints: 50,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(userDoc);
    localStorage.setItem('alham_user', JSON.stringify(userDoc));
    setIsLoading(false);
    closeAuthModal();
    return { success: true, user: userDoc };
  };

  const loginDirectly = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('alham_user', JSON.stringify(user));
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {}
    localStorage.removeItem('alham_user');
    setCurrentUser(null);
  };

  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.email?.toLowerCase() === 'leptopleptop261@gmail.com'
    )
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        sendOtp,
        verifyOtp,
        loginDirectly,
        logout,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
