import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/user/assets';
import Footer from '../../components/common/Footer';
import { useNavigate } from 'react-router-dom';

const DoctorLandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const benefitsData = [
    {
      icon: '💰',
      title: 'Flexible Income',
      description: 'Earn money during your free time. Set your own schedule and consultation rates. Perfect for supplementing your primary practice income.'
    },
    {
      icon: '🕒',
      title: 'Work Anytime',
      description: 'Consult patients from anywhere, anytime. Whether it\'s evenings, weekends, or between appointments - your schedule, your choice.'
    },
    {
      icon: '🌍',
      title: 'Global Reach',
      description: 'Connect with patients worldwide. Expand your practice beyond geographical boundaries and help more people access quality healthcare.'
    },
    {
      icon: '💻',
      title: 'Advanced Platform',
      description: 'State-of-the-art telemedicine platform with secure video calls, digital prescriptions, and comprehensive patient management tools.'
    },
    {
      icon: '🔒',
      title: 'Secure & Compliant',
      description: 'HIPAA-compliant platform ensuring patient privacy and data security. Professional liability coverage included for peace of mind.'
    },
    {
      icon: '📊',
      title: 'Performance Analytics',
      description: 'Track your earnings, patient satisfaction, and consultation metrics. Optimize your practice with detailed insights and reports.'
    }
  ];

  const statsData = [
    { number: '5,000+', label: 'Active Doctors' },
    { number: '50,000+', label: 'Patients Served' },
    { number: '$2M+', label: 'Doctor Earnings' },
    { number: '4.9/5', label: 'Doctor Rating' }
  ];

  const ctaButtonClass = "bg-primary text-white py-4 px-10 rounded-full text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-[0_10px_30px_rgba(255,107,107,0.3)] hover:shadow-[0_15px_40px_rgba(255,107,107,0.4)]";

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Floating particles */}
      <div className="fixed top-[10%] left-[10%] w-2.5 h-2.5 bg-blue-100 rounded-full animate-pulse opacity-30"></div>
      <div className="fixed top-[20%] right-[20%] w-4 h-4 bg-purple-100 rounded-full animate-bounce opacity-30" style={{ animationDelay: '2s' }}></div>
      <div className="fixed bottom-[30%] left-[30%] w-2 h-2 bg-blue-100 rounded-full animate-ping opacity-30" style={{ animationDelay: '4s' }}></div>
      <div className="fixed bottom-[20%] right-[10%] w-3 h-3 bg-purple-100 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1s' }}></div>

      {/* Header */}
      <header>
        <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
          <div className="flex items-center gap-2 text-xs">
            <img className="w-36 sm:w-40 cursor-pointer" src={assets.logo} alt="" />
            <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
              Doctor
            </p>
          </div>
          <button
            onClick={() => navigate('/doctor/register')}
            className={ctaButtonClass}
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 text-center text-gray-800">
        <div className="max-w-6xl mx-auto px-5">
          <h1
            className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-bounce"
            style={{
              animationDuration: '3s',
              animationIterationCount: 'infinite'
            }}
          >
            Transform Your Practice
          </h1>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Join thousands of doctors who are earning extra income by providing online consultations during their free time. Flexible, rewarding, and impactful.
          </p>
          <button
            onClick={() => scrollToSection('register')}
            className={ctaButtonClass}
          >
            Join as a Doctor
          </button>
        </div>
      </section>

      {/* Image Section */}
      <section className="py-16 text-center">
        <div className="max-w-6xl mx-auto px-5">
          <div
            className="w-full max-w-2xl h-96 bg-gradient-to-br from-gray-50 to-gray-200 rounded-3xl overflow-hidden mx-auto border-2 border-gray-200 shadow-lg"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            }}
          >
            <img
              src={assets.about_image}
              alt="Professional"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 bg-gray-50 rounded-3xl my-8 mx-4 border border-gray-200">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-center text-4xl text-gray-800 mb-12 font-bold">
            Why Choose MediSlot?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
            {benefitsData.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-gray-200 transition-all duration-500 cursor-pointer relative overflow-hidden group hover:-translate-y-3 hover:scale-105 hover:border-blue-500 shadow-md hover:shadow-xl"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-50 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                <div
                  className="w-[60px] h-[60px] bg-primary rounded-full flex items-center justify-center text-2xl mb-4 animate-spin"
                  style={{ animationDuration: '10s' }}
                >
                  {benefit.icon}
                </div>
                <h3 className="text-gray-800 text-xl mb-4 font-semibold">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 text-center">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-gray-800 text-4xl mb-8 font-bold">
            Join Our Growing Community
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-gray-800">
                <div
                  className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {stat.number}
                </div>
                <div className="text-lg text-gray-600 mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="register" className="py-32 text-center text-gray-800">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl mb-4 font-bold">Ready to Get Started?</h2>
          <p className="mb-8 text-xl text-gray-600">
            Join MediSlot today and start earning while making a difference in healthcare.
          </p>
          <button
            onClick={() => navigate('/doctor/register')}
            className={ctaButtonClass}
          >
            Register Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DoctorLandingPage;
