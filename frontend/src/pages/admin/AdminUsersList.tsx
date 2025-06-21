import { useEffect, useContext, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, type: "spring", stiffness: 100 },
  }),
};

const AdminUsersList = () => {
  const navigate = useNavigate();
  const context = useContext(AdminContext);
  if (!context) throw new Error("AdminContext must be used inside provider");

  const { aToken, getUsersPaginated, toggleBlockUser } = context;

  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 6;
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (aToken) {
      fetchUsers();
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getUsersPaginated(currentPage, itemsPerPage);
      setUsers(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string) => {
    try {
      await toggleBlockUser(userId);
      // Refresh current page after blocking/unblocking
      fetchUsers();
    } catch (error) {
      console.error("Failed to toggle user block:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-semibold">👥 All Users</p>

      <div className="mb-4">
        <SearchBar
          placeholder="Search by name or email"
          onSearch={(query) => {
            setSearchQuery(query);
          }}
        />
      </div>

      <div className="bg-white border rounded shadow-sm min-h-[60vh] overflow-y-auto text-sm transition-all duration-300">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_2fr_3fr_1.5fr_1.5fr] items-center py-3 px-6 border-b font-medium text-gray-700 bg-gray-50">
          <p>#</p>
          <p>Image</p>
          <p>Name</p>
          <p>Email</p>
          <p>Status</p>
          <p className="text-right pr-10">Action</p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            Loading users...
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <motion.div
              key={user._id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              whileHover={{ scale: 1.01 }}
              className="flex flex-wrap justify-between max-sm:gap-3 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_3fr_1.5fr_1.5fr] items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-100 rounded transition"
            >
              <p className="max-sm:hidden">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </p>

              <div className="flex items-center gap-2">
                <img
                  src={user.image || "/default-avatar.png"}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover border"
                />
              </div>

              <p className="text-gray-800 font-medium truncate">{user.name}</p>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>

              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold w-fit transition-colors duration-300 ${
                  user.isBlocked
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {user.isBlocked ? "Blocked" : "Active"}
              </span>

              <div className="text-right pr-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggleBlock(user._id)}
                  className={`px-4 py-1.5 text-sm rounded-lg font-medium text-white shadow-sm transition duration-200 ${
                    user.isBlocked
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </motion.button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm">
            No matching users found.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};

export default AdminUsersList;
