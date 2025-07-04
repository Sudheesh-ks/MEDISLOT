import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DoctorContext } from "../../context/DoctorContext";
import { doctorLoginAPI } from "../../services/doctorServices";
import { showErrorToast } from "../../utils/errorHandler";
import { assets } from "../../assets/user/assets";
import { updateDoctorAccessToken } from "../../context/tokenManagerDoctor";

const DoctorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error("DoctorContext missing");
  const { dToken, setDToken } = ctx;

  useEffect(() => {
    if (dToken) nav("/doctor/dashboard");
  }, [dToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await doctorLoginAPI(email, password);
      if (data.success) {
        updateDoctorAccessToken(data.token);
        setDToken(data.token);
        localStorage.removeItem("isDoctorLoggedOut");
        toast.success("Login successful");
        nav("/doctor/dashboard");
      } else toast.error(data.message);
    } catch (err) {
      showErrorToast(err);
    }
  };

  const glass = "bg-white/5 backdrop-blur ring-1 ring-white/10";
  const input =
    "w-full bg-transparent ring-1 ring-white/10 rounded px-4 py-2 mt-1 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500";
  const btn =
    "w-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 py-2 rounded-md text-base hover:-translate-y-0.5 transition-transform";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative">
      <div
        onClick={() => nav("/")}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-400 font-medium shadow-md hover:bg-cyan-500/30 cursor-pointer"
      >
        <span className="text-lg">🏠</span>
        <span className="text-sm sm:text-base">Back to Home</span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg flex flex-col sm:flex-row rounded-3xl overflow-hidden shadow-xl"
      >
        <div className="hidden sm:block w-1/2">
          <img
            src={assets.about_image}
            className="w-full h-full object-cover"
          />
        </div>

        <div className={`flex-1 p-8 space-y-6 ${glass}`}>
          <h1 className="text-2xl font-semibold text-center text-cyan-400">
            Doctor Login
          </h1>

          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              required
              className={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">Password</label>
            <input
              type="password"
              required
              className={input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={btn}>
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorLogin;
