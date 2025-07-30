import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { resetPasswordAPI } from '../../services/authServices';
import axios from 'axios';

const NewPasswordPage = () => {
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('NewPasswordPage must be in AppContext');
  const { token } = ctx;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    try {
      const tmp = JSON.parse(localStorage.getItem('tempUserData') || '{}');
      const { data } = await resetPasswordAPI(tmp.email, password);
      if (data.success) {
        toast.success('Password reset successful');
        localStorage.removeItem('tempUserData');
        nav('/login');
      } else toast.error(data.message);
    } catch (err) {
      if (axios.isAxiosError(err))
        toast.error(err.response?.data?.message || 'Something went wrong');
      else if (err instanceof Error) toast.error(err.message);
      else toast.error('Unknown error');
    }
  };

  useEffect(() => {
    if (token) nav('/');
  }, [token, nav]);

  const input =
    'w-full bg-transparent ring-1 ring-white/10 rounded px-4 py-2 mt-1 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500';
  const btn =
    'w-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 py-2 rounded-md text-base hover:-translate-y-0.5 transition-transform';

  return (
    <form
      onSubmit={submit}
      className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center"
    >
      <div className="w-full max-w-sm bg-white/5 backdrop-blur ring-1 ring-white/10 p-8 rounded-3xl space-y-6 shadow-lg">
        <h1 className="text-2xl font-semibold">Set New Password</h1>
        <p className="text-slate-400">Create a strong password for your account</p>

        <div>
          <label className="text-sm">New Password</label>
          <input
            type="password"
            required
            className={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">Confirm Password</label>
          <input
            type="password"
            required
            className={input}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <button type="submit" className={btn}>
          Set New Password
        </button>
      </div>
    </form>
  );
};
export default NewPasswordPage;