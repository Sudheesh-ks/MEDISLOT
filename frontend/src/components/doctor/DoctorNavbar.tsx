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

  const { dToken, setDToken } = context;

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
