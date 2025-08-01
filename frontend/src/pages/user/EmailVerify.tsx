import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserContext } from '../../context/UserContext';
import { verifyEmailAPI } from '../../services/authServices';
import { showErrorToast } from '../../utils/errorHandler';

const EmailVerificationPage = () => {
  const [email, setEmail] = useState('');
  const nav = useNavigate();
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('EmailVerificationPage must be used within UserContextProvider');
  const { token } = ctx;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await verifyEmailAPI(email);
      if (data.success) {
        toast.success('OTP sent to your email');
        localStorage.setItem('tempUserData', JSON.stringify({ email, purpose: 'reset-password' }));
        nav('/verify-otp');
      } else toast.error(data.message);
    } catch (err) {
      showErrorToast(err);
    }
  };

  useEffect(() => {
    if (token) nav('/');
  }, [token, nav]);

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 animate-fade">
      <form
        onSubmit={send}
        className="w-full max-w-sm bg-white/5 backdrop-blur ring-1 ring-white/10 p-8 rounded-3xl space-y-6"
      >
        <header className="space-y-2">
          <h1 className="text-2xl font-extrabold">Verify your email</h1>
          <p className="text-sm text-slate-400">Enter your email to receive a verification code.</p>
        </header>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent ring-1 ring-white/10 rounded-full px-4 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white py-3 rounded-full hover:-translate-y-0.5 transition-transform"
        >
          Send Verification Code
        </button>
      </form>
    </main>
  );
};
export default EmailVerificationPage;
