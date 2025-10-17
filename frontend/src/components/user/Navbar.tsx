import { useContext, useState } from 'react';
import { assets } from '../../assets/user/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { logoutUserAPI } from '../../services/authServices';
import { NotifContext } from '../../context/NotificationContext';
import NotificationBell from '../common/NotificationBell';
import { clearAccessToken } from '../../context/tokenManagerContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const context = useContext(UserContext);
  const notif = useContext(NotifContext);
  if (!context) throw new Error('Navbar must be used within an UserContextProvider');
  const { token, setToken, userData, setUserData } = context;
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const logout = async () => {
    try {
      await logoutUserAPI();
      clearAccessToken('USER');
      setToken(null);
      setUserData(null);
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { to: '/home', label: 'Home' },
    { to: '/all-doctors', label: 'Doctors' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/blogs', label: 'Blogs' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm ring-1 ring-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-10 py-4">
        {/* Logo */}
        <img
          src={assets.logo_dark ?? assets.logo}
          alt="logo"
          className="w-36 cursor-pointer"
          onClick={() => navigate('/')}
        />

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-200">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${isActive ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`
              }
            >
              {label}
            </NavLink>
          ))}
        </ul>

        {/* Right side */}
        {token && userData ? (
          <div className="flex items-center gap-8">
            <NotificationBell />
            <div className="relative">
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2 text-slate-200"
              >
                <img src={userData.image} alt="avatar" className="w-8 h-8 rounded-full" />
                {notif && Object.values(notif.unread).some((v) => v > 0) && (
                  <span className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 bg-red-500 text-xs rounded-full flex items-center justify-center">
                    !
                  </span>
                )}
                <svg
                  className={`w-3 transition-transform ${profileOpen ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-44 rounded-xl bg-slate-800/90 ring-1 ring-white/10 backdrop-blur p-3 space-y-2"
                  >
                    <NavLink
                      to="/my-profile"
                      className="block text-slate-200 hover:text-white"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile
                    </NavLink>
                    <NavLink
                      to="/my-appointments"
                      className="block text-slate-200 hover:text-white relative"
                      onClick={() => setProfileOpen(false)}
                    >
                      Appointments
                      {notif && Object.values(notif.unread).some((v) => v > 0) && (
                        <span className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 bg-red-500 text-xs rounded-full flex items-center justify-center">
                          !
                        </span>
                      )}
                    </NavLink>
                    <button
                      onClick={logout}
                      className="block w-full text-left text-red-400 hover:text-red-300"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="hidden md:inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-full text-sm shadow-lg hover:-translate-y-0.5 transition-transform"
          >
            Login
          </button>
        )}

        {/* Hamburger */}
        <button className="md:hidden text-slate-200" onClick={() => setMenuOpen((m) => !m)}>
          <svg
            className="w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-slate-900/90 backdrop-blur-sm ring-1 ring-white/5 px-6 pb-6 space-y-4"
          >
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="block text-slate-200 py-1"
              >
                {label}
              </NavLink>
            ))}
            {!token && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-full"
              >
                Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
