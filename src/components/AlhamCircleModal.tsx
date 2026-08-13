import React, { useState } from 'react';
import { Sparkles, X, Mail, CheckCircle2 } from 'lucide-react';

interface AlhamCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlhamCircleModal: React.FC<AlhamCircleModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#29231F]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#F7F2E8] border border-[#E8DCC8] rounded-2xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#29231F] hover:bg-[#E8DCC8] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div className="space-y-4 text-center">
            <div className="p-3 bg-[#6F7655]/10 text-[#6F7655] w-fit mx-auto rounded-full">
              <Sparkles className="w-6 h-6 text-[#A86445]" />
            </div>

            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-[#A86445]">
                Inner Membership
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#29231F] mt-1">
                The Alham Circle
              </h2>
            </div>

            <p className="text-xs text-[#29231F]/80 leading-relaxed font-sans">
              Join our private circle of mindful food enthusiasts. Be first to access limited-run seasonal dates, secret recipe tastings, and exclusive gifts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 pt-2 text-left">
              <div>
                <label className="block text-xs font-medium text-[#29231F] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farhana Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCC8] bg-white text-xs text-[#29231F] focus:outline-none focus:border-[#6F7655]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#29231F] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCC8] bg-white text-xs text-[#29231F] focus:outline-none focus:border-[#6F7655]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#6F7655] hover:bg-[#29231F] text-white text-xs font-bold rounded-xl transition-all shadow-md mt-2"
              >
                Join The Circle
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="p-3 bg-[#6F7655] text-white w-fit mx-auto rounded-full">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#29231F]">
              Welcome to The Circle, {name || 'Friend'}!
            </h3>
            <p className="text-xs text-[#29231F]/80">
              You're now subscribed to secret batch announcements and seasonal release invites.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#A86445] text-white rounded-xl text-xs font-semibold hover:bg-[#29231F] transition-colors"
            >
              Continue Exploring
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
