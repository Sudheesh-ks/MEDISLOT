import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { assets } from '../../assets/user/assets';
import { showErrorToast } from '../../utils/errorHandler';
import { updateDoctorProfileAPI } from '../../services/doctorServices';
import { currencySymbol } from '../../utils/commonUtils';
import ReportBugModal from '../../components/user/BugReportModal';
import DoctorChangePasswordModal from '../../components/doctor/DoctorChangePasswordModal';
import {
  isValidAbout,
  isValidAddress,
  isValidDoctorName,
  isValidExperience,
  isValidFees,
  isValidShortText,
} from '../../utils/validator';

const DoctorProfile = () => {
  const context = useContext(DoctorContext);
  const navigate = useNavigate();
  if (!context) throw new Error('DoctorProfile within DoctorContext');

  const { dToken, profileData, getProfileData } = context;

  const [isEdit, setEdit] = useState(false);
  const [form, setForm] = useState(profileData);
  const [image, setImage] = useState<File | null>(null);
  const [avail, setAvail] = useState(profileData?.available ?? false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (dToken) getProfileData();
  }, [dToken]);
  useEffect(() => {
    if (!dToken) navigate('/doctor/login');
  }, [dToken]);
  useEffect(() => {
    setForm(profileData);
  }, [profileData]);

  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
  const input =
    'bg-transparent ring-1 ring-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500';
  const label = 'text-sm font-medium text-slate-400';

  const onField = (e: React.ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    setForm((p) => (p ? { ...p, [name]: value } : p));
  };
  const setAddr = (k: 'line1' | 'line2', v: string) =>
    setForm((p) => (p ? { ...p, address: { ...p.address, [k]: v } } : p));

  const save = async () => {
    try {
      if (!dToken) return toast.error('Login to continue');

      if (!form) return toast.error('Form data not found');

      if (!isValidDoctorName(form.name)) return toast.error('Name must be 4–50 characters');
      if (!isValidShortText(form.degree)) return toast.error('Degree must be 2–50 characters');
      if (!isValidShortText(form.speciality))
        return toast.error('Speciality must be 2–50 characters');
      if (!isValidExperience(form.experience)) return toast.error('Experience must need a number');
      if (!isValidFees(form.fees)) return toast.error('Fees must be a positive number');
      if (!isValidAbout(form.about)) return toast.error('About must be 10–500 characters');
      if (!isValidAddress(form.address.line1))
        return toast.error('Address Line 1 must be 4–50 characters');
      if (!isValidAddress(form.address.line2))
        return toast.error('Address Line 2 must be 4–50 characters');
      const { data } = await updateDoctorProfileAPI({ ...form, available: avail }, image);
      toast.success(data.message);
      await getProfileData();
      setEdit(false);
      setImage(null);
    } catch (err) {
      showErrorToast(err);
    }
  };

  if (profileData?.status === 'pending')
    return (
      <div className="m-5 text-center bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 text-yellow-200 shadow-md">
        <h2 className="text-xl font-semibold mb-2">⏳ Awaiting Approval</h2>
        <p>Your registration is under review. The admin has not approved your account yet.</p>
      </div>
    );
  if (profileData?.status === 'rejected')
    return (
      <div className="m-5 text-center bg-red-900/30 border border-red-600 rounded-xl p-6 text-red-300 shadow-md">
        <h2 className="text-xl font-semibold mb-2">❌ Registration Rejected</h2>
        <p>Please contact support or try registering again.</p>
      </div>
    );
  if (profileData?.status !== 'approved') return null;

  return profileData && form ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="m-5 grid grid-cols-1 sm:grid-cols-3 gap-8 text-slate-100"
    >
      <motion.div
        whileHover={{ scale: 1.04 }}
        className={`${glass} p-6 rounded-3xl flex justify-center items-center`}
      >
        {isEdit ? (
          <label htmlFor="doc-img" className="cursor-pointer relative">
            <img
              src={image ? URL.createObjectURL(image) : profileData.image}
              className="w-36 h-36 rounded-xl object-cover opacity-80 ring-1 ring-white/10"
            />
            {!image && <img src={assets.upload_icon} className="w-10 absolute bottom-2 right-2" />}
            <input
              id="doc-img"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>
        ) : (
          <img
            src={profileData.image}
            className="w-full bg-primary rounded-xl object-cover ring-1 ring-white/10"
          />
        )}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`sm:col-span-2 ${glass} p-8 rounded-3xl space-y-6`}
      >
        <div>
          {isEdit ? (
            <input
              name="name"
              value={form.name}
              onChange={onField}
              className={`text-3xl font-semibold ${input}`}
            />
          ) : (
            <h2 className="text-3xl font-semibold">{profileData.name}</h2>
          )}

          <div className="mt-1 text-slate-400">
            {isEdit ? (
              <>
                <input
                  name="degree"
                  value={form.degree}
                  onChange={onField}
                  className={`${input} mr-2`}
                  placeholder="Degree"
                />
                -
                <input
                  name="speciality"
                  value={form.speciality}
                  onChange={onField}
                  className={`${input} ml-2`}
                  placeholder="Speciality"
                />
              </>
            ) : (
              `${profileData.degree}  –  ${profileData.speciality}`
            )}
          </div>

          <div className="text-sm text-slate-500">
            Experience:&nbsp;
            {isEdit ? (
              <input
                name="experience"
                value={form.experience}
                onChange={onField}
                className={`${input} w-20`}
              />
            ) : (
              `${profileData.experience} years`
            )}
          </div>
        </div>

        <div>
          <p className="font-medium text-slate-300">About</p>
          {isEdit ? (
            <textarea
              name="about"
              value={form.about}
              onChange={onField}
              className={`${input} w-full mt-1`}
            />
          ) : (
            <p className="text-sm text-slate-400 mt-1">{profileData.about}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div>
            <span className="font-medium text-slate-300">Fee: </span>
            {isEdit ? (
              <input name="fees" value={form.fees} onChange={onField} className={`${input} w-24`} />
            ) : (
              <span className="text-slate-100">
                {currencySymbol}
                {profileData.fees}
              </span>
            )}
          </div>
          <div>
            {!isEdit && (
              <span className="ml-3 px-3 py-1 text-xs font-semibold bg-yellow-400/20 text-yellow-300 ring-1 ring-yellow-400/40 rounded-full animate-pulse">
                💰 20% of your appointment fee will be credited to admin.
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="font-medium text-slate-300">Address</p>
          {isEdit ? (
            <>
              <input
                value={form.address.line1}
                onChange={(e) => setAddr('line1', e.target.value)}
                className={`${input} w-full mt-1`}
              />
              <input
                value={form.address.line2}
                onChange={(e) => setAddr('line2', e.target.value)}
                className={`${input} w-full mt-2`}
              />
            </>
          ) : (
            <p className="text-sm text-slate-400 mt-1">
              {profileData.address.line1}
              <br />
              {profileData.address.line2}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className={label}>Available for Consultation</span>
          {isEdit ? (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={avail}
                onChange={(e) => setAvail(e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow transform transition peer-checked:translate-x-full"></div>
            </label>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                avail ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/40 text-slate-400'
              }`}
            >
              {avail ? 'Available' : 'Not Available'}
            </span>
          )}
        </div>

        {/* Add Report Bug Button */}
        <div className="mt-6 flex justify-end gap-3">
          <div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500"
            >
              Change Password
            </button>
          </div>
          <div>
            <button
              onClick={() => setShowBugModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
            >
              Report Bug
            </button>
          </div>
        </div>

        {/* Change Password Modal */}
        <DoctorChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />

        {/* Bug Modal */}
        <ReportBugModal
          token={dToken}
          isOpen={showBugModal}
          role="doctor"
          onClose={() => setShowBugModal(false)}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          className={`px-8 py-2 rounded-full ${
            isEdit
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white'
          } transition-transform`}
          onClick={
            isEdit
              ? save
              : () => {
                  setEdit(true);
                  setForm(profileData);
                }
          }
        >
          {isEdit ? 'Save Changes' : 'Edit Profile'}
        </motion.button>
      </motion.div>
    </motion.div>
  ) : null;
};

export default DoctorProfile;
