import { useContext } from "react";
import { assets } from "../../assets/admin/assets";
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { clearAdminAccessToken } from "../../context/tokenManagerAdmin";
import { logoutAdminAPI } from "../../services/adminServices";

const AdminNavbar = () => {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("AdminContext must be used within AdminContextProvider");
  }

  const { aToken, setAToken } = context;

  const navigate = useNavigate();

const logout = async () => {
  try {
    await logoutAdminAPI(); // ✅ call API to clear cookie

    setAToken("");
        localStorage.setItem("isAdminLoggedOut", "true");
    clearAdminAccessToken();

    navigate("/admin/login");
  } catch (error) {
    console.error("Admin logout failed:", error);
  }
};

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <img className="w-36 sm:w-40 cursor-pointer" src={assets.logo} alt="" />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          Admin
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

export default AdminNavbar;
