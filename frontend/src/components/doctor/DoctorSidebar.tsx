// src/components/doctor/AdminSidebar.tsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  /* icons ‑ (kept as simple emoji placeholders) */
  const assets = {
    home_icon: "🏠",
    profile_icon: "👤",
    appointment_icon: "📅",
    slot_icon: "⏰",
  };

  const menu = [
    { to: "/doctor/dashboard",       icon: assets.home_icon,        label: "Dashboard"      },
    { to: "/doctor/appointments",    icon: assets.appointment_icon, label: "Appointments"   },
    { to: "/doctor/profile",         icon: assets.profile_icon,     label: "Profile"        },
    { to: "/doctor/slot-management", icon: assets.slot_icon,        label: "Slot management"},
  ];

  /* helpers */
  const glass    = "bg-white/5 backdrop-blur ring-1 ring-white/10";
  const gradient = "from-cyan-500 to-fuchsia-600";

  return (
    <aside
      className={`min-h-screen ${glass} relative text-slate-100 transition-all duration-300
        ${isCollapsed ? "w-20" : "w-72"}`}
    >
      {/* floating accents (unchanged animation) */}
      <div className="absolute inset-x-0 h-32 bg-gradient-to-br from-cyan-400/15 via-fuchsia-500/15 to-transparent" />
      <div className="absolute top-12 right-6 w-8 h-8 bg-cyan-400/20 rounded-full animate-pulse" />
      <div className="absolute top-28 right-10 w-4 h-4 bg-fuchsia-400/20 rounded-full animate-bounce" />

      {/* ───── header ───── */}
      <header className="relative z-10 flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg bg-gradient-to-r ${gradient}`}>
            🩺
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold">Doctor Panel</h1>
              <p className="text-xs text-slate-400">MediSlot</p>
            </div>
          )}
        </div>

        {/* collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition"
        >
          <div
            className={`w-5 h-5 flex flex-col justify-center items-center space-y-0.5 origin-center transition
              ${isCollapsed && "rotate-180"}`}
          >
            <span className="w-3 h-0.5 bg-slate-300" />
            <span className="w-3 h-0.5 bg-slate-300" />
            <span className="w-3 h-0.5 bg-slate-300" />
          </div>
        </button>
      </header>

      {/* ───── nav list ───── */}
      <nav className="relative z-10 px-4 pt-4">
        <ul className="space-y-2">
          {menu.map(({ to, icon, label }) => (
            <li key={label} className="group/item">
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  `relative flex items-center gap-4 p-3 rounded-xl overflow-hidden
                   transition-all duration-300 group-hover/item:scale-[1.03]
                   ${
                     isActive
                       ? "text-white bg-gradient-to-r " + gradient + " shadow-lg"
                       : "text-slate-300 hover:bg-white/10"
                   }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* subtle gradient overlay that fades ↔ original effect kept */}
                    <div
                      className={`
                        absolute inset-0 bg-gradient-to-r ${gradient}
                        transition-opacity duration-300 pointer-events-none
                        ${isActive ? "opacity-20" : "opacity-0 group-hover/item:opacity-10"}
                      `}
                    />

                    {/* thin left accent bar for active item */}
                    {isActive && (
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient} rounded-r-full`}
                      />
                    )}

                    {/* icon box */}
                    <span
                      className={`relative w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all duration-300
                        ${
                          isActive
                            ? "bg-white/20"
                            : "bg-white/10 group-hover/item:bg-gradient-to-r group-hover/item:" + gradient
                        }`}
                    >
                      {icon}
                    </span>

                    {/* label (hidden when collapsed) */}
                    {!isCollapsed && (
                      <span className="relative font-medium text-sm">{label}</span>
                    )}

                    {/* slide‑in tooltip when collapsed */}
                    {isCollapsed && (
                      <span
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 text-xs
                          bg-slate-800 text-white rounded shadow-lg opacity-0 scale-90 origin-left
                          group-hover/item:opacity-100 group-hover/item:scale-100 transition-all"
                      >
                        {label}
                        <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800" />
                      </span>
                    )}

                    {/* bottom underline grow animation */}
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}
                        transform scale-x-0 group-hover/item:scale-x-100 transition-transform duration-300 origin-left`}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* pulse button when collapsed */}
      {isCollapsed && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <button
            onClick={() => setIsCollapsed(false)}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg
              bg-gradient-to-r ${gradient} hover:scale-110 transition-transform`}
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </button>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
