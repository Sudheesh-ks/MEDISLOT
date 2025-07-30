import { useContext } from 'react';
import { assets } from '../../assets/admin/assets';
import { DoctorContext } from '../../context/DoctorContext';
import { useNavigate } from 'react-router-dom';
import { logoutDoctorAPI } from '../../services/doctorServices';
import { clearDoctorAccessToken } from '../../context/tokenManagerDoctor';

const DoctorNavbar = () => {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error('DoctorContext missing');

  const { setDToken, profileData } = ctx;
  const nav = useNavigate();

  const logout = async () => {
    try {
      await logoutDoctorAPI();
      setDToken('');
      localStorage.removeItem('doctorAccessToken');
      localStorage.setItem('isDoctorLoggedOut', 'true');
      clearDoctorAccessToken();
      nav('/doctor/login');
    } catch (err) {
      console.error('Doctor logout failed:', err);
    }
  };

  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';

  return (
    <header
      className={`sticky top-0 z-40 flex justify-between items-center px-4 sm:px-10 py-3 ${glass}`}
    >
      <div className="flex items-center gap-3">
        <img
          src={assets.logo_dark ?? assets.logo}
          className="w-32 sm:w-40 cursor-pointer"
        />
        <span className="px-2.5 py-0.5 rounded-full ring-1 ring-white/20 text-xs font-medium text-slate-100 bg-white/10">
          Doctor
        </span>

        {profileData?.status === 'pending' && (
          <span className="ml-3 px-3 py-1 text-xs font-semibold bg-yellow-400/20 text-yellow-300 ring-1 ring-yellow-400/40 rounded-full animate-pulse">
            ⏳ Waiting for approval
          </span>
        )}
        {profileData?.status === 'rejected' && (
          <span className="ml-3 px-3 py-1 text-xs font-semibold bg-red-400/20 text-red-300 ring-1 ring-red-400/40 rounded-full">
            ❌ Registration rejected
          </span>
        )}
      </div>

      <button
        onClick={logout}
        className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white text-sm px-8 py-2 rounded-full shadow hover:-translate-y-0.5 transition-transform"
      >
        Logout
      </button>
    </header>
  );
};

export default DoctorNavbar;
