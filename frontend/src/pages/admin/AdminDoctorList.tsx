import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SearchBar from "../../components/common/SearchBar"; // adjust path if needed

const AdminDoctorList = () => {
  const navigate = useNavigate();
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("AdminContext must be used within AdminContextProvider");
  }

  const { doctors, aToken, getAllDoctors, changeAvailability } = context;

  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredDoctors = doctors
    .filter((doctor) => doctor.status === "approved")
    .filter((doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium mb-3">👨‍⚕️ All Doctors</h1>

      {/* Left-aligned Search Bar */}
      <div className="mb-5 max-w-sm">
        <SearchBar
          placeholder="Search by name or speciality"
          onSearch={(query) => setSearchQuery(query)}
        />
      </div>

      <div className="w-full flex flex-wrap gap-4 gap-y-6">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((item, index) => (
            <motion.div
              className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group transition-transform duration-300 hover:-translate-y-1"
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <img
                className="bg-indigo-50 group-hover:bg-primary transition-all duration-500"
                src={item.image}
                alt=""
              />
              <div className="p-4">
                <p className="text-neutral-800 text-lg font-medium">{item.name}</p>
                <p className="text-zinc-600 text-sm">{item.speciality}</p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <input
                    onChange={() => changeAvailability(item._id)}
                    type="checkbox"
                    checked={item.available}
                  />
                  <p>Available</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center w-full text-gray-500 text-sm py-10">
            No matching doctors found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctorList;
