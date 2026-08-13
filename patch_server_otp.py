import re

with open("server.ts", "r") as f:
    content = f.read()

# Make sure crypto is imported
if "import crypto from 'crypto';" not in content:
    content = content.replace("import express from 'express';", "import express from 'express';\nimport crypto from 'crypto';")

# Update /api/auth/verify-otp
verify_otp_regex = r"app\.post\('/api/auth/verify-otp', \(req, res\) => \{.*?\n\s+if \(stored\.code !== code\.trim\(\)\) \{.*?\n\s+\}\n"
verify_otp_replacement = """app.post('/api/auth/verify-otp', (req, res) => {
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
    user = {
      id: crypto.randomUUID(), // This will be replaced by Firebase UID on the frontend
      email: normalizedEmail,
      name: stored.name || 'Customer',
      role: 'customer',
      rewardPoints: 0,
      createdAt: new Date().toISOString()
    };
    dbState.users.push(user);
    saveDb();
  }

  res.json({ success: true, user, token: deterministicPassword });
"""
content = re.sub(verify_otp_regex, verify_otp_replacement, content, flags=re.DOTALL)

with open("server.ts", "w") as f:
    f.write(content)
