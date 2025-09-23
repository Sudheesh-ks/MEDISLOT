import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import VideoCallCard from '../../components/user/VideoCallCard';
import ChatCard from '../../components/user/ChatCard';

dayjs.extend(customParseFormat);

const Consultation = () => {
  const { doctorId, appointmentId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

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
    <div className="flex flex-col items-center mt-26 mb-8 gap-6 p-8">
      {showTimer && (
        <div className="text-lg font-semibold text-yellow-400">
          Your consultation period will end in: ⏰ {formatTime(timeLeft)}
        </div>
      )}

      <div className="flex gap-6">
        <VideoCallCard appointmentId={appointmentId} />
        <ChatCard doctorId={doctorId} />
      </div>
    </div>
  );
};

export default Consultation;
