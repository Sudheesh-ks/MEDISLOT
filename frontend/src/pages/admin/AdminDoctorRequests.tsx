import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // 🆕

const AdminDoctorRequests = () => {
  const navigate = useNavigate();
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("AdminContext must be used within AdminContextProvider");
  }

  const {
    doctors,
    aToken,
    getAllDoctors,
    approveDoctor,
    rejectDoctor,
  } = context;

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  useEffect(() => {
    if (!aToken) {
      navigate("/admin/login");
    }
  });

  const pendingDoctors = doctors.filter((doc) => doc.status === "pending");

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">Doctor Requests</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {pendingDoctors.map((item, index) => (
          <motion.div
            className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden transition-transform duration-300 hover:-translate-y-1"
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <img className="bg-indigo-50" src={item.image} alt="" />
            <div className="p-4">
              <p className="text-neutral-800 text-lg font-medium">{item.name}</p>
              <p className="text-zinc-600 text-sm">{item.speciality}</p>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => approveDoctor(item._id)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-105 transition-all duration-300"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectDoctor(item._id)}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-105 transition-all duration-300"
                >
                  Reject
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {pendingDoctors.length === 0 && (
          <p className="text-gray-500 mt-6">No pending doctor requests.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDoctorRequests;
