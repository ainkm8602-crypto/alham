import re

with open("src/components/AuthModal.tsx", "r") as f:
    content = f.read()

# Import useTracking
content = content.replace("import { useAuth } from '../context/AuthContext';", "import { useAuth } from '../context/AuthContext';\nimport { useTracking } from './TrackingProvider';")

content = content.replace("export const AuthModal: React.FC = () => {", "export const AuthModal: React.FC = () => {\n  const { trackEvent } = useTracking();")

# Verify OTP
verify_code = """
    if (res.success) {
      setErrorMessage('');
      trackEvent('login', { method: 'Email OTP' });
"""
content = content.replace("if (res.success) {\n      setErrorMessage('');", verify_code)

with open("src/components/AuthModal.tsx", "w") as f:
    f.write(content)
