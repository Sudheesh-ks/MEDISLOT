import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { data, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";

const AdminDoctorList = () => {
  const navigate = useNavigate();
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("AdminContext must be used within AdminContextProvider");
  }

  const { aToken, getDoctorsPaginated } = context;

  const [currentPage, setCurrentPage] = useState(1);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 6;
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (aToken) {
      fetchDoctors();
    }
  }, [aToken, currentPage]);

  useEffect(() => {
    if (!aToken) {
      navigate("/admin/login");
    }
  }, [aToken, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const result = await getDoctorsPaginated(currentPage, itemsPerPage);
      setDoctors(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors
    .filter((doctor) => doctor.status === "approved")
    .filter((doctor) =>
      doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.speciality?.toLowerCase().includes(searchQuery.toLowerCase())
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

      {loading ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          Loading doctors...
        </div>
      ) : filteredDoctors.length > 0 ? (
        <>
          <div className="w-full flex flex-wrap gap-4 gap-y-6">
            {filteredDoctors.map((item, index) => (
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
                    <p>
                      {item.available ? (
                          <div className="flex items-center gap-2 text-sm text-green-500">
                            <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                            <p>Available</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-red-500">
                            <p className="w-2 h-2 bg-red-500 rounded-full"></p>
                            <p>Not Available</p>
                          </div>
                        )}
                    </p>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      ) : (
        <div className="text-center w-full text-gray-500 text-sm py-10">
          No matching doctors found.
        </div>
      )}
    </div>
  );
};

export default AdminDoctorList;
