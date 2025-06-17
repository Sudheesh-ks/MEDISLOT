import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/admin/assets";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import SearchBar from "../../components/common/SearchBar";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, type: "spring", stiffness: 100 },
  }),
};

const AdminAppointments = () => {
  const navigate = useNavigate();
  const context = useContext(AdminContext);
  const appContext = useContext(AppContext);

  if (!context || !appContext) {
    throw new Error("Contexts must be used within their providers");
  }

  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    context;
  const { calculateAge, slotDateFormat, currencySymbol } = appContext;

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  useEffect(() => {
    if (!aToken) {
      navigate("/admin/login");
    }
  }, [aToken, navigate]);

  // Filtered appointments by user or doctor name
  const filteredAppointments = appointments.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.userData.name.toLowerCase().includes(q) ||
      item.docData.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-6xl m-5">

<p className="mb-3 text-lg font-semibold">📅 All Appointments</p>

      <div className="mb-4">
        <SearchBar
          placeholder="Search by name or email"
          onSearch={(query) => {
            setSearchQuery(query);
          }}
        />
      </div>

      <div className="bg-white border rounded shadow-sm text-sm:max-h-[80vh] min-h-[60vh] overflow-y-scroll text-sm">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b bg-gray-50 font-medium text-gray-700">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>

        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((item, index) => (
            <motion.div
              key={item._id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              whileHover={{ scale: 1.01 }}
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50 transition"
            >
              <p className="max-sm:hidden">{index + 1}</p>

              <div className="flex items-center gap-2">
                <img
                  className="w-10 h-10 rounded-full object-cover border"
                  src={item.userData.image || "/default-avatar.png"}
                  alt="Patient"
                />
                <p className="font-medium text-gray-800 truncate">
                  {item.userData.name}
                </p>
              </div>

              <p className="max-sm:hidden">
                {calculateAge(item.userData.dob)}
              </p>

              <p className="truncate text-sm">
                {slotDateFormat(item.slotDate)}, {item.slotTime}
              </p>

              <div className="flex items-center gap-2">
                <img
                  className="w-9 h-9 rounded-full object-cover border"
                  src={item.docData.image || "/default-avatar.png"}
                  alt="Doctor"
                />
                <p className="text-gray-800 truncate">{item.docData.name}</p>
              </div>

              <p>
                {currencySymbol}
                {item.amount}
              </p>

              {item.cancelled ? (
                <p className="text-xs font-semibold text-red-400">Cancelled</p>
              ) : (
                <motion.img
                  whileTap={{ scale: 0.9 }}
                  onClick={() => cancelAppointment(item._id!)}
                  className="w-8 h-8 cursor-pointer hover:opacity-80 transition"
                  src={assets.cancel_icon}
                  alt="Cancel"
                />
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm">
            No matching appointments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
