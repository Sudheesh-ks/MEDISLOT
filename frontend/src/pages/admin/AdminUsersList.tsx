import { useEffect, useContext, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import DataTable from "../../components/common/DataTable";

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

  const columns = [
    {
      key: "index",
      header: "#",
      width: "0.5fr",
      hideOnMobile: true,
      render: (_: any, index: number) => (
        <p>{(currentPage - 1) * itemsPerPage + index + 1}</p>
      ),
    },
    {
      key: "image",
      header: "Image",
      width: "2fr",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <img
            src={item.image || "/default-avatar.png"}
            alt="User"
            className="w-10 h-10 rounded-full object-cover border"
          />
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      width: "2fr",
      render: (item: any) => (
        <p className="text-gray-800 font-medium truncate">{item.name}</p>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: "3fr",
      render: (item: any) => (
        <p className="text-sm text-gray-600 truncate">{item.email}</p>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "1.5fr",
      render: (item: any) => (
        <span
          className={`px-3 py-1 text-xs rounded-full font-semibold w-fit transition-colors duration-300 ${
            item.isBlocked
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {item.isBlocked ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      width: "1.5fr",
      className: "text-right pr-4",
      render: (item: any) => (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleBlock(item._id);
          }}
          className={`px-4 py-1.5 text-sm rounded-lg font-medium text-white shadow-sm transition duration-200 ${
            item.isBlocked
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {item.isBlocked ? "Unblock" : "Block"}
        </motion.button>
      ),
    },
  ];

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

      <DataTable
        data={filteredUsers}
        columns={columns}
        loading={loading}
        emptyMessage="No matching users found."
        gridCols="grid-cols-[0.5fr_2fr_2fr_3fr_1.5fr_1.5fr]"
      />

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
