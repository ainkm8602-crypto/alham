import re

with open("server.ts", "r") as f:
    content = f.read()

# Let's extract the exact verify-otp route
start_str = "app.post('/api/auth/verify-otp'"
start_idx = content.find(start_str)

if start_idx != -1:
    # Find the matching closing bracket for app.post
    open_brackets = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '{':
            open_brackets += 1
        elif content[i] == '}':
            open_brackets -= 1
            if open_brackets == 0:
                # We found the end of the app.post block
                # Check if it is really the end by looking at the next characters (should be `);`)
                if content[i+1:i+3] == ');':
                    end_idx = i + 3
                    break
    
    if end_idx != -1:
        # We got the full block. Now we replace it entirely.
        old_block = content[start_idx:end_idx]
        new_block = """app.post('/api/auth/verify-otp', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and OTP verification code are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const stored = otpStore.get(normalizedEmail);

  if (!stored) {
    return res.status(400).json({ error: 'No active OTP found for this email. Please request a new verification code.' });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
  }

  if (stored.attempts >= 5) {
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ error: 'Too many invalid attempts. This verification code has been invalidated. Please request a new code.' });
  }

  if (stored.code !== code.trim()) {
    stored.attempts += 1;
    return res.status(400).json({
      error: `Invalid verification code. ${5 - stored.attempts} attempt(s) remaining.`
    });
  }

  // OTP is valid!
  otpStore.delete(normalizedEmail);

  // Generate deterministic password for Firebase Auth
  const SERVER_SECRET = 'ALHAM_SECRET_KEY_2026'; // Hardcoded for simplicity in this demo
  const deterministicPassword = crypto.createHash('sha256').update(normalizedEmail + SERVER_SECRET).digest('hex').substring(0, 20) + 'A1!';

  // Check if user exists in local db
  let user = dbState.users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    const isSuperAdmin = normalizedEmail === 'leptopleptop261@gmail.com';
    user = {
      id: crypto.randomUUID(), // This will be replaced by Firebase UID on the frontend later
      email: normalizedEmail,
      name: stored.name || (isSuperAdmin ? 'Jidan (Super Admin)' : 'Customer'),
      role: isSuperAdmin ? 'super_admin' : 'customer',
      rewardPoints: 0,
      createdAt: new Date().toISOString()
    };
    dbState.users.push(user);
    saveDb();
  }

  res.json({ success: true, user, token: deterministicPassword });
});"""
        content = content[:start_idx] + new_block + content[end_idx:]

with open("server.ts", "w") as f:
    f.write(content)

