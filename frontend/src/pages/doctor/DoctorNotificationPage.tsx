import { useState, useEffect, useContext } from 'react';
import {
  clearAllDoctorNotificationsAPI,
  getDoctorNotificationsAPI,
  markAllDoctorNotificationsAsReadAPI,
  markDoctorNotificationAsReadAPI,
} from '../../services/doctorServices';
import Pagination from '../../components/common/Pagination';
import { DoctorContext } from '../../context/DoctorContext';

const DoctorNotifications = () => {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error('DoctorContext missing');
  const { dToken } = ctx;

  const [type, setType] = useState<'all' | 'appointment' | 'system' | 'prescription'>('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: pageSize };
      if (type !== 'all') params.type = type;

      const fetched = await getDoctorNotificationsAPI(params, dToken);
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
      await markDoctorNotificationAsReadAPI(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllDoctorNotificationsAsReadAPI();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Doctor Notifications</h2>
        <div className="flex gap-2 items-center">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as any);
              setPage(1);
            }}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg"
          >
            <option value="all">All</option>
            <option value="appointment">Appointment</option>
            <option value="system">System</option>
            <option value="prescription">Prescription</option>
          </select>
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Mark All as Read
          </button>

          <button
            onClick={async () => {
              try {
                await clearAllDoctorNotificationsAPI(dToken!, type !== 'all' ? type : undefined);
                setNotifications([]);
                setTotalPages(1);
                setPage(1);
              } catch (err) {
                console.error('Error clearing notifications:', err);
              }
            }}
            className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif._id}
              className={`p-4 rounded-lg shadow border ${
                notif.isRead
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-700 text-white border-white/10'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
};

export default DoctorNotifications;
