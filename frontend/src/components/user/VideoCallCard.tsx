import { useEffect, useState } from 'react';
import { assets } from '../../assets/user/assets';
import { getActiveAppointmentAPI } from '../../services/appointmentServices';
import { useNavigate } from 'react-router-dom';

interface VideoCallCardProps {
  appointmentId?: string;
}

const VideoCallCard = ({ appointmentId }: VideoCallCardProps) => {
  const navigate = useNavigate();

  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await getActiveAppointmentAPI();
        if (res?.active && res?.appointmentId) {
          setActiveAppointmentId(res.appointmentId);
        }
      } catch (error) {
        console.log('Error fetching active appointment:', error);
        setActiveAppointmentId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, []);

  const isActive = activeAppointmentId === appointmentId;

  return (
    <div
      className={`flex flex-col bg-white/5 backdrop-blur
    ring-1 ring-white/10 rounded-3xl overflow-hidden transition-all duration-500 h-full`}
    >
      <div className="h-64 md:h-72 overflow-hidden">
        <img src={assets.about_image} alt="Video cover" className="w-full h-full object-cover" />
      </div>

      <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
            Start Consultation
            <img src={assets.videocall_icon} alt="video" className="h-5 w-5" />
          </h3>
          {loading ? (
            <p className="text-sm text-slate-400">Checking appointment...</p>
          ) : isActive ? (
            <p className="text-sm text-green-400">Your appointment is active now</p>
          ) : (
            <p className="text-sm text-slate-400">No consultation available now.</p>
          )}
        </div>

        <button
          className={`mt-4 md:mt-6 w-full ${
            isActive ? 'bg-green-500 animate-bounce' : 'bg-gray-600 cursor-not-allowed opacity-60'
          } text-white py-3 rounded-full transition-transform`}
          disabled={!isActive}
          onClick={() => {
            if (isActive && appointmentId) {
              navigate(`/video-room/${appointmentId}`);
            }
          }}
        >
          Join Now
        </button>
      </div>
    </div>
  );
};

export default VideoCallCard;
