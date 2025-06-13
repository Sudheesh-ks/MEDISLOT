import { useEffect, useContext, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";

const AdminUsersList = () => {
  const navigate = useNavigate();
  const context = useContext(AdminContext);
  if (!context) throw new Error("AdminContext must be used inside provider");

  const { aToken, users, getAllUsers, toggleBlockUser } = context;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    if (!aToken) {
      navigate("/admin/login");
    }
  });

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Users</p>

      <div className="bg-white border rounded min-h-[60vh] overflow-y-auto text-sm">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_2fr_3fr_1.5fr_1.5fr] items-center py-3 px-6 border-b font-medium text-gray-700">
          <p>#</p>
          <p>Image</p>
          <p>Name</p>
          <p>Email</p>
          <p>Status</p>
          <p className="text-right pr-10">Action</p>
        </div>

        {/* User Rows */}
        {paginatedUsers.map((user, index) => (
          <div
            key={user._id}
            className="flex flex-wrap justify-between max-sm:gap-3 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_3fr_1.5fr_1.5fr] items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50"
          >
            <p className="max-sm:hidden">{index + 1}</p>

            {/* User Image */}
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
              className={`px-3 py-1 text-xs rounded-full font-semibold w-fit ${
                user.isBlocked
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {user.isBlocked ? "Blocked" : "Active"}
            </span>

            <div className="text-right pr-4">
              <button
                onClick={() => toggleBlockUser(user._id)}
                className={`px-4 py-1.5 text-sm rounded-lg font-medium text-white shadow transition duration-200 ${
                  user.isBlocked
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {user.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className={`px-3 py-1 border rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className={`px-3 py-1 border rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersList;
