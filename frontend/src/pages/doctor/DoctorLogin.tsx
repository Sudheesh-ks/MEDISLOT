// src/pages/doctor/DoctorLogin.tsx
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
  const navigate = useNavigate();
  const context = useContext(DoctorContext);

  if (!context) {
    throw new Error("DoctorContext must be used within DoctorContextProvider");
  }

  const { dToken, setDToken } = context;

  useEffect(() => {
    if (dToken) navigate("/doctor/dashboard");
  }, [dToken, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await doctorLoginAPI(email, password);
      if (data.success) {
        updateDoctorAccessToken(data.token);
        setDToken(data.token);
                localStorage.removeItem("isDoctorLoggedOut");
                toast.success("Login successfull")
        navigate("/doctor/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form onSubmit={handleSubmit}>
        <div
  className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-medium shadow-md hover:bg-blue-200 transition duration-300 cursor-pointer"
  onClick={() => navigate("/")}
>
  <span className="text-lg">🏠</span>
  <span className="text-sm sm:text-base">Back to Home</span>
</div>
        <div className="flex flex-col sm:flex-row bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="hidden sm:block w-full sm:w-96">
            <img
              src={assets.about_image}
              alt="Doctor Login Visual"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 p-8 min-w-[340px] sm:min-w-96 text-[#5E5E5E] text-sm">
            <p className="text-2xl font-semibold m-auto text-primary">
              Doctor Login
            </p>

            <div className="w-full">
              <p>Email</p>
              <input
                type="email"
                required
                className="border border-[#DADADA] rounded w-full p-2 mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="w-full">
              <p>Password</p>
              <input
                type="password"
                required
                className="border border-[#DADADA] rounded w-full p-2 mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="bg-primary text-white w-full py-2 rounded-md text-base">
              Login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DoctorLogin;
