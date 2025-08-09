import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { getUserUnreadCountAPI } from "../../services/userProfileServices";
import { getAdminUnreadCountAPI } from "../../services/adminServices";
import { getDoctorUnreadCountAPI } from "../../services/doctorServices";

type NotificationBellProps = {
  role: "user" | "doctor" | "admin";
};

const NotificationBell = ({ role }: NotificationBellProps) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {

    const fetchCount = async () => {
      try {
        let count = 0;
        if (role === "doctor") {
          const res = await getDoctorUnreadCountAPI();
          count = res.unreadCount;
        } else if (role === "admin") {
          const res = await getAdminUnreadCountAPI();
          count = res.unreadCount;
        } else {
          const res = await getUserUnreadCountAPI();
          count = res.unreadCount;
        }
        setUnreadCount(count);
      } catch (err) {
        console.error("Error fetching unread count", err);
      }
    };

    fetchCount();

    // Optional: refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [role ]);

  const handleClick = () => {
    if (role === "doctor") {
      navigate("/doctor/notifications");
    } else if (role === "admin") {
      navigate("/admin/notifications");
    } else {
      navigate("/notifications");
    }
  };

  return (
    <div className="relative cursor-pointer ml-4" onClick={handleClick}>
      <Bell className="w-6 h-6 text-white" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 text-[10px] px-1 h-4 min-w-[16px] bg-red-500 text-white rounded-full flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
