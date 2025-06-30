// src/components/admin/AdminSidebar.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  /* ——— ascii‑icon placeholders (feel free to swap for svgs) ——— */
  const assets = {
    home_icon: "🏠",
    people_icon: "👥",
    appointment_icon: "📅",
    doctor_request: "⚠️",
    doctor_icon: "🧑🏻‍⚕️",
    inbox_icon: "✉️",
  };

  const menuItems = [
    { to: "/admin/dashboard",        icon: assets.home_icon,        label: "Dashboard"       },
    { to: "/admin/user-management",  icon: assets.people_icon,      label: "Manage Users"    },
    { to: "/admin/appointments",     icon: assets.appointment_icon, label: "Appointments"    },
    { to: "/admin/doctor-requests",  icon: assets.doctor_request,   label: "Doctor Requests" },
    { to: "/admin/all-doctors",      icon: assets.doctor_icon,      label: "Doctor List"     },
    { to: "/admin/inbox",            icon: assets.inbox_icon,       label: "Inbox"           },
  ];

  /* ---------- helpers ---------- */
  const glass = "bg-white/5 backdrop-blur ring-1 ring-white/10";
  const grad  = "from-cyan-500 to-fuchsia-600";

  /* ======================================================= */
  return (
    <aside
      className={`min-h-screen ${glass} transition-all duration-300
                  ${isCollapsed ? "w-20" : "w-72"} relative`}
    >
      {/* ✨ Floating decor */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/10 to-transparent" />
      <div className="absolute top-10 right-4 w-8 h-8 bg-cyan-400/30 rounded-full animate-pulse" />
      <div className="absolute top-20 right-8 w-4 h-4 bg-fuchsia-400/40 rounded-full animate-bounce" />

      {/* ─── header ─── */}
      <div className="relative z-10 p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {/* logo / title */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg bg-gradient-to-r ${grad}`}>
              A
            </div>
            {!isCollapsed && (
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>
                  Admin&nbsp;Panel
                </h1>
                <p className="text-xs text-slate-400">MediSlot</p>
              </div>
            )}
          </div>

          {/* collapse button */}
          <button
            onClick={() => setIsCollapsed((p) => !p)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
          >
            <div
              className={`w-5 h-5 flex flex-col justify-center items-center transition-transform duration-300
                          ${isCollapsed ? "rotate-180" : ""}`}
            >
              <span className="w-3 h-0.5 bg-slate-300 mb-1" />
              <span className="w-3 h-0.5 bg-slate-300 mb-1" />
              <span className="w-3 h-0.5 bg-slate-300"   />
            </div>
          </button>
        </div>
      </div>

      {/* ─── nav items ─── */}
      <nav className="relative z-10 p-4">
        <ul className="space-y-2">
          {menuItems.map((it) => (
            <li key={it.to} className="group/item">
              <NavLink
                to={it.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-4 p-3 rounded-xl overflow-hidden transition-all duration-300
                   ${isActive ? "text-slate-100" : "text-slate-400 hover:text-slate-200"}
                   ${isActive ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* subtle gradient wash */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${grad}
                                  ${isActive ? "opacity-10" : "opacity-0 group-hover/item:opacity-5"}
                                  transition-opacity duration-300`}
                    />
                    {/* left accent bar */}
                    {isActive && (
                      <span className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${grad} rounded-r-full`} />
                    )}

                    {/* icon bubble */}
                    <div
                      className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-300
                                  ${isActive ? `bg-gradient-to-r ${grad} shadow-lg` : "bg-white/10 group-hover/item:bg-gradient-to-r group-hover/item:" + grad}`}
                    >
                      <span className={`${isActive ? "text-white" : "group-hover/item:text-white"}`}>{it.icon}</span>
                    </div>

                    {/* label (hide when collapsed) */}
                    {!isCollapsed && <span className="relative font-medium text-sm">{it.label}</span>}

                    {/* tooltip when collapsed */}
                    {isCollapsed && (
                      <span
                        className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg
                                   opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible
                                   transition-all duration-300 whitespace-nowrap"
                      >
                        {it.label}
                        <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                      </span>
                    )}

                    {/* bottom hover underline */}
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${grad}
                                  transform scale-x-0 group-hover/item:scale-x-100 transition-transform duration-300 origin-left`}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ─── status / bottom blob ─── */}
      {!isCollapsed ? (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className={`${glass} p-3 flex items-center gap-3 rounded-xl`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-r ${grad}`}>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium">System Status</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> All systems operational
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button
            className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center
                        bg-gradient-to-r ${grad} text-white hover:scale-110 transition-transform duration-300`}
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </button>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
