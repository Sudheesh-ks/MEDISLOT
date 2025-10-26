import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/user/assets';
import Footer from '../../components/common/Footer';
import { useNavigate } from 'react-router-dom';

const UserLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-950/95 backdrop-blur-xl shadow-lg border-b border-white/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <img
              className="w-32 sm:w-40 cursor-pointer transition-transform hover:scale-105"
              src={assets.logo_dark ?? assets.logo}
              alt="MediSlot Logo"
              onClick={() => navigate('/')}
            />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('stats')}
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('register')}
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                Get Started
              </button>
            </nav>

            {/* Desktop Register Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              <button onClick={() => navigate('/login')} className={`${cta} px-6 py-2.5`}>
                Register as User
              </button>
              <button onClick={() => navigate('/doctor/register')} className={`${cta} px-6 py-2.5`}>
                Register as Doctor
              </button>
            </div>

            {/* Mobile Dropdown */}
            <div className="sm:hidden relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={`${cta} px-6 py-2`}
              >
                Register
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                  <button
                    onClick={() => {
                      navigate('/login');
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-5 py-3 hover:bg-slate-700/80 transition-colors font-medium"
                  >
                    Register as User
                  </button>
                  <div className="border-t border-white/10" />
                  <button
                    onClick={() => {
                      navigate('/doctor/register');
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-5 py-3 hover:bg-slate-700/80 transition-colors font-medium"
                  >
                    Register as Doctor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-6 sm:space-y-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-sm text-cyan-300 font-medium">
                  Trusted Healthcare Platform
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
                Your Health,
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Consult top doctors from the comfort of your home. Fast, secure, and affordable
                medical advice at your fingertips.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <button
                  onClick={() => scrollToSection('features')}
                  className={`${cta} px-8 py-4 text-lg`}
                >
                  Explore Features
                </button>
                <button
                  onClick={() => scrollToSection('register')}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform-gpu hover:scale-[1.02] transition-transform duration-500">
                <img
                  src={assets.about_image}
                  alt="Healthcare Consultation"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

                {/* Shimmer Effect */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-slate-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl hidden sm:block">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  100K+
                </div>
                <div className="text-sm text-slate-300 mt-1">Happy Patients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        className="py-16 sm:py-20 bg-gradient-to-b from-slate-900/50 to-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
              Join our growing community of satisfied patients and healthcare professionals
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((s, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {s.number}
                </div>
                <div className="text-sm sm:text-base text-slate-300 font-medium">{s.label}</div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-600/0 group-hover:from-cyan-500/10 group-hover:to-blue-600/10 rounded-2xl transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Why Choose MediSlot?
            </h2>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
              Experience healthcare that's designed around your needs with cutting-edge features
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:border-cyan-500/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    {f.icon}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                </div>

                {/* Content */}
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {f.description}
                </p>

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-blue-500/0 to-indigo-600/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-indigo-600/5 rounded-3xl transition-all duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section
        id="register"
        className="py-20 sm:py-28 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
              Join thousands who trust MediSlot for their healthcare needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {[
              {
                role: 'User',
                path: '/login',
                desc: 'Create your account to start consulting doctors immediately.',
                icon: '👤',
              },
              {
                role: 'Doctor',
                path: '/doctor/register',
                desc: 'Join our network of experts and expand your practice.',
                icon: '👨🏻‍⚕',
              },
            ].map(({ role, path, desc, icon }) => (
              <div
                key={role}
                className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8 sm:p-10 transition-all duration-500 hover:border-cyan-500/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                {/* Icon */}
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
                  Register as a {role}
                </h3>
                <p className="text-base sm:text-lg text-slate-300 mb-6 sm:mb-8 leading-relaxed">
                  {desc}
                </p>

                {/* CTA Button */}
                <button onClick={() => navigate(path)} className={`${cta} w-full py-4 text-lg`}>
                  {role} Register →
                </button>

                {/* Shimmer Effect on Hover */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000 rounded-3xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default UserLandingPage;
