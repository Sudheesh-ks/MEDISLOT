import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/user/assets";
import { adminLoginAPI } from "../../services/adminServices";

const Login = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("AdminContext must be used within AdminContextProvider");
  }

  const { aToken, setAToken } = context;

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (state === "Admin") {
        const { data } = await adminLoginAPI(email, password);
        if (data.success) {
          navigate("/admin/dashboard");
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
        } else {
          toast.error(data.message);
        }
      } else {
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.message || "Something went wrong";
        toast.error(errorMsg);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  useEffect(() => {
    if (aToken) {
      navigate("/admin/dashboard");
    }
  }, [aToken, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form onSubmit={onSubmitHandler}>
        <div className="flex flex-col sm:flex-row bg-white shadow-lg rounded-xl overflow-hidden">
          {/* LEFT: Image Section */}
          <div className="hidden sm:block w-full sm:w-96">
            <img
              src={assets.about_image}
              alt="Admin Login Visual"
              className="w-full h-full object-cover"
            />
          </div>

          {/* RIGHT: Form Section */}
          <div className="flex flex-col gap-3 p-8 min-w-[340px] sm:min-w-96 text-[#5E5E5E] text-sm">
            <p className="text-2xl font-semibold m-auto">
              <span className="text-primary">{state}</span> Login
            </p>

            <div className="w-full">
              <p>Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border border-[#DADADA] rounded w-full p-2 mt-1"
                type="email"
                required
              />
            </div>

            <div className="w-full">
              <p>Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border border-[#DADADA] rounded w-full p-2 mt-1"
                type="password"
                required
              />
            </div>

            <button className="bg-primary text-white w-full py-2 rounded-md text-base">
              Login
            </button>

            {state === "Admin" ? (
              <p>
                Doctor Login?{" "}
                <span
                  className="text-primary underline cursor-pointer"
                  onClick={() => setState("Doctor")}
                >
                  Click here
                </span>
              </p>
            ) : (
              <p>
                Admin Login?{" "}
                <span
                  className="text-primary underline cursor-pointer"
                  onClick={() => setState("Admin")}
                >
                  Click here
                </span>
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
