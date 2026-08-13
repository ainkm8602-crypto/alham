import re

with open("src/context/AuthContext.tsx", "r") as f:
    content = f.read()

# Add imports
content = content.replace("import React, { createContext, useContext, useState, useEffect } from 'react';", "import React, { createContext, useContext, useState, useEffect } from 'react';\nimport { auth, db } from '../firebase';\nimport { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';\nimport { doc, getDoc, setDoc } from 'firebase/firestore';")

# Replace context type
old_type = """  sendOtp: (email: string, name?: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    role?: string;
    resendDelivery?: {
      sent: boolean;
      simulated: boolean;
      resendId?: string;
      notice?: string;
    };
  }>;
  verifyOtp: (email: string, code: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;"""

new_type = """  signInWithGoogle: () => Promise<void>;
  logout: () => void;"""

content = content.replace(old_type, new_type)

# Update state initialization
old_state = """  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('alham_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('alham_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('alham_user');
    }
  }, [currentUser]);"""

new_state = """  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as User);
          } else {
            // Create user
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Customer',
              role: 'customer',
              rewardPoints: 0
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setCurrentUser(newUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);"""

content = content.replace(old_state, new_state)

# Replace methods
old_methods = """  const sendOtp = async (email: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: 'Failed to send OTP code. Please check your connection.' };
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      setIsLoading(false);
      if (data.success && data.user) {
        setCurrentUser(data.user);
        closeAuthModal();
      }
      return data;
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: 'Authentication failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };"""

new_methods = """  const signInWithGoogle = async () => {
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

  const logout = async () => {
    await firebaseSignOut(auth);
  };"""

content = content.replace(old_methods, new_methods)

# Update return value
old_return = """        sendOtp,
        verifyOtp,
        logout,"""

new_return = """        signInWithGoogle,
        logout,"""

content = content.replace(old_return, new_return)

with open("src/context/AuthContext.tsx", "w") as f:
    f.write(content)
