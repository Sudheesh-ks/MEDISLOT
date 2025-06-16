import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/admin/assets"; // you should add doctor-specific icons here
import type { AppointmentTypes } from "../../types/appointment";
import { motion } from "framer-motion";
import { AdminContext } from "../../context/AdminContext";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const context = useContext(DoctorContext);
  const appContext = useContext(AppContext);
  const adminContext = useContext(AdminContext);

  if (!context) throw new Error("DoctorContext must be used within DoctorContextProvider");
  if (!appContext) throw new Error("AppContext must be used within AppContextProvider");
  if(!adminContext) throw new Error("AdminContext must be used within AdminContextProvider");

  const { dToken, cancelAppointment } = context;
  const { dashData, getDashData } = adminContext;
  const { slotDateFormat } = appContext;

  useEffect(() => {
    if (dToken) getDashData();
  }, [dToken]);

  useEffect(() => {
    if (!dToken) navigate("/doctor/login");
  }, [dToken]);

  return (
    dashData && (
      <div className="m-5 space-y-10">
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              count: `₹${dashData.totalEarnings}`,
              label: "Total Earnings",
              icon: assets.earning_icon,
              color: "from-yellow-400 to-orange-500",
              path: "/doctor/earnings",
            },
            {
              count: dashData.appointments,
              label: "Appointments",
              icon: assets.appointments_icon,
              color: "from-blue-400 to-indigo-500",
              path: "/doctor/appointments",
            },
            {
              count: dashData.upcomingAppointments || 0,
              label: "Patients",
              icon: assets.patients_icon,
              color: "from-green-400 to-teal-500",
              path: "/doctor/appointments",
            }
          ].map((card, idx) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              key={idx}
              onClick={() => navigate(card.path)}
              className={`cursor-pointer bg-gradient-to-r ${card.color} text-white p-6 rounded-xl shadow-md flex items-center gap-4`}
            >
              <img src={card.icon} alt={card.label} className="w-12 h-12" />
              <div>
                <p className="text-2xl font-bold">{card.count}</p>
                <p className="text-sm opacity-80">{card.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Latest Appointments */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b">
            <img src={assets.list_icon} alt="" className="w-6" />
            <p className="font-semibold text-gray-700 text-lg">Recent Appointments</p>
          </div>
          <div className="divide-y">
            {dashData.latestAppointments.map((item: AppointmentTypes, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50"
              >
                <img src={item.userData.image} className="w-10 h-10 rounded-full" alt="" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-gray-800">{item.userData.name}</p>
                  <p className="text-gray-500 text-xs">{slotDateFormat(item.slotDate)}</p>
                </div>
                {item.cancelled ? (
                  <p className="text-red-500 text-sm font-semibold">Cancelled</p>
                ) : (
                  <img
                    src={assets.cancel_icon}
                    alt="cancel"
                    onClick={() => cancelAppointment(item._id!)}
                    className="w-6 cursor-pointer hover:scale-110 transition"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorDashboard;
