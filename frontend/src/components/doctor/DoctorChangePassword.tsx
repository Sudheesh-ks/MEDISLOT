import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';
import { changeDoctorPasswordAPI } from '../../services/doctorServices';
import { DoctorContext } from '../../context/DoctorContext';

const DoctorChangePassword = () => {
  const context = useContext(DoctorContext);
  if (!context) throw new Error('Change Password must be used within an UserContextProvider');
  const { dToken } = context;

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    try {
      const res = await changeDoctorPasswordAPI(dToken!, oldPassword, newPassword);
      if (res.success) {
        toast.success('Password updated successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-300">Current Password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Update Password
      </button>
    </form>
  );
};

export default DoctorChangePassword;
