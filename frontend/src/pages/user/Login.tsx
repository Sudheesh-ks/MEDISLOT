import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../../assets/user/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { isValidEmail, isValidPassword } from '../../utils/validator';
import { loginUserAPI, registerUserAPI } from '../../services/authServices';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';
import LoadingButton from '../../components/common/LoadingButton';

const Login: React.FC = () => {
  const nav = useNavigate();
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('Login must be used within AppContextProvider');
  const { backendUrl, token, setToken, loadUserProfileData } = ctx;

  const [state, setState] = useState<'Sign Up' | 'Login'>('Sign Up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (state === 'Sign Up' && !name))
      return toast.error('Please fill in all required fields.');

    if (!isValidEmail(email)) return toast.error('Enter a valid email.');
    if (!isValidPassword(password))
      return toast.error(
        'Password must be ≥ 8 chars, incl. 1 number & 1 symbol.'
      );

    try {
      setLoading(true);
      if (state === 'Sign Up') {
        const { data } = await registerUserAPI(name, email, password);
        if (data.success) {
          localStorage.setItem(
            'tempUserData',
            JSON.stringify({ email, name, purpose: 'register' })
          );
          toast.success('OTP sent to your email');
          nav('/verify-otp');
        } else toast.error(data.message);
      } else {
        const { data } = await loginUserAPI(email, password);
        if (data.success) {
          setToken(data.token);
          localStorage.removeItem('isUserLoggedOut');
          loadUserProfileData();
          toast.success('Login successful');
          nav('/home');
        } else toast.error(data.message);
      }
    } catch (err) {
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) nav('/home');
  }, [token, nav]);

  const inputStyle =
    'w-full bg-transparent ring-1 ring-white/10 rounded px-4 py-2 mt-1 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500';
  const card =
    'flex flex-col sm:flex-row bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-xl overflow-hidden';
  const gradientBtn =
    'bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white w-full py-2 rounded-md text-base hover:-translate-y-0.5 transition-transform';

  return (
    <form
      onSubmit={onSubmit}
      className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative"
    >
      <button
        type="button"
        onClick={() => nav('/')}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/10 hover:bg-white/20 transition"
      >
        🏠 <span className="text-sm hidden sm:inline">Back to Home</span>
      </button>

      <div className={card}>
        <div className="hidden sm:block w-96">
          <img
            src={assets.contact_image}
            alt="login visual"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-4 p-8 min-w-[320px] sm:min-w-96">
          <h2 className="text-2xl font-semibold">
            {state === 'Sign Up' ? 'Create Account' : 'Login'}
          </h2>
          <p className="text-slate-400">
            Please {state === 'Sign Up' ? 'sign up' : 'login'} to book
            appointment
          </p>

          {state === 'Sign Up' && (
            <div>
              <label className="text-sm">Full Name</label>
              <input
                className={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              className={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm">Password</label>
            <input
              type="password"
              className={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {state === 'Login' && (
            <div className="text-right text-xs">
              <span
                onClick={() => nav('/verify-email')}
                className="text-cyan-400 cursor-pointer hover:underline"
              >
                Forgot Password?
              </span>
            </div>
          )}

          <LoadingButton
            text={state === 'Sign Up' ? 'Create Account' : 'Login'}
            type="submit"
            loading={loading}
            className={gradientBtn}
          />

          <LoadingButton
            text={
              <span className="flex items-center gap-2">
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  className="w-5 h-5"
                />
                Continue with Google
              </span>
            }
            type="button"
            loading={googleLoading}
            onClick={() => {
              setGoogleLoading(true);
              window.location.href = `${backendUrl}/api/auth/google`;
            }}
            className="w-full bg-white/5 backdrop-blur ring-1 ring-white/10 text-slate-100 py-2 rounded-md hover:bg-white/10"
          />

          <p className="text-sm text-center mt-2">
            {state === 'Sign Up' ? (
              <>
                Already have an account?{' '}
                <span
                  onClick={() => setState('Login')}
                  className="text-cyan-400 cursor-pointer underline"
                >
                  Login here
                </span>
              </>
            ) : (
              <>
                New here?{' '}
                <span
                  onClick={() => setState('Sign Up')}
                  className="text-cyan-400 cursor-pointer underline"
                >
                  Create one
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </form>
  );
};

export default Login;
