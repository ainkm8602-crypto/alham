import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTracking } from './TrackingProvider';
import { X, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  onNavigate?: (view: 'home' | 'collection' | 'ingredients' | 'philosophy' | 'recipes' | 'account' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onNavigate }) => {
  const { trackEvent } = useTracking();
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, sendOtp, verifyOtp, isLoading } = useAuth();
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
      if (res.instantLogin && res.user) {
        const isAdminUser = 
          res.user.role === 'super_admin' || 
          res.user.role === 'admin' || 
          res.user.email?.toLowerCase() === 'leptopleptop261@gmail.com';

        trackEvent('login', { method: 'Instant Admin Login', role: 'super_admin' });
        setStep('email');
        setEmail('');
        setName('');
        setOtpCode('');
        setErrorMessage('');
        setResendStatus(null);

        const targetView = isAdminUser ? 'admin' : 'account';
        if (onNavigate) {
          onNavigate(targetView);
        } else {
          const newPath = `/${targetView}`;
          window.history.pushState({ view: targetView }, '', newPath);
          window.dispatchEvent(new PopStateEvent('popstate', { state: { view: targetView } }));
        }
        return;
      }

      setSuccessNotice(res.message || `Verification code sent to ${email}`);
      
      if (res.resendDelivery) {
        setResendStatus({
          sent: res.resendDelivery.sent,
          resendId: res.resendDelivery.resendId
        });
      }
      setStep('otp');
    } else {
      setErrorMessage(res.error || res.message || 'Failed to authenticate.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setErrorMessage('');

    const res = await verifyOtp(email, otpCode);
    if (res.success && res.user) {
      setErrorMessage('');
      const isAdminUser = 
        res.user.role === 'super_admin' || 
        res.user.role === 'admin' || 
        res.user.email?.toLowerCase() === 'leptopleptop261@gmail.com';

      trackEvent('login', { method: 'Email OTP', role: isAdminUser ? 'super_admin' : 'customer' });
      setStep('email');
      setEmail('');
      setOtpCode('');
      setResendStatus(null);

      const targetView = isAdminUser ? 'admin' : 'account';
      if (onNavigate) {
        onNavigate(targetView);
      } else {
        const newPath = `/${targetView}`;
        window.history.pushState({ view: targetView }, '', newPath);
        window.dispatchEvent(new PopStateEvent('popstate', { state: { view: targetView } }));
      }
    } else {
      setErrorMessage(res.error || 'Invalid verification code. Please check and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#29231F]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#F7F2E8] border border-[#C8A96B44] rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5 text-left">
        
        {/* Close */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-[#29231F] hover:bg-[#E8DCC8] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 text-center">
          <div className="p-3 bg-[#6F7655]/10 text-[#6F7655] w-fit mx-auto rounded-full">
            <ShieldCheck className="w-6 h-6 text-[#A86445]" />
          </div>
          <h2 className="font-serif text-2xl font-light text-[#29231F]">
            {step === 'email' ? 'Sign In / Account Access' : 'Enter Verification Code'}
          </h2>
          <p className="text-xs text-[#29231F]/70">
            {step === 'email' 
              ? 'Enter your registered email address for passwordless OTP verification.'
              : `A 6-digit code was sent to ${email}`}
          </p>
        </div>

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#29231F] mb-1">Your Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Sultana Parveen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DCC8] bg-white text-xs text-[#29231F] focus:outline-none focus:border-[#6F7655]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#29231F] mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DCC8] bg-white text-xs text-[#29231F] focus:outline-none focus:border-[#6F7655]"
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#6F7655] hover:bg-[#29231F] text-[#F7F2E8] text-[11px] uppercase tracking-[0.15em] font-bold rounded-full transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Sending OTP Code...' : 'Send OTP Code'}
            </button>
            
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C8A96B]/30"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-[#F7F2E8] px-3 text-[#29231F]/50">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signInWithGoogle();
                trackEvent('login', { method: 'Google' });
              }}
              disabled={isLoading}
              className="w-full py-3.5 bg-white border border-[#C8A96B]/50 hover:bg-[#E8DCC8] text-[#29231F] text-[11px] uppercase tracking-[0.15em] font-bold rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Sign In with Google
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {successNotice && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{successNotice}</span>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-[#29231F] mb-1">Enter 6-Digit Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E8DCC8] bg-white text-center font-mono text-xl font-bold tracking-widest text-[#29231F] focus:outline-none focus:border-[#6F7655]"
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#6F7655] hover:bg-[#29231F] text-[#F7F2E8] text-[11px] uppercase tracking-[0.15em] font-bold rounded-full transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="text-[11px] text-[#6F7655] font-bold underline hover:text-[#A86445]"
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setErrorMessage(''); }}
                className="text-[11px] text-[#A86445] underline font-medium"
              >
                Change email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
