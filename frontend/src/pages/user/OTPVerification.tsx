import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserContext } from '../../context/UserContext';
import { resendOtpAPI, verifyOtpAPI } from '../../services/authServices';

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('OtpVerification must be within UserContext');
  const { token, setToken, loadUserProfileData } = ctx;

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const temp = JSON.parse(localStorage.getItem('tempUserData') || '{}');
    if (!temp.email || !temp.purpose) navigate('/login');
    else {
      setEmail(temp.email);
      setPurpose(temp.purpose);
    }
  }, []);

  useEffect(() => {
    if (timer === 0) return setCanResend(true);
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleChange = (i: number, v: string) => {
    if (/^\d?$/.test(v)) {
      const next = [...otp];
      next[i] = v;
      setOtp(next);
      if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return setError('Enter the 6‑digit code');

    try {
      const { data } = await verifyOtpAPI(email, code);
      if (!data.success) return toast.error(data.message);

      if (purpose === 'register') {
        localStorage.removeItem('tempUserData');
        setToken(data.token);
        loadUserProfileData();
        toast.success('Account created successfully');
        navigate('/home');
      } else {
        toast.success('OTP verified');
        navigate('/reset-password');
      }
    } catch {
      toast.error('Failed to verify OTP');
    }
  };

  const resendOtp = async () => {
    if (!canResend) return;
    try {
      const { data } = await resendOtpAPI(email);
      if (data.success) {
        toast.success('OTP resent to email');
        setTimer(60);
        setCanResend(false);
      } else toast.error(data.message);
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  useEffect(() => {
    if (token) navigate('/home');
  }, [token, navigate]);

  const inputBox =
    'w-12 h-12 text-center text-xl bg-transparent ring-1 ring-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500';
  const primaryBtn =
    'w-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 py-2 rounded-md text-base hover:-translate-y-0.5 transition-transform';

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center"
    >
      <div className="w-full max-w-sm bg-white/5 backdrop-blur ring-1 ring-white/10 p-8 rounded-3xl space-y-6 shadow-lg">
        <h1 className="text-2xl font-semibold">Enter Verification Code</h1>
        <p className="text-slate-400">
          We’ve sent a 6‑digit code to <span className="text-cyan-400">{email}</span>
        </p>

        <div>
          <label className="block mb-2 text-sm">Verification Code</label>
          <div className="flex gap-3 justify-center">
            {otp.map((d, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                className={inputBox}
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>

        <button type="submit" className={primaryBtn}>
          Verify Code
        </button>

        <p className="text-center text-sm">
          Didn’t receive a code?{' '}
          <span
            className={canResend ? 'text-cyan-400 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
            onClick={resendOtp}
          >
            Resend {canResend ? '' : `in ${timer}s`}
          </span>
        </p>
      </div>
    </form>
  );
};

export default OtpVerificationPage;
