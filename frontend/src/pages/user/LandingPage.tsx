import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../../assets/user/assets';
import Footer from '../../components/common/Footer';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const UserLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const context = useContext(AppContext);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // useEffect(() => {
  //   if (context?.token) {
  //     navigate('/home');
  //   }
  // }, [context?.token, navigate]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: '🩺',
      title: 'Top Specialists',
      description: 'Browse and consult highly experienced doctors across all specialties.'
    },
    {
      icon: '💸',
      title: 'Affordable Fees',
      description: 'Quality healthcare at budgets you can afford. No hidden charges.'
    },
    {
      icon: '⏰',
      title: 'Instant Booking',
      description: 'Schedule consultations in just a few clicks, anytime, anywhere.'
    },
    {
      icon: '🖥️',
      title: 'Secure Video Calls',
      description: 'HD video consultations with end-to-end encryption.'
    },
    {
      icon: '📑',
      title: 'Digital Prescriptions',
      description: 'Receive prescriptions directly in the app.'
    },
    {
      icon: '🔍',
      title: 'Health Records',
      description: 'Manage past consultations and prescriptions in one place.'
    }
  ];

  const stats = [
    { number: '100K+', label: 'Registered Users' },
    { number: '20K+', label: 'Doctors Available' },
    { number: '300K+', label: 'Consultations Done' },
    { number: '4.8/5', label: 'User Satisfaction' }
  ];

  const ctaClass = "bg-primary text-white py-2 px-4 sm:py-2.5 sm:px-6 rounded-full text-sm sm:text-base font-medium transition-all duration-300 transform hover:-translate-y-1 shadow-[0_4px_12px_rgba(255,107,107,0.3)] hover:shadow-[0_6px_16px_rgba(255,107,107,0.4)]";

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Floating Particles */}
      <div className="fixed top-[10%] left-[10%] w-2.5 h-2.5 bg-blue-100 rounded-full animate-pulse opacity-30" />
      <div className="fixed top-[20%] right-[20%] w-4 h-4 bg-purple-100 rounded-full animate-bounce opacity-30" style={{ animationDelay: '2s' }} />
      <div className="fixed bottom-[30%] left-[30%] w-2 h-2 bg-blue-100 rounded-full animate-ping opacity-30" style={{ animationDelay: '4s' }} />
      <div className="fixed bottom-[20%] right-[10%] w-3 h-3 bg-purple-100 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1s' }} />

      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
        <div className="flex items-center gap-2 text-xs">
          <img className="w-36 sm:w-40 cursor-pointer" src={assets.logo} alt="Logo" onClick={() => navigate('/')} />
        </div>
        <div className="space-x-2 sm:space-x-4">
          <button onClick={() => navigate('/login')} className={ctaClass}>Register as User</button>
          <button onClick={() => navigate('/doctor/register')} className={ctaClass}>Register as Doctor</button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 text-center text-gray-800">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-bounce" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}>
            Your Health, Our Priority
          </h1>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Consult top doctors from the comfort of your home. Fast, secure, and affordable medical advice at your fingertips.
          </p>
          <button onClick={() => scrollToSection('features')} className="bg-primary text-white py-4 px-10 rounded-full text-base font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-[0_6px_16px_rgba(255,107,107,0.3)] hover:shadow-[0_8px_20px_rgba(255,107,107,0.4)]">Explore Features</button>
        </div>
      </section>

      {/* Image */}
      <section className="py-16 text-center">
        <div className="max-w-6xl mx-auto px-5">
          <div className="w-full max-w-2xl h-96 bg-gradient-to-br from-gray-50 to-gray-200 rounded-3xl overflow-hidden mx-auto border-2 border-gray-200 shadow-lg" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)' }}>
            <img src={assets.about_image} alt="Consultation" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-gray-50 rounded-3xl my-8 mx-4 border border-gray-200">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-center text-4xl text-gray-800 mb-12 font-bold">Why Choose MediSlot?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-gray-200 transition-all duration-500 cursor-pointer relative overflow-hidden group hover:-translate-y-3 hover:scale-105 hover:border-blue-500 shadow-md hover:shadow-xl">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-50 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <div className="w-[60px] h-[60px] bg-primary rounded-full flex items-center justify-center text-2xl mb-4 animate-spin" style={{ animationDuration: '10s' }}>
                  {f.icon}
                </div>
                <h3 className="text-xl mb-2 font-semibold text-gray-800">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 text-center">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-gray-800 text-4xl mb-8 font-bold">Trusted by Thousands</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {stats.map((s, i) => (
              <div key={i} className="text-gray-800">
                <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {s.number}
                </div>
                <div className="text-lg text-gray-600 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Cards */}
      <section id="register" className="py-32 text-center text-gray-800">
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-md hover:shadow-xl transition hover:-translate-y-2">
            <h3 className="text-2xl font-bold mb-4">Register as a User</h3>
            <p className="text-gray-600 mb-6">Create your account to start consulting doctors immediately.</p>
            <button onClick={() => navigate('/login')} className={ctaClass}>User Register</button>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-md hover:shadow-xl transition hover:-translate-y-2">
            <h3 className="text-2xl font-bold mb-4">Register as a Doctor</h3>
            <p className="text-gray-600 mb-6">Join our network of experts and expand your practice.</p>
            <button onClick={() => navigate('/doctor/register')} className={ctaClass}>Doctor Register</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UserLandingPage;
