import re

with open("src/context/AuthContext.tsx", "r") as f:
    content = f.read()

# Add sendOtp and verifyOtp to context type
old_type = """  signInWithGoogle: () => Promise<void>;
  logout: () => void;"""

new_type = """  signInWithGoogle: () => Promise<void>;
  sendOtp: (email: string, name?: string) => Promise<{ success: boolean; message?: string; error?: string; resendDelivery?: any }>;
  verifyOtp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;"""
content = content.replace(old_type, new_type)

# Add sendOtp and verifyOtp implementations
old_methods = """  const signInWithGoogle = async () => {
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

  const sendOtp = async (email: string, name?: string) => {
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
      return { success: false, message: 'Failed to send OTP code.' };
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
      
      if (data.success && data.token) {
        // Authenticate with Firebase using deterministic password
        const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
        try {
          await signInWithEmailAndPassword(auth, email, data.token);
        } catch (error: any) {
          if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            await createUserWithEmailAndPassword(auth, email, data.token);
          } else {
            console.error("Firebase Auth Error:", error);
            throw error;
          }
        }
        setIsLoading(false);
        closeAuthModal();
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || 'Authentication failed' };
      }
    } catch (err: any) {
      setIsLoading(false);
      console.error(err);
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };"""
content = content.replace(old_methods, new_methods)

# Update return values
old_return = """        signInWithGoogle,
        logout,"""

new_return = """        signInWithGoogle,
        sendOtp,
        verifyOtp,
        logout,"""
content = content.replace(old_return, new_return)

with open("src/context/AuthContext.tsx", "w") as f:
    f.write(content)
