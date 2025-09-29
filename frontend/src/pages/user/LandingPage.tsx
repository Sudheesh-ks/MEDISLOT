import React, { useState } from 'react';
import { assets } from '../../assets/user/assets';
import Footer from '../../components/common/Footer';
import { useNavigate } from 'react-router-dom';

const UserLandingPage: React.FC = () => {
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: '🩺',
      title: 'Top Specialists',
      description: 'Browse and consult highly experienced doctors across all specialties.',
    },
    {
      icon: '💸',
      title: 'Affordable Fees',
      description: 'Quality healthcare at budgets you can afford. No hidden charges.',
    },
    {
      icon: '⏰',
      title: 'Instant Booking',
      description: 'Schedule consultations in just a few clicks, anytime, anywhere.',
    },
    {
      icon: '🖥️',
      title: 'Secure Video Calls',
      description: 'HD video consultations with end‑to‑end encryption.',
    },
    {
      icon: '📑',
      title: 'Digital Prescriptions',
      description: 'Receive prescriptions directly in the app.',
    },
    {
      icon: '🔍',
      title: 'Health Records',
      description: 'Manage past consultations and prescriptions in one place.',
    },
  ];

  const stats = [
    { number: '100K+', label: 'Registered Users' },
    { number: '20K+', label: 'Doctors Available' },
    { number: '300K+', label: 'Consultations Done' },
    { number: '4.8/5', label: 'User Satisfaction' },
  ];

  const cta =
    'bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-6 rounded-full text-sm sm:text-base font-medium transition-transform hover:-translate-y-1 shadow-lg';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden relative">
      {/* Subtle Animated Background */}
      <div className="hidden sm:block fixed top-[10%] left-[10%] w-2.5 h-2.5 bg-cyan-400/30 rounded-full animate-pulse" />
      <div
        className="hidden sm:block fixed top-[20%] right-[20%] w-4 h-4 bg-blue-400/30 rounded-full animate-bounce"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="hidden sm:block fixed bottom-[30%] left-[30%] w-2 h-2 bg-cyan-400/30 rounded-full animate-ping"
        style={{ animationDelay: '4s' }}
      />
      <div
        className="hidden sm:block fixed bottom-[20%] right-[10%] w-3 h-3 bg-blue-400/30 rounded-full animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-10 py-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <img
          className="w-32 sm:w-40 cursor-pointer"
          src={assets.logo_dark ?? assets.logo}
          onClick={() => navigate('/')}
        />

        {/* Desktop Register Buttons */}
        <div className="hidden sm:flex space-x-3">
          <button onClick={() => navigate('/login')} className={cta + ' py-2 sm:py-3 px-4 sm:px-6'}>
            Register as User
          </button>
          <button
            onClick={() => navigate('/doctor/register')}
            className={cta + ' py-2 sm:py-3 px-4 sm:px-6'}
          >
            Register as Doctor
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div className="sm:hidden relative">
          <button onClick={() => setDropdownOpen((prev) => !prev)} className={cta + ' py-2 px-6'}>
            Register
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-slate-800/90 backdrop-blur-md rounded-xl shadow-lg ring-1 ring-white/20 z-50 overflow-hidden">
              <button
                onClick={() => navigate('/login')}
                className="block w-full text-left px-4 py-2 hover:bg-slate-700 transition"
              >
                User
              </button>
              <button
                onClick={() => navigate('/doctor/register')}
                className="block w-full text-left px-4 py-2 hover:bg-slate-700 transition"
              >
                Doctor
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-28 pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto px-5 flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6
                     bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600
                     bg-clip-text text-transparent animate-bounce"
              style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}
            >
              Your&nbsp;Health,
              <br className="hidden sm:block" /> Our&nbsp;Priority
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-10 text-slate-300 max-w-sm sm:max-w-md mx-auto lg:mx-0">
              Consult top doctors from the comfort of your home. Fast, secure, and affordable
              medical advice at your fingertips.
            </p>
            <button
              onClick={() => scrollToSection('features')}
              className={cta + ' py-3 sm:py-4 px-6 sm:px-10 text-base sm:text-lg'}
            >
              Explore Features
            </button>
          </div>

          {/* Hero Image */}
          <div className="flex-1 w-full">
            <div
              className="relative w-full h-64 sm:h-80 md:h-96 bg-white/5 backdrop-blur
                     ring-1 ring-white/10 rounded-3xl overflow-hidden shadow-xl
                     transform-gpu hover:scale-105 transition-transform duration-500"
            >
              <img
                src={assets.about_image}
                alt="Consultation"
                className="w-full h-full object-cover rounded-3xl"
              />
              <div
                className="pointer-events-none absolute inset-0 -translate-x-full
                       bg-gradient-to-r from-transparent via-white/10 to-transparent
                       animate-[sweep_6s_linear_infinite]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-3xl sm:text-4xl text-center font-bold mb-8 sm:mb-12">
            Why Choose MediSlot?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl p-6 sm:p-8 transition-transform duration-500 cursor-pointer overflow-hidden hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-105"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <div
                  className="w-14 h-14 sm:w-[60px] sm:h-[60px] bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 animate-spin"
                  style={{ animationDuration: '10s' }}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg sm:text-xl mb-1 sm:mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm sm:text-base text-slate-300">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - 2 per row */}
      <section className="py-12 sm:py-16 text-center">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-3xl sm:text-4xl mb-6 sm:mb-8 font-bold">Trusted by Thousands</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  {s.number}
                </div>
                <div className="text-sm sm:text-lg text-slate-300 mt-1 sm:mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-16 sm:py-28 text-center">
        <div className="max-w-5xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
          {[
            {
              role: 'User',
              path: '/login',
              desc: 'Create your account to start consulting doctors immediately.',
            },
            {
              role: 'Doctor',
              path: '/doctor/register',
              desc: 'Join our network of experts and expand your practice.',
            },
          ].map(({ role, path, desc }) => (
            <div
              key={role}
              className="group relative bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl p-6 sm:p-8 transition-transform hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Register as a {role}</h3>
              <p className="text-sm sm:text-base text-slate-300 mb-4 sm:mb-6">{desc}</p>
              <button onClick={() => navigate(path)} className={cta + ' w-full py-3 sm:py-4'}>
                {role} Register
              </button>
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UserLandingPage;
