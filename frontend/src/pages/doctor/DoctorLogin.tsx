import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DoctorContext } from '../../context/DoctorContext';
import { doctorLoginAPI } from '../../services/doctorServices';
import { showErrorToast } from '../../utils/errorHandler';
import { assets } from '../../assets/user/assets';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { updateAccessToken } from '../../context/tokenManagerContext';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const context = useContext(DoctorContext);
  if (!context) throw new Error('DoctorContext missing');
  const { dToken, setDToken, getProfileData } = context;

  useEffect(() => {
    if (dToken) navigate('/doctor/dashboard');
  }, [dToken]);

  const validationSchema = Yup.object({
    email: Yup.string().email('Please enter a valid email address').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])/, 'At least one lowercase letter')
      .matches(/^(?=.*[A-Z])/, 'At least one uppercase letter')
      .matches(/^(?=.*\d)/, 'At least one number')
      .matches(/^(?=.*[@$!%*?&])/, 'At least one special character (@$!%*?&)')
      .required('Password is required'),
  });

  const handleSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const { data } = await doctorLoginAPI(values.email, values.password);
      if (data.success) {
        updateAccessToken('DOCTOR', data.token);
        setDToken(data.token);
        localStorage.removeItem('isDoctorLoggedOut');
        getProfileData();
        toast.success('Login successful');
        navigate('/doctor/dashboard');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      showErrorToast(err);
    } finally {
      setSubmitting(false);
    }
  };

  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
  const input =
    'w-full bg-transparent ring-1 ring-white/10 rounded px-4 py-2 mt-1 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500';
  const btn =
    'w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-2 rounded-md text-base hover:-translate-y-0.5 transition-transform';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative">
      <div
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-400 font-medium shadow-md hover:bg-cyan-500/30 cursor-pointer"
      >
        <span className="text-lg">🏠</span>
        <span className="text-sm sm:text-base">Back to Home</span>
      </div>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="w-full max-w-lg flex flex-col sm:flex-row rounded-3xl overflow-hidden shadow-xl">
            <div className="hidden sm:block w-1/2">
              <img src={assets.about_image} className="w-full h-full object-cover" />
            </div>

            <div className={`flex-1 p-8 space-y-6 ${glass}`}>
              <h1 className="text-2xl font-semibold text-center text-cyan-400">Doctor Login</h1>

              <div>
                <label className="text-sm">Email</label>
                <Field type="email" name="email" className={input} />
                <ErrorMessage name="email" component="div" className="text-red-400 text-sm mt-1" />
              </div>

              <div>
                <label className="text-sm">Password</label>
                <Field type="password" name="password" className={input} />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-400 text-sm mt-1"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className={btn}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DoctorLogin;
