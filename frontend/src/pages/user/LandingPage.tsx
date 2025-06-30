import React, { useState, useEffect, useContext } from "react";
import { assets } from "../../assets/user/assets";
import Footer from "../../components/common/Footer";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const UserLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const context = useContext(AppContext);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    { icon: "🩺", title: "Top Specialists", description: "Browse and consult highly experienced doctors across all specialties." },
    { icon: "💸", title: "Affordable Fees", description: "Quality healthcare at budgets you can afford. No hidden charges." },
    { icon: "⏰", title: "Instant Booking", description: "Schedule consultations in just a few clicks, anytime, anywhere." },
    { icon: "🖥️", title: "Secure Video Calls", description: "HD video consultations with end‑to‑end encryption." },
    { icon: "📑", title: "Digital Prescriptions", description: "Receive prescriptions directly in the app." },
    { icon: "🔍", title: "Health Records", description: "Manage past consultations and prescriptions in one place." },
  ];

  const stats = [
    { number: "100K+", label: "Registered Users" },
    { number: "20K+", label: "Doctors Available" },
    { number: "300K+", label: "Consultations Done" },
    { number: "4.8/5", label: "User Satisfaction" },
  ];

  const cta =
    "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white py-2 px-6 rounded-full text-sm sm:text-base font-medium transition-transform hover:-translate-y-1 shadow-lg";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden relative">
      {/* Floating Particles – unchanged */}
      <div className="fixed top-[10%] left-[10%] w-2.5 h-2.5 bg-cyan-400/30 rounded-full animate-pulse" />
      <div className="fixed top-[20%] right-[20%] w-4 h-4 bg-fuchsia-400/30 rounded-full animate-bounce" style={{ animationDelay: "2s" }} />
      <div className="fixed bottom-[30%] left-[30%] w-2 h-2 bg-cyan-400/30 rounded-full animate-ping" style={{ animationDelay: "4s" }} />
      <div className="fixed bottom-[20%] right-[10%] w-3 h-3 bg-fuchsia-400/30 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-10 py-3 border-b border-white/10 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <img className="w-36 sm:w-40 cursor-pointer" src={assets.logo_dark ?? assets.logo} onClick={() => navigate("/")} />
        <div className="space-x-3">
          <button onClick={() => navigate("/login")} className={cta}>Register as User</button>
          <button onClick={() => navigate("/doctor/register")} className={cta}>Register as Doctor</button>
        </div>
      </header>

      {/* Hero */}
<section className="pt-32 pb-20">
  <div className="max-w-6xl mx-auto px-5 flex flex-col-reverse lg:flex-row items-center gap-12">
    {/* ▸ Text */}
    <div className="flex-1 text-left">
      <h1
        className="text-5xl sm:text-6xl font-extrabold mb-6
                   bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-600
                   bg-clip-text text-transparent animate-bounce"
        style={{ animationDuration: "3s", animationIterationCount: "infinite" }}
      >
        Your&nbsp;Health,<br className="hidden sm:block" /> Our&nbsp;Priority
      </h1>

      <p className="text-lg sm:text-xl mb-10 text-slate-400 max-w-md">
        Consult top doctors from the comfort of your home. Fast, secure, and
        affordable medical advice at your fingertips.
      </p>

      <button
        onClick={() => scrollToSection("features")}
        className={cta + " py-4 px-10 text-base"}
      >
        Explore&nbsp;Features
      </button>
    </div>

    {/* ▸ Image */}
    <div className="flex-1">
      <div
        className="relative w-full h-80 sm:h-[28rem] bg-white/5 backdrop-blur
                   ring-1 ring-white/10 rounded-3xl overflow-hidden shadow-xl
                   transform-gpu hover:scale-105 transition-transform duration-500"
      >
        <img
          src={assets.about_image}
          alt="Consultation"
          className="w-full h-full object-cover"
        />

        {/* subtle animated sweep across the image (optional eye‑candy) */}
        <div
          className="pointer-events-none absolute inset-0 -translate-x-full
                     bg-gradient-to-r from-transparent via-white/10 to-transparent
                     animate-[sweep_6s_linear_infinite]"
        />
      </div>
    </div>
  </div>
</section>




      {/* Features */}
      <section id="features" className="py-16">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-center text-4xl font-bold mb-12">Why Choose MediSlot?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
            {features.map((f, i) => (
              <div key={i} className="group relative bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl p-8 transition-transform duration-500 cursor-pointer overflow-hidden hover:-translate-y-3 hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <div className="w-[60px] h-[60px] bg-gradient-to-r from-cyan-500 to-fuchsia-600 rounded-full flex items-center justify-center text-2xl mb-4 animate-spin" style={{ animationDuration: "10s" }}>
                  {f.icon}
                </div>
                <h3 className="text-xl mb-2 font-semibold">{f.title}</h3>
                <p className="text-slate-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 text-center">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl mb-8 font-bold">Trusted by Thousands</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-600 bg-clip-text text-transparent">
                  {s.number}
                </div>
                <div className="text-lg text-slate-400 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Cards */}
      <section id="register" className="py-32 text-center">
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            { role: "User", path: "/login", desc: "Create your account to start consulting doctors immediately." },
            { role: "Doctor", path: "/doctor/register", desc: "Join our network of experts and expand your practice." },
          ].map(({ role, path, desc }) => (
            <div key={role} className="group relative bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl p-8 transition-transform hover:-translate-y-2 overflow-hidden">
              <h3 className="text-2xl font-bold mb-4">Register as a {role}</h3>
              <p className="text-slate-400 mb-6">{desc}</p>
              <button onClick={() => navigate(path)} className={cta}> {role} Register </button>
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