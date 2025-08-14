import { useEffect, useState } from 'react';
import { assets } from '../../assets/user/assets';
import { useNavigate } from 'react-router-dom';
import { getActiveDoctorAppointmentAPI } from '../../services/doctorServices';

interface DocVideoCallCardProps {
  appointmentId?: string;
}

const DocVideoCallCard = ({ appointmentId }: DocVideoCallCardProps) => {
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await getActiveDoctorAppointmentAPI();
        if (res?.active && res?.appointmentId) {
          setActiveAppointmentId(res.appointmentId);
        }
      } catch {
        setActiveAppointmentId(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, []);

  const isActive = activeAppointmentId === appointmentId;

  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
  const btnBase = 'w-full py-3 rounded-lg font-medium transition-transform shadow-lg';
  const btnEnabled = 'bg-green-500';
  const btnDisabled = 'bg-gray-600 opacity-60 cursor-not-allowed';

  return (
    <div
      className={`w-96 rounded-3xl overflow-hidden transition-all duration-500
        ${glass} ${
          isActive
            ? 'ring-2 ring-green-500 shadow-[0_0_20px_2px_rgba(34,197,94,0.5)]'
            : 'ring-1 ring-white/10'
        }`}
    >
      {/* header image */}
      <div className="h-96 overflow-hidden">
        <img src={assets.about_image} className="w-full h-full object-cover" />
      </div>

      <div className="p-6 space-y-2">
        <h3 className="text-lg font-semibold text-white">Start Consultation</h3>
        {loading ? (
          <p className="text-slate-400 text-sm">Checking consultation status...</p>
        ) : isActive ? (
          <p className="text-green-400 text-sm">Appointment is active now.</p>
        ) : (
          <p className="text-slate-400 text-sm">No consultation available now.</p>
        )}
      </div>

      <div className="px-6 pb-6 pt-0">
        <button
          className={`${btnBase} ${isActive ? `${btnEnabled} animate-bounce` : btnDisabled}`}
          disabled={!isActive}
          onClick={() => {
            if (isActive && appointmentId) {
              navigate(`/doctor/video-room/${appointmentId}`);
            }
          }}
        >
          Join Now
        </button>
      </div>
    </div>
  );
};

export default DocVideoCallCard;
