import { useState, useEffect, useContext } from 'react';
import {
  clearAllUserNotificationsAPI,
  getUserNotificationsAPI,
  markAllUserNotificationsAsReadAPI,
  markUserNotificationAsReadAPI,
} from '../../services/userProfileServices';
import Pagination from '../../components/common/Pagination';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const UserNotifications = () => {
  const [type, setType] = useState<'all' | 'appointment' | 'system' | 'prescription'>('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const context = useContext(UserContext);
  if (!context) throw new Error('Missing contexts');
  const { token } = context;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: pageSize };
      if (type !== 'all') params.type = type;

      const fetched = await getUserNotificationsAPI(params);
      setNotifications(fetched.notifications);
      setTotalPages(fetched.totalPages);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, type]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markUserNotificationAsReadAPI(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllUserNotificationsAsReadAPI();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-8">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">User Notifications</h2>

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as any);
              setPage(1);
            }}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg min-w-[120px]"
          >
            <option value="all">All</option>
            <option value="appointment">Appointment</option>
            <option value="system">System</option>
            <option value="prescription">Prescription</option>
          </select>

          <button
            onClick={handleMarkAllAsRead}
            className="text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
          >
            Mark All as Read
          </button>

          <button
            onClick={async () => {
              try {
                await clearAllUserNotificationsAPI(type !== 'all' ? type : undefined);
                setNotifications([]);
                setTotalPages(1);
                setPage(1);
              } catch (err) {
                console.error('Error clearing notifications:', err);
              }
            }}
            className="text-sm bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 w-full sm:w-auto"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <p className="text-slate-400 text-center mt-10">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-slate-400 text-center mt-10">No notifications found.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif._id}
              className={`p-4 sm:p-6 rounded-lg shadow border transition-colors duration-200 ${
                notif.isRead
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-700 text-white border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2">
                <div className="flex-1">
                  <p className="text-sm sm:text-base">{notif.message}</p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="text-xs sm:text-sm text-blue-400 hover:underline mt-2 sm:mt-0"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 sm:mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
};

export default UserNotifications;
