import React, { useContext, useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { loginUserAPI, registerUserAPI } from '../../services/authServices';
import LoadingButton from '../../components/common/LoadingButton';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';
import { assets } from '../../assets/user/assets';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(4, 'Full name must be at least 4 characters')
    .max(50, 'Full name must be less than 50 characters')
    .when('isSignup', {
      is: true,
      then: (schema) => schema.required('Full name is required'),
    }),
  email: Yup.string().email('Please enter a valid email address').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])/, 'At least one lowercase letter')
    .matches(/^(?=.*[A-Z])/, 'At least one uppercase letter')
    .matches(/^(?=.*\d)/, 'At least one number')
    .matches(/^(?=.*[@$!%*?&])/, 'At least one special character (@$!%*?&)')
    .required('Password is required'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(UserContext);
  if (!context) throw new Error('Login must be used within UserContextProvider');
  const { backendUrl, token, setToken, loadUserProfileData } = context;

  const [state, setState] = useState<'Sign Up' | 'Login'>('Sign Up');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const inputStyle =
    'w-full bg-transparent ring-1 ring-white/10 rounded px-4 py-2 mt-1 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500';
  const card =
    'flex flex-col sm:flex-row bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-xl overflow-hidden';
  const gradientBtn =
    'bg-gradient-to-r from-cyan-500 to-blue-600 text-white w-full py-2 rounded-md text-base hover:-translate-y-0.5 transition-transform';

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (state === 'Sign Up') {
        const { data } = await registerUserAPI(values.name, values.email, values.password);
        if (data.success) {
          localStorage.setItem(
            'tempUserData',
            JSON.stringify({ email: values.email, name: values.name, purpose: 'register' })
          );
          toast.success('OTP sent to your email');
          navigate('/verify-otp');
        } else toast.error(data.message);
      } else {
        const { data } = await loginUserAPI(values.email, values.password);
        if (data.success) {
          setToken(data.token);
          localStorage.removeItem('isUserLoggedOut');
          loadUserProfileData();
          toast.success('Login successful');
          navigate('/home');
        } else toast.error(data.message);
      }
    } catch (err) {
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate('/home');
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative">
      <div
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 shadow hover:-translate-y-0.5 transition cursor-pointer"
      >
        🏠 <span className="hidden sm:inline">Back to Home</span>
      </div>
      <Formik
        initialValues={{ name: '', email: '', password: '', isSignup: state === 'Sign Up' }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className={card}>
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
                Please {state === 'Sign Up' ? 'sign up' : 'login'} to book appointment
              </p>

              {state === 'Sign Up' && (
                <div>
                  <label className="text-sm">Full Name</label>
                  <Field name="name" className={inputStyle} />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              )}

              <div>
                <label className="text-sm">Email</label>
                <Field type="email" name="email" className={inputStyle} />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              <div>
                <label className="text-sm">Password</label>
                <Field type="password" name="password" className={inputStyle} />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {state === 'Login' && (
                <div className="text-right text-xs">
                  <span
                    onClick={() => navigate('/verify-email')}
                    className="text-cyan-400 cursor-pointer hover:underline"
                  >
                    Forgot Password?
                  </span>
                </div>
              )}

              <LoadingButton
                text={state === 'Sign Up' ? 'Create Account' : 'Login'}
                type="submit"
                loading={loading || isSubmitting}
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
                    Are you here for the first time?{' '}
                    <span
                      onClick={() => setState('Sign Up')}
                      className="text-cyan-400 cursor-pointer underline"
                    >
                      Create Account
                    </span>
                  </>
                )}
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
