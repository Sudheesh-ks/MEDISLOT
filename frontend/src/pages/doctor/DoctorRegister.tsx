import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../../assets/admin/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerDoctorAPI } from '../../services/doctorServices';
import { showErrorToast } from '../../utils/errorHandler';
import { isValidEmail, isValidName, isValidPassword } from '../../utils/validator';
import { DoctorContext } from '../../context/DoctorContext';

const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
const inputCls =
  'w-full bg-transparent ring-1 ring-white/10 rounded px-3 py-1.5 text-sm ' +
  'placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500';
const labelCls = 'block mb-1 font-medium text-slate-300';

const InputField = ({
  id,
  label,
  value,
  setValue,
  type = 'text',
}: {
  id: string;
  label: string;
  value: string;
  setValue: (v: string) => void;
  type?: string;
}) => (
  <div>
    <label htmlFor={id} className={labelCls}>
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={inputCls}
      placeholder={label}
      autoComplete="off"
    />
  </div>
);

const SelectField = ({
  id,
  label,
  value,
  setValue,
  options,
}: {
  id: string;
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
}) => (
  <div>
    <label htmlFor={id} className={labelCls}>
      {label}
    </label>
    <select id={id} value={value} onChange={(e) => setValue(e.target.value)} className={inputCls}>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

const DoctorRegister = () => {
  const [docImg, setDocImg] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState('1 Year');
  const [fees, setFees] = useState('');
  const [about, setAbout] = useState('');
  const [speciality, setSpeciality] = useState('General physician');
  const [degree, setDegree] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [certificate, setCertificate] = useState<File | null>(null);

  const nav = useNavigate();
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error('DoctorContext required');
  const { dToken } = ctx;

  useEffect(() => {
    if (dToken) nav('/doctor/dashboard');
  }, [dToken]);

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!docImg) return toast.error('Please upload a profile image');
    if (!docImg.type.startsWith('image/'))
      return toast.error('Uploaded file must be an image (jpg, png, …)');
    if (!name || !email || !password || !fees || !about || !degree || !address1)
      return toast.error('Please fill in all required fields');
    if (!isValidName(name)) return toast.error('Name must be ≥ 4 chars');
    if (!isValidEmail(email)) return toast.error('Enter a valid email');
    if (!isValidPassword(password))
      return toast.error('Password must be ≥ 8 chars, incl. number & symbol');
    if (!certificate) return toast.error('Please upload a certificate');

    try {
      const fd = new FormData();
      fd.append('image', docImg);
      fd.append('name', name);
      fd.append('email', email);
      fd.append('password', password);
      fd.append('experience', experience);
      fd.append('fees', fees);
      fd.append('about', about);
      fd.append('speciality', speciality);
      fd.append('degree', degree);
      fd.append('address', JSON.stringify({ line1: address1, line2: address2 }));
      fd.append('certificate', certificate);

      const { data } = await registerDoctorAPI(fd);
      if (data.success) {
        toast.success(data.message);
        nav('/doctor/login');
      } else toast.error(data.message);
    } catch (err) {
      showErrorToast(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div
        onClick={() => nav('/')}
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 shadow hover:-translate-y-0.5 transition cursor-pointer"
      >
        🏠 <span className="hidden sm:inline">Back to Home</span>
      </div>

      <div className={`w-full max-w-5xl ${glass} rounded-3xl p-6 shadow-xl`}>
        <h2 className="text-2xl font-semibold text-center mb-6">Doctor Registration</h2>

        <form onSubmit={onSubmitHandler} className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField id="name" label="Full Name" value={name} setValue={setName} />
            <InputField id="email" label="Email" value={email} setValue={setEmail} type="email" />
            <InputField
              id="password"
              label="Password"
              value={password}
              setValue={setPassword}
              type="password"
            />
            <SelectField
              id="experience"
              label="Experience"
              value={experience}
              setValue={setExperience}
              options={Array.from({ length: 15 }, (_, i) => `${i + 1} Year${i ? 's' : ''}`)}
            />
            <SelectField
              id="speciality"
              label="Speciality"
              value={speciality}
              setValue={setSpeciality}
              options={[
                'General physician',
                'Gynecologist',
                'Dermatologist',
                'Pediatrician',
                'Neurologist',
                'Gastroenterologist',
              ]}
            />
            <InputField id="degree" label="Degree" value={degree} setValue={setDegree} />
            <InputField id="fees" label="Fees (₹)" value={fees} setValue={setFees} type="number" />
            <InputField id="addr1" label="Address Line 1" value={address1} setValue={setAddress1} />
            <InputField id="addr2" label="Address Line 2" value={address2} setValue={setAddress2} />
          </div>

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

          <div>
            <label htmlFor="about" className={labelCls}>
              About You
            </label>
            <textarea
              id="about"
              className={`${inputCls} h-24`}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Write about your experience, certifications..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-2 rounded-full hover:-translate-y-0.5 transition-transform shadow-lg"
            >
              Register
            </button>
          </div>

          <p className="text-center text-sm">
            Already registered?{' '}
            <span
              onClick={() => nav('/doctor/login')}
              className="text-cyan-400 underline cursor-pointer hover:text-cyan-300"
            >
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegister;
