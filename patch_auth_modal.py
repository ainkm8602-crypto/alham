import re

with open("src/components/AuthModal.tsx", "r") as f:
    content = f.read()

# Replace states and hooks
old_hooks = """  const { isAuthModalOpen, closeAuthModal, sendOtp, verifyOtp, isLoading } = useAuth();
  const { trackEvent } = useTracking();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [resendStatus, setResendStatus] = useState<{ sent: boolean; resendId?: string } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorMessage('');
    setSuccessNotice('');
    setResendStatus(null);

    const res = await sendOtp(email, name);
    if (res.success) {
      setSuccessNotice(res.message || `Verification code sent to ${email}`);
      if (res.resendDelivery) {
        setResendStatus({
          sent: res.resendDelivery.sent,
          resendId: res.resendDelivery.resendId
        });
      }
      setStep('otp');
    } else {
      setErrorMessage(res.error || res.message || 'Failed to send OTP code.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setErrorMessage('');

    const res = await verifyOtp(email, otpCode);
    if (res.success) {
      setErrorMessage('');
      trackEvent('login', { method: 'Email OTP' });
      setStep('email');
      setEmail('');
      setOtpCode('');
      setResendStatus(null);
    } else {
      setErrorMessage(res.error || 'Invalid verification code. Please check and try again.');
    }
  };"""

new_hooks = """  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, isLoading } = useAuth();
  const { trackEvent } = useTracking();

  if (!isAuthModalOpen) return null;"""

content = content.replace(old_hooks, new_hooks)

# Replace the JSX body
old_jsx_start = """        {/* Modal Header */}
        <div className="space-y-2 text-center">"""

content = content[:content.find(old_jsx_start)] + """        {/* Modal Header */}
        <div className="space-y-2 text-center">
          <div className="p-3 bg-[#6F7655]/10 text-[#6F7655] w-fit mx-auto rounded-full">
            <ShieldCheck className="w-6 h-6 text-[#A86445]" />
          </div>
          <h2 className="font-serif text-2xl font-light text-[#29231F]">
            Sign In / Account Access
          </h2>
          <p className="text-xs text-[#29231F]/70">
            Sign in securely with your Google account.
          </p>
        </div>

        <button
          onClick={async () => {
            await signInWithGoogle();
            trackEvent('login', { method: 'Google' });
          }}
          disabled={isLoading}
          className="w-full py-4 bg-[#6F7655] hover:bg-[#29231F] text-[#F7F2E8] text-xs uppercase tracking-widest font-bold rounded-full transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? 'Signing In...' : 'Sign In with Google'}
        </button>
      </div>
    </div>
  );
};"""

with open("src/components/AuthModal.tsx", "w") as f:
    f.write(content)
