import React, { createContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { getActiveAppointmentAPI } from '../services/appointmentServices';
import { getActiveDoctorAppointmentAPI } from '../services/doctorServices';

interface VideoCallCtx {
  active: boolean;
  appointmentId: string | null;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000';

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
  const [dismissed, setDismissed] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    const socket: Socket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket'],
      auth: {
        userId: localStorage.getItem('userId') || '',
        role: isDoctor ? 'doctor' : 'user',
      },
    });

    socket.on('active-appointment', (data: { appointmentId: string }) => {
      if (data.appointmentId) {
        setActive(true);
        setAppointmentId(data.appointmentId);
        setDismissed(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isDoctor]);

  useEffect(() => {
    const checkActiveAppointment = async () => {
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
      } catch (err) {
        console.error('Error fetching active appointment:', err);
      }
    };

    checkActiveAppointment();
  }, [isDoctor, isUser]);

  return (
    <VideoCallContext.Provider value={{ active, appointmentId }}>
      {children}
      {active && !joined && !dismissed && notInRoom && appointmentId && (
        <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-xl px-4 py-3 w-80">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">📞 Appointment Active</h3>
              <p className="text-gray-700 mt-1">Your consultation is live. Join now.</p>
            </div>
            <button
              className="ml-3 text-gray-500 hover:text-gray-700"
              onClick={() => setDismissed(true)}
            >
              ✕
            </button>
          </div>
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
