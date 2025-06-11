import { assets } from "../../assets/admin/assets";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
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
            to="/admin/dashboard"
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
            to="/admin/user-management"
          >
            <img src={assets.people_icon} alt="" />
            <p className="hidden md:block">Manage Users</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-blue-100 border-r-4 border-primary" : ""
              }`
            }
            to="/admin/appointments"
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
            to="/admin/add-doctor"
          >
            <img src={assets.add_icon} alt="" />
            <p className="hidden md:block">Add Doctor</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-blue-100 border-r-4 border-primary" : ""
              }`
            }
            to="/admin/update-doctor"
          >
            <img src={assets.people_icon} alt="" />
            <p className="hidden md:block">Update Doctor</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-blue-100 border-r-4 border-primary" : ""
              }`
            }
            to="/admin/all-doctors"
          >
            <img src={assets.people_icon} alt="" />
            <p className="hidden md:block">Doctor List</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-blue-100 border-r-4 border-primary" : ""
              }`
            }
            to="/admin/inbox"
          >
            <img src={assets.appointment_icon} alt="" />
            <p className="hidden md:block">Inbox</p>
          </NavLink>
        </ul>
      }
    </div>
  );
};

export default AdminSidebar;
