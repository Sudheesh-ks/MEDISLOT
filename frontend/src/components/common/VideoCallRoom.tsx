import { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdCallEnd,
  MdEdit,
  MdSignalCellularAlt,
} from 'react-icons/md';
import { NotifContext } from '../../context/NotificationContext';
import PatientHistoryForm from '../../components/doctor/PatientHistoryForm';
import { getAppointmentByIdAPI } from '../../services/appointmentServices';
import type { AppointmentTypes } from '../../types/appointment';

interface VideoCallRoomProps {
  role: 'user' | 'doctor';
  backUrl?: string;
}

const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ role, backUrl }) => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const { socket } = useContext(NotifContext);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [callStarted, setCallStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [appointmentData, setAppointmentsData] = useState<AppointmentTypes | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStarted) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStarted]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!appointmentId) return;

    (async () => {
      try {
        const appointment = await getAppointmentByIdAPI(appointmentId);
        setPatientId(appointment.userData._id);
        setAppointmentsData(appointment);
      } catch (err) {
        console.error('Error fetching appointment:', err);
      }
    })();
  }, [appointmentId]);

  useEffect(() => {
    if (!socket || !appointmentId) return;

    socket.emit('join-video-room', appointmentId);
    setupLocalMedia();

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          appointmentId,
          candidate: event.candidate,
          senderId: socket.id,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    socket.on('other-user-joined', async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('webrtc-offer', {
        appointmentId,
        offer,
        senderId: socket.id,
      });
    });

    socket.on('webrtc-offer', async ({ offer }) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('webrtc-answer', {
        appointmentId,
        answer,
        senderId: socket.id,
      });
      setCallStarted(true);
    });

    socket.on('webrtc-answer', async ({ answer }) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      setCallStarted(true);
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('end-call', () => {
      cleanup();
      alert('Call ended by the other user.');
      navigate(
        backUrl ||
          (role === 'doctor'
            ? `/doctor/consultation-end/${appointmentId}`
            : `/consultation-end/${appointmentId}`)
      );
    });

    return () => {
      socket.emit('leave-video-room', appointmentId);
      cleanup();
      socket.off('other-user-joined');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('ice-candidate');
      socket.off('end-call');
    };
  }, [appointmentId, socket]);

  const setupLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current?.addTrack(track, stream);
      });
    } catch (err) {
      console.error('Media error:', err);
    }
  };

  const cleanup = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsHidden((prev) => !prev);
  };

  const endCall = () => {
    socket?.emit('end-call', { appointmentId });
    cleanup();
    navigate(
      backUrl ||
        (role === 'doctor'
          ? `/doctor/consultation-end/${appointmentId}`
          : `/consultation-end/${appointmentId}`)
    );
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white overflow-hidden">
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay with participant info */}
      {callStarted && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-slate-900/60 backdrop-blur-md px-3 sm:px-4 py-2 rounded-lg shadow-md flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-cyan-500">
            {role === 'doctor' ? (
              <img
                src={appointmentData?.userData?.image}
                alt="Patient"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={appointmentData?.docData?.image}
                alt="Doctor"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm md:text-base truncate max-w-[120px] sm:max-w-[200px]">
              {role === 'doctor' ? appointmentData?.userData.name : appointmentData?.docData.name}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-300">
              Duration: {formatDuration(callDuration)}
            </p>
          </div>
        </div>
      )}

      {/* Network Indicator */}
      {callStarted && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-900/60 backdrop-blur-md px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-md flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <MdSignalCellularAlt className="text-green-400 text-base sm:text-lg" />
          <span className="text-gray-200">Good</span>
        </div>
      )}

      {/* Local Video */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-28 h-20 sm:w-40 sm:h-28 rounded-lg border-2 border-white object-cover shadow-xl z-20"
      />

      {/* Controls */}
      {callStarted && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-5 bg-slate-900/70 backdrop-blur-xl px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg z-20">
          {/* Mic */}
          <button
            onClick={toggleMic}
            className="p-2 sm:p-3 rounded-full hover:bg-slate-700 transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MdMicOff className="text-red-400 text-xl sm:text-2xl" />
            ) : (
              <MdMic className="text-green-400 text-xl sm:text-2xl" />
            )}
          </button>

          {/* Video */}
          <button
            onClick={toggleVideo}
            className="p-2 sm:p-3 rounded-full hover:bg-slate-700 transition"
            title={isHidden ? 'Show Video' : 'Hide Video'}
          >
            {isHidden ? (
              <MdVideocamOff className="text-red-400 text-xl sm:text-2xl" />
            ) : (
              <MdVideocam className="text-blue-400 text-xl sm:text-2xl" />
            )}
          </button>

          {/* Add History For Doctors */}
          {role === 'doctor' && (
            <button
              onClick={() => setShowHistoryForm(true)}
              className="p-2 sm:p-3 rounded-full hover:bg-slate-700 transition"
              title="Add Patient History"
            >
              <MdEdit className="text-yellow-400 text-xl sm:text-2xl" />
            </button>
          )}

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-2 sm:p-3 rounded-full bg-red-600 hover:bg-red-500 transition"
            title="Hang Up"
          >
            <MdCallEnd className="text-white text-xl sm:text-2xl" />
          </button>
        </div>
      )}

      {/* Patient History Modal */}
      {showHistoryForm && role === 'doctor' && patientId && (
        <div className="absolute top-16 sm:top-20 right-3 sm:right-6 w-[90%] sm:w-[450px] max-h-[75%] sm:max-h-[80%] bg-slate-900/95 text-white rounded-xl shadow-xl z-30 overflow-y-auto backdrop-blur-lg border border-slate-700">
          <div className="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-700">
            <h2 className="text-base sm:text-lg font-semibold text-cyan-400">Patient History</h2>
            <button
              onClick={() => setShowHistoryForm(false)}
              className="text-gray-400 hover:text-white text-lg sm:text-xl"
            >
              ✕
            </button>
          </div>
          <div className="p-3 sm:p-4">
            <PatientHistoryForm
              patientId={patientId}
              appointmentId={appointmentId!}
              onClose={() => setShowHistoryForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallRoom;
