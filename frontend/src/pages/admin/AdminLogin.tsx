// src/pages/admin/AdminLogin.tsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext";
import { adminLoginAPI } from "../../services/adminServices";
import { showErrorToast } from "../../utils/errorHandler";
import { assets } from "../../assets/user/assets";
import { updateAdminAccessToken } from "../../context/tokenManagerAdmin";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("AdminContext must be used within AdminContextProvider");
  }

  const { aToken, setAToken } = context;

  useEffect(() => {
    if (aToken) navigate("/admin/dashboard");
  }, [aToken, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await adminLoginAPI(email, password);
      if (data.success) {
        updateAdminAccessToken(data.token);
        setAToken(data.token);
                  localStorage.removeItem("isAdminLoggedOut");
                          toast.success("Login Successful");
        navigate("/admin/dashboard");
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
        <div className="flex flex-col sm:flex-row bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="hidden sm:block w-full sm:w-96">
            <img
              src={assets.about_image}
              alt="Admin Login Visual"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 p-8 min-w-[340px] sm:min-w-96 text-[#5E5E5E] text-sm">
            <p className="text-2xl font-semibold m-auto text-primary">
              Admin Login
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

export default AdminLogin;
