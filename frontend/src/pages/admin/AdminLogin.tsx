import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';
import { adminLoginAPI } from '../../services/adminServices';
import { showErrorToast } from '../../utils/errorHandler';
import { assets } from '../../assets/user/assets';
import { updateAdminAccessToken } from '../../context/tokenManagerAdmin';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const adminContext = useContext(AdminContext);
  if (!adminContext) throw new Error('AdminContext must be used within AdminContextProvider');
  const { aToken, setAToken } = adminContext;

  useEffect(() => {
    if (aToken) navigate('/admin/dashboard');
  }, [aToken, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await adminLoginAPI(email, password);
      if (data.success) {
        updateAdminAccessToken(data.token);
        setAToken(data.token);
        localStorage.removeItem('isAdminLoggedOut');
        toast.success('Login successful');
        navigate('/admin/dashboard');
      } else toast.error(data.message);
    } catch (err) {
      showErrorToast(err);
    }
  };

  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
  const input =
    'border-none ring-1 ring-white/10 rounded w-full px-4 py-2 mt-1 bg-transparent text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const btn =
    'bg-gradient-to-r from-indigo-500 to-fuchsia-600 w-full py-2 rounded-md text-base hover:-translate-y-0.5 transition-transform disabled:opacity-60';

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="absolute -top-16 -left-16 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <form onSubmit={handleSubmit}>
        <div className={`flex flex-col sm:flex-row ${glass} shadow-xl rounded-3xl overflow-hidden`}>
          <div className="hidden sm:block w-full sm:w-96 shrink-0">
            <img
              src={assets.about_image}
              alt="Admin Login Visual"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4 p-8 min-w-[340px] sm:min-w-96">
            <h1 className="text-2xl font-semibold text-center bg-gradient-to-r from-indigo-400 to-fuchsia-500 bg-clip-text text-transparent">
              Admin&nbsp;Login
            </h1>

            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                required
                className={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@medislot.com"
              />
            </div>

            <div>
              <label className="text-sm">Password</label>
              <input
                type="password"
                required
                className={input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button className={btn}>Login</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
