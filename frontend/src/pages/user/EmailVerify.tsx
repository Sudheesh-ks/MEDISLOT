import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { verifyEmailAPI } from "../../services/authServices";
import { showErrorToast } from "../../utils/errorHandler";

const EmailVerificationPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const context = useContext(AppContext);

  if (!context) {
    throw new Error("TopDoctors must be used within an AppContextProvider");
  }

  const { token } = context;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await verifyEmailAPI(email);
      if (data.success) {
        toast.success("OTP sent to your email");
        localStorage.setItem(
          "tempUserData",
          JSON.stringify({ email, purpose: "reset-password" })
        );
        navigate("/verify-otp");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  });

  return (
    <form className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">Verify Your Email</p>
        <p>Please enter your email to receive a verification code</p>

        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            required
          />
        </div>

        <button
          onClick={handleSubmit}
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md text-base"
        >
          Send Verification Code
        </button>
      </div>
    </form>
  );
};

export default EmailVerificationPage;
