import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { DoctorContext } from '../../context/DoctorContext';
import { registerDoctorAPI } from '../../services/doctorServices';
import { showErrorToast } from '../../utils/errorHandler';
import { assets } from '../../assets/admin/assets';

const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
const inputCls =
  'w-full bg-transparent ring-1 ring-white/10 rounded px-3 py-1.5 text-sm ' +
  'placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500';
const labelCls = 'block mb-1 font-medium text-slate-300';

const validationSchema = Yup.object({
  name: Yup.string().min(4, 'Name must be at least 4 characters').required('Full name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])/, 'At least one lowercase letter')
    .matches(/^(?=.*[A-Z])/, 'At least one uppercase letter')
    .matches(/^(?=.*\d)/, 'At least one number')
    .matches(/^(?=.*[@$!%*?&])/, 'At least one special character (@$!%*?&)')
    .required('Password is required'),
  experience: Yup.string().required('Experience is required'),
  fees: Yup.number()
    .typeError('Must be a number')
    .positive('Must be positive')
    .required('Fees required'),
  speciality: Yup.string().required('Speciality is required'),
  degree: Yup.string().required('Degree is required'),
  address1: Yup.string().required('Address Line 1 is required'),
  address2: Yup.string(),
  about: Yup.string().required('About section is required'),
});

const DoctorRegister: React.FC = () => {
  const [docImg, setDocImg] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);

  const navigate = useNavigate();
  const context = useContext(DoctorContext);
  if (!context) throw new Error('DoctorContext required');
  const { dToken } = context;

  useEffect(() => {
    if (dToken) navigate('/doctor/dashboard');
  }, [dToken, navigate]);

  const handleSubmit = async (values: any) => {
    if (!docImg) return toast.error('Please upload a profile image');
    if (!docImg.type.startsWith('image/'))
      return toast.error('Uploaded file must be an image (jpg, png, …)');
    if (!certificate) return toast.error('Please upload a certificate');

    try {
      const fd = new FormData();
      fd.append('image', docImg);
      fd.append('certificate', certificate);
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'address1' || key === 'address2') return; // skip for now
        fd.append(key, value as string);
      });
      fd.append('address', JSON.stringify({ line1: values.address1, line2: values.address2 }));

      const { data } = await registerDoctorAPI(fd);
      if (data.success) {
        toast.success(data.message);
        navigate('/doctor/login');
      } else toast.error(data.message);
    } catch (err) {
      showErrorToast(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 shadow hover:-translate-y-0.5 transition cursor-pointer"
      >
        🏠 <span className="hidden sm:inline">Back to Home</span>
      </div>

      <div className={`w-full max-w-4xl ${glass} rounded-3xl p-6 shadow-xl`}>
        <h2 className="text-2xl font-semibold text-center mb-6">Doctor Registration</h2>

        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            experience: '1 Year',
            fees: '',
            about: '',
            speciality: 'General physician',
            degree: '',
            address1: '',
            address2: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center gap-4">
                <label htmlFor="doc-img" className="cursor-pointer">
                  <img
                    className="w-16 h-16 rounded-full object-cover ring-1 ring-white/10"
                    src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                    alt="upload"
                  />
                  <input
                    id="doc-img"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => e.target.files && setDocImg(e.target.files[0])}
                  />
                </label>
                <div className="text-xs text-slate-400">Click image to upload profile photo</div>
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <Field name="name" className={inputCls} placeholder="Full Name" />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <div>
                  <label className={labelCls}>Email</label>
                  <Field type="email" name="email" className={inputCls} placeholder="Email" />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className={labelCls}>Password</label>
                  <Field
                    type="password"
                    name="password"
                    className={inputCls}
                    placeholder="Password"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className={labelCls}>Experience</label>
                  <Field as="select" name="experience" className={inputCls}>
                    {Array.from({ length: 15 }, (_, i) => (
                      <option key={i}>{`${i + 1} Year${i ? 's' : ''}`}</option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="experience"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className={labelCls}>Speciality</label>
                  <Field as="select" name="speciality" className={inputCls}>
                    {[
                      'General physician',
                      'Gynecologist',
                      'Dermatologist',
                      'Pediatrician',
                      'Neurologist',
                      'Gastroenterologist',
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="speciality"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className={labelCls}>Degree</label>
                  <Field name="degree" className={inputCls} placeholder="Degree" />
                  <ErrorMessage
                    name="degree"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className={labelCls}>Fees (₹)</label>
                  <Field type="number" name="fees" className={inputCls} placeholder="Fees" />
                  <ErrorMessage name="fees" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <div>
                  <label className={labelCls}>Address Line 1</label>
                  <Field name="address1" className={inputCls} placeholder="Address Line 1" />
                  <ErrorMessage
                    name="address1"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className={labelCls}>Address Line 2</label>
                  <Field name="address2" className={inputCls} placeholder="Address Line 2" />
                  <ErrorMessage
                    name="address2"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>

              {/* Certificate Upload */}
              <div className="flex items-center gap-4">
                <label htmlFor="doc-cert" className="cursor-pointer">
                  <div className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-sm">
                    {certificate ? certificate.name : 'Upload Certificate'}
                  </div>
                  <input
                    id="doc-cert"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    hidden
                    onChange={(e) => e.target.files && setCertificate(e.target.files[0])}
                  />
                </label>
                <div className="text-xs text-slate-400">Upload medical license / certificate</div>
              </div>

              {/* About */}
              <div>
                <label className={labelCls}>About You</label>
                <Field
                  as="textarea"
                  name="about"
                  className={`${inputCls} h-24`}
                  placeholder="Write about your experience..."
                />
                <ErrorMessage name="about" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-2 rounded-full hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              </div>

              <p className="text-center text-sm">
                Already registered?{' '}
                <span
                  onClick={() => navigate('/doctor/login')}
                  className="text-cyan-400 underline cursor-pointer hover:text-cyan-300"
                >
                  Login here
                </span>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default DoctorRegister;
