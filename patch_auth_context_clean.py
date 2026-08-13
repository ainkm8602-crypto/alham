import re

with open("src/context/AuthContext.tsx", "r") as f:
    content = f.read()

old_verify = """  const verifyOtp = async (email: string, code: string) => {
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
  };"""

new_verify = """  const verifyOtp = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('alham_user', JSON.stringify(data.user));
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
  };"""

content = content.replace(old_verify, new_verify)

# Also update useEffect to check localStorage
old_effect = """  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {"""

new_effect = """  useEffect(() => {
    const savedUser = localStorage.getItem('alham_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setIsLoading(false);
      } catch (e) {
        localStorage.removeItem('alham_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {"""

content = content.replace(old_effect, new_effect)

# Update logout
old_logout = """  const logout = async () => {
    await firebaseSignOut(auth);
  };"""

new_logout = """  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {}
    localStorage.removeItem('alham_user');
    setCurrentUser(null);
  };"""

content = content.replace(old_logout, new_logout)

with open("src/context/AuthContext.tsx", "w") as f:
    f.write(content)
