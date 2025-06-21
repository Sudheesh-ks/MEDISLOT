import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/user/assets";
import { isValidEmail, isValidPassword } from "../../utils/validator";
import { loginUserAPI, registerUserAPI } from "../../services/authServices";
import { showErrorToast } from "../../utils/errorHandler";
import LoadingButton from "../../components/common/LoadingButton";

const Login = () => {

  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!context) {
    throw new Error("TopDoctors must be used within an AppContextProvider");
  }

  const { backendUrl, token, setToken } = context;



  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password || (state === "Sign Up" && !name)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      toast.error(
        "Password must be at least 8 characters long, include 1 number and 1 special character."
      );
      return;
    }

    try {
      setLoading(true);
      if (state === "Sign Up") {
        const { data } = await registerUserAPI(name, email, password);
        if (data.success) {
          localStorage.setItem(
            "tempUserData",
            JSON.stringify({ email, name, purpose: "register" })
          );
          toast.success("OTP sent to your email");
          navigate("/verify-otp");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await loginUserAPI(email, password);
        if (data.success) {
          setToken(data.token);
              localStorage.removeItem("isUserLoggedOut");
          toast.success("Login successful");
          navigate("/home");
        } else {
          toast.error(data?.message || "Something went wrong");
        }
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, [token, navigate]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-[80vh] flex items-center justify-center"
    >
<div
  className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-medium shadow-md hover:bg-blue-200 transition duration-300 cursor-pointer"
  onClick={() => navigate("/")}
>
  <span className="text-lg">🏠</span>
  <span className="text-sm sm:text-base">Back to Home</span>
</div>
      <div className="flex flex-col mt-40 sm:flex-row bg-white shadow-lg rounded-xl overflow-hidden">
        {/* LEFT: Image section */}
        <div className="hidden sm:block w-full sm:w-96">
          <img
            src={assets.contact_image}
            alt="Login Visual"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT: Form section */}
        <div className="flex flex-col gap-3 p-8 min-w-[340px] sm:min-w-96 text-zinc-600 text-sm">
          <p className="text-2xl font-semibold">
            {state === "Sign Up" ? "Create Account" : "Login"}
          </p>
          <p>
            Please {state === "Sign Up" ? "sign up" : "login"} to book
            appointment
          </p>

          {state === "Sign Up" && (
            <div className="w-full">
              <p>Full Name</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>
          )}

          <div className="w-full">
            <p>Email</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          <div className="w-full">
            <p>Password</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>

          {state === "Login" && (
            <div className="w-full text-right text-sm mt-1">
              <span
                onClick={() => navigate("/verify-email")}
                className="text-primary cursor-pointer hover:underline"
              >
                Forgot Password?
              </span>
            </div>
          )}

          <LoadingButton
  text={state === "Sign Up" ? "Create Account" : "Login"}
  type="submit"
  loading={loading}
  className="w-full py-2 text-base"
/>

          <LoadingButton
  text={
    <span className="flex items-center gap-2">
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
        className="w-5 h-5"
      />
      Continue with Google
    </span>
  }
  type="button"
  loading={googleLoading}
  onClick={() => {
    setGoogleLoading(true);
    window.location.href = `${backendUrl}/api/auth/google`;
  }}
  className="border border-zinc-300 text-zinc-700 w-full py-2 rounded-md mt-2 hover:bg-zinc-100 bg-white"
/>

          <p className="mt-2">
            {state === "Sign Up" ? (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => setState("Login")}
                  className="text-primary underline cursor-pointer"
                >
                  Login here
                </span>
              </>
            ) : (
              <>
                Create a new account?{" "}
                <span
                  onClick={() => setState("Sign Up")}
                  className="text-primary underline cursor-pointer"
                >
                  click here
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </form>
  );
};

export default Login;
