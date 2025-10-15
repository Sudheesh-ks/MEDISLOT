import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { NotifContext } from '../../context/NotificationContext';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifUnreadCount, myRole } = useContext(NotifContext);

  const handleClick = () => {
    if (myRole === 'doctor') navigate('/doctor/notifications');
    else if (myRole === 'admin') navigate('/admin/notifications');
    else navigate('/notifications');
  };

  return (
    <div className="relative cursor-pointer ml-4" onClick={handleClick}>
      <Bell className="w-6 h-6 text-white" />
      {notifUnreadCount > 0 && (
        <span className="absolute -top-1 -right-1 text-[10px] px-1 h-4 min-w-[16px] bg-red-500 text-white rounded-full flex items-center justify-center">
          {notifUnreadCount > 9 ? '9+' : notifUnreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
