import { useContext } from "react";
import { assets } from "../../assets/admin/assets";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";
import { logoutDoctorAPI } from "../../services/doctorServices";
import { clearDoctorAccessToken } from "../../context/tokenManagerDoctor";


const DoctorNavbar = () => {
  const context = useContext(DoctorContext);

  if (!context) {
    throw new Error("DoctorContext must be used within DoctorContextProvider");
  }

  const { dToken, setDToken, profileData } = context;

  const navigate = useNavigate();

const logout = async () => {
  try {
    await logoutDoctorAPI(); // ✅ call API to clear cookie

    setDToken("");
        localStorage.setItem("isDoctorLoggedOut", "true");
    clearDoctorAccessToken();

    navigate("/doctor/login");
  } catch (error) {
    console.error("Doctor logout failed:", error);
  }
};

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <img className="w-36 sm:w-40 cursor-pointer" src={assets.logo} alt="" />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          Doctor
        </p>
         {profileData?.status === "pending" && (
  <div className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full ml-3 animate-pulse border border-yellow-300 shadow-sm">
    ⏳ Waiting for approval
  </div>
)}

{profileData?.status === "rejected" && (
  <div className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full ml-3 border border-red-300 shadow-sm">
    ❌ Registration rejected
  </div>
)}

      </div>
      <button
        onClick={logout}
        className="bg-primary text-white text-sm px-10 py-2 rounded-full"
      >
        Logout
      </button>
    </div>
  );
};

export default DoctorNavbar;
