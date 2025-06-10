import { assets } from "../../assets/admin/assets";
import { NavLink } from "react-router-dom";

const DoctorSidebar = () => {
  return (
    <div className="min-h-screen bg-white border-r">
      {
        <ul className="text-[#515151] mt-5">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-blue-100 border-r-4 border-primary" : ""
              }`
            }
            to="/doctor/dashboard"
          >
            <img src={assets.home_icon} alt="" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-blue-100 border-r-4 border-primary" : ""
              }`
            }
            to="/doctor/appointments"
          >
            <img src={assets.appointment_icon} alt="" />
            <p className="hidden md:block">Appointments</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-blue-100 border-r-4 border-primary" : ""
              }`
            }
            to="/doctor/profile"
          >
            <img src={assets.people_icon} alt="" />
            <p className="hidden md:block">Profile</p>
          </NavLink>

        </ul>
      }
    </div>
  );
};

export default DoctorSidebar;
