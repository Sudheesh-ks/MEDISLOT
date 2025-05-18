import React, { useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';

const AdminUsersList = () => {
    const context = useContext(AdminContext);
    if (!context) throw new Error("AdminContext must be used inside provider");

    const { users, getAllUsers, toggleBlockUser } = context;

    useEffect(() => {
        getAllUsers();
    }, []);

    return (
        <div className="m-5 max-h-[90vh] overflow-y-auto">
            <h1 className="text-xl font-semibold text-gray-800 mb-4">All Users</h1>
            <div className="w-full flex flex-col gap-4">
                {users.map((user, index) => (
                    <div
                        key={user._id}
                        className="w-full flex items-center justify-between border border-indigo-200 bg-white rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        {/* User Image */}
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300 mr-4 flex-shrink-0">
                            <img
                                src={user.image || '/default-avatar.png'}
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Index */}
                        <div className="w-10 text-gray-500 font-medium">{index + 1}</div>

                        {/* Name */}
                        <div className="flex-1 text-gray-800 font-medium">{user.name}</div>

                        {/* Email */}
                        <div className="flex-1 text-gray-600 text-sm">{user.email}</div>

                        {/* Status */}
                        <div className="w-28 text-center">
                            <span
                                className={`px-3 py-1 text-xs rounded-full font-semibold ${
                                    user.isBlocked
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-green-100 text-green-600'
                                }`}
                            >
                                {user.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                        </div>

                        {/* Action */}
                        <div className="w-32 text-right">
                            <button
                                onClick={() => toggleBlockUser(user._id)}
                                className={`px-4 py-1.5 text-sm rounded-lg font-medium text-white shadow-md transition duration-200 ${
                                    user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {user.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminUsersList;
