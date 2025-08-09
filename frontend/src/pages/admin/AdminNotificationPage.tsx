import { useState, useEffect, useContext } from 'react';
import {
  getAdminNotificationsAPI,
  markAdminNotificationAsReadAPI,
  markAllAdminNotificationsAsReadAPI,
} from '../../services/adminServices';
import { AdminContext } from '../../context/AdminContext';

const AdminNotifications = () => {
  const [type, setType] = useState<'all' | 'appointment' | 'system' | 'prescription'>('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [before, setBefore] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const adminCtx = useContext(AdminContext);
  if (!adminCtx) throw new Error('Missing contexts');

  const { aToken } = adminCtx;

  const fetchNotifications = async (reset = false) => {
    setLoading(true);
    try {
      const params: any = { limit: pageSize };
      if (type !== 'all') params.type = type;
      if (!reset && before) params.before = before;

      const fetched = await getAdminNotificationsAPI(params, aToken);
      if (reset) setNotifications(fetched);
      else setNotifications((prev) => [...prev, ...fetched]);

      if (fetched.length < pageSize) {
        setHasMore(false);
      } else {
        setBefore(new Date(fetched[fetched.length - 1].createdAt).toISOString());
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setBefore(undefined);
    setHasMore(true);
    fetchNotifications(true);
  }, [type]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAdminNotificationAsReadAPI(id, aToken);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAdminNotificationsAsReadAPI(aToken);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Admin Notifications</h2>
        <div className="flex gap-2 items-center">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
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
        </div>
      </div>

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

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchNotifications()}
            disabled={loading}
            className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
