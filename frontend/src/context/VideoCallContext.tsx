import React, { createContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getActiveAppointmentAPI } from '../services/appointmentServices';
import { getActiveDoctorAppointmentAPI } from '../services/doctorServices';

interface VideoCallCtx {
  active: boolean;
  appointmentId: string | null;
}

export const VideoCallContext = createContext<VideoCallCtx>({
  active: false,
  appointmentId: null,
});

export const VideoCallProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isDoctor = location.pathname.startsWith('/doctor');
  const isUser = !isDoctor && !location.pathname.startsWith('/admin');
  const notInRoom =
    !location.pathname.startsWith('/video-room') &&
    !location.pathname.startsWith('/doctor/video-room');

  const [active, setActive] = useState(false);
  const [joined, setJoined] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveAppointment = async () => {
      try {
        let res;
        if (isDoctor) {
          res = await getActiveDoctorAppointmentAPI();
        } else if (isUser) {
          res = await getActiveAppointmentAPI();
        }

        if (res?.active && res?.appointmentId) {
          setActive(true);
          setAppointmentId(res.appointmentId);
        }
      } catch {
        setActive(false);
      }
    };

    fetchActiveAppointment();
    const interval = setInterval(fetchActiveAppointment, 15_000);
    return () => clearInterval(interval);
  }, [isDoctor, isUser]);

  return (
    <VideoCallContext.Provider value={{ active, appointmentId }}>
      {children}
      {active && !joined && notInRoom && appointmentId && (
        <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-xl px-4 py-3 w-80">
          <h3 className="font-semibold text-lg">📞 Appointment Active</h3>
          <p className="text-gray-700 mt-1">Your consultation is live. Join now.</p>
          <button
            className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            onClick={() => {
              setJoined(true);
              const prefix = isDoctor ? '/doctor' : '';
              navigate(`${prefix}/video-room/${appointmentId}`);
            }}
          >
            Join Video Call
          </button>
        </div>
      )}
    </VideoCallContext.Provider>
  );
};
