import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import VideoCallCard from '../../components/user/VideoCallCard';
import ChatCard from '../../components/user/ChatCard';
import { UserContext } from '../../context/UserContext';

dayjs.extend(customParseFormat);

const Consultation = () => {
  const { doctorId, appointmentId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const context = useContext(UserContext);
  if (!context) throw new Error('Must be within UserContext');

  const { token } = context;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token]);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    if (!state?.slotDate || !state?.slotEndTime) {
      navigate('/my-appointments');
      return;
    }

    const endDateTime = dayjs(`${state.slotDate} ${state.slotEndTime}`, 'YYYY-MM-DD HH:mm');
    const expiryTime = endDateTime.add(24, 'hour');

    const updateTimer = () => {
      const now = dayjs();
      if (now.isAfter(endDateTime)) {
        setShowTimer(true);
      }

      const diff = expiryTime.diff(now, 'second');
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
        navigate('/my-appointments');
      } else {
        setTimeLeft(diff);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [state]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="flex flex-col items-center mt-26 mb-8 gap-6 p-4 md:p-8">
      {showTimer && (
        <div className="text-lg font-semibold text-yellow-400 text-center">
          Your consultation period will end in: ⏰ {formatTime(timeLeft)}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl">
        <div className="flex-1">
          <VideoCallCard appointmentId={appointmentId} />
        </div>
        <div className="flex-1">
          <ChatCard doctorId={doctorId} />
        </div>
      </div>
    </div>
  );
};

export default Consultation;
