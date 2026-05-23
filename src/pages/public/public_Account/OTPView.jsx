import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AccountLayout from '../../../layout/account/AccountLayout';
import { Send, Smartphone, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

const OTPView = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(timer - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5 && e.target.nextSibling) {
        e.target.nextSibling.focus();
      }
    } else if (value === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock verification
    if (otp.join('').length === 6) {
      navigate('/dashboard'); // Proceed to user dashboard
    }
  };

  return (
    <AccountLayout
      title="OTP Verification"
      sub="We have sent a code to your registered email/phone"
      showHome={false}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="bg-teal/10 text-teal border-teal/20 mb-2 flex h-16 w-16 animate-pulse items-center justify-center rounded-full border">
          <ShieldCheck size={32} />
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="mx-auto flex max-w-[280px] justify-between gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="bg-navy3/40 focus:border-teal selection:bg-teal selection:text-navy h-12 w-10 rounded border border-white/5 text-center text-[1.2rem] font-bold text-white transition-all outline-none"
                required
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray2 text-[0.78rem] leading-relaxed">
              {timer > 0 ? (
                <>
                  Resend code in <strong className="text-teal">{timer}s</strong>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setTimer(59)}
                  className="text-teal hover:text-teal2 mx-auto flex items-center gap-1 font-bold"
                >
                  <RefreshCw size={12} /> Resend Now
                </button>
              )}
            </p>
          </div>

          <button
            type="submit"
            className="bg-teal hover:bg-teal2 text-navy flex w-full items-center justify-center gap-2 rounded px-4 py-3 text-[0.9rem] font-bold transition-all hover:scale-[1.01]"
          >
            Verify Code <ArrowRight size={18} />
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-gray/60 hover:text-teal text-[0.7rem] font-bold tracking-widest uppercase transition-colors"
            >
              Wrong Email? Change It
            </button>
          </div>
        </form>
      </div>
    </AccountLayout>
  );
};

export default OTPView;
