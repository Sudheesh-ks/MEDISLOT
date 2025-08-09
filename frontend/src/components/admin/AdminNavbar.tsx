import { useContext } from 'react';
import { assets } from '../../assets/admin/assets';
import { AdminContext } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { clearAdminAccessToken } from '../../context/tokenManagerAdmin';
import { logoutAdminAPI } from '../../services/adminServices';
import NotificationBell from '../common/NotificationBell';

const AdminNavbar = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('AdminContext must be used within AdminContextProvider');

  const { setAToken } = ctx;
  const nav = useNavigate();

  const logout = async () => {
    try {
      await logoutAdminAPI();
      setAToken('');
      localStorage.setItem('isAdminLoggedOut', 'true');
      clearAdminAccessToken();
      nav('/admin/login');
    } catch (err) {
      console.error('Admin logout failed:', err);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 flex justify-between items-center px-4 sm:px-10 py-3
                       bg-white/5 backdrop-blur ring-1 ring-white/10 border-b border-white/10"
    >
      {/* logo */}
      <div className="flex items-center gap-3 text-xs">
        <img
          src={assets.logo}
          className="w-32 sm:w-40 cursor-pointer"
          onClick={() => nav('/admin/dashboard')}
        />
        <span className="px-3 py-0.5 rounded-full text-slate-200 bg-white/10 ring-1 ring-white/10">
          Admin
        </span>
      </div>

      {/* logout */}

      <div className="flex items-center gap-4">
        <NotificationBell role="admin" />
        <button
          onClick={logout}
          className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white text-sm px-8 py-2 rounded-full
                   hover:-translate-y-0.5 transition-transform shadow-lg"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
