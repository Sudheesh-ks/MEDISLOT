import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/admin/assets";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import SearchBar from "../../components/common/SearchBar"; // ✅ Adjust path if necessary

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, type: "spring" as const, stiffness: 100 },
  }),
};

const DoctorAppointments = () => {
  const context = useContext(DoctorContext);
  const appContext = useContext(AppContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  if (!appContext) {
    throw new Error("AppContext must be used within AppContextProvider");
  }

  const { calculateAge, slotDateFormat, currencySymbol } = appContext;

  if (!context) {
    throw new Error("DoctorContext must be used within DoctorContextProvider");
  }

  const {
    dToken,
    appointments,
    getAppointments,
    confirmAppointment,
    cancelAppointment,
  } = context;

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  useEffect(() => {
    if (!dToken) {
      navigate("/doctor/login");
    }
  });

  const filteredAppointments = appointments.filter((item) =>
    item.userData.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      {/* 🔍 Left-aligned Search Bar */}
      <div className="mb-5 max-w-sm">
        <SearchBar
          placeholder="Search by patient name"
          onSearch={(query) => setSearchQuery(query)}
        />
      </div>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b bg-gray-50 font-medium text-gray-700">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((item, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              whileHover={{ scale: 1.01 }}
              className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] items-center gap-1 text-gray-500 py-3 px-6 border-b hover:bg-gray-50 transition"
            >
              <p className="max-sm:hidden">{index + 1}</p>
              <div className="flex items-center gap-2">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  src={item.userData.image}
                  alt="user"
                />
                <p>{item.userData.name}</p>
              </div>
              <div>
                <p className="text-xs inline border border-primary px-2 rounded-full">
                  {item.payment ? "Online" : "Cash"}
                </p>
              </div>
              <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
              <p>
                {slotDateFormat(item.slotDate)}, {item.slotTime}
              </p>
              <p>
                {currencySymbol}
                {item.amount}
              </p>
              {item.cancelled ? (
                <p className="text-red-500">Cancelled</p>
              ) : item.isConfirmed ? (
                <button
                  onClick={() => navigate("/doctor/consultation")}
                  className="bg-primary px-4 py-1.5 text-sm rounded-lg font-medium text-white shadow transition duration-200"
                >
                  Consultation
                </button>
              ) : (
                <div className="flex gap-2">
                  <img
                    onClick={() => cancelAppointment(item._id!)}
                    className="w-8 cursor-pointer"
                    src={assets.cancel_icon}
                    alt="Cancel"
                  />
                  <img
                    onClick={() => confirmAppointment(item._id!)}
                    className="w-8 cursor-pointer"
                    src={assets.tick_icon}
                    alt="Confirm"
                  />
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            No matching appointments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
