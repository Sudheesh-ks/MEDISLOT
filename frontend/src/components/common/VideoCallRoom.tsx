import { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdCallEnd } from 'react-icons/md';
import { NotifContext } from '../../context/NotificationContext';

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

  useEffect(() => {
    if (!socket || !appointmentId) return;

    // let isInitiator = false;

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
      // isInitiator = true;
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
      navigate(backUrl || (role === 'doctor' ? '/doctor/consultation-end' : '/consultation-end'));
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

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="absolute bottom-4 right-4 w-40 h-28 rounded-lg border-2 border-white object-cover shadow-lg"
      />

      <div className="absolute top-4 left-4 text-xl font-bold z-10">
        Video Room - {role === 'doctor' ? 'Doctor' : 'Patient'}
      </div>

      {callStarted && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-6">
          <button
            onClick={() => {
              if (!localStreamRef.current) return;
              localStreamRef.current
                .getAudioTracks()
                .forEach((track) => (track.enabled = !track.enabled));
              setIsMuted((prev) => !prev);
            }}
            className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full text-white text-xl"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MdMicOff /> : <MdMic />}
          </button>

          <button
            onClick={() => {
              if (!localStreamRef.current) return;
              localStreamRef.current
                .getVideoTracks()
                .forEach((track) => (track.enabled = !track.enabled));
              setIsHidden((prev) => !prev);
            }}
            className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full text-white text-xl"
            title={isHidden ? 'Show Video' : 'Hide Video'}
          >
            {isHidden ? <MdVideocamOff /> : <MdVideocam />}
          </button>

          <button
            onClick={() => {
              socket?.emit('end-call', { appointmentId });
              cleanup();
              navigate(
                backUrl || (role === 'doctor' ? '/doctor/consultation-end' : '/consultation-end')
              );
            }}
            className="bg-red-600 hover:bg-red-500 p-3 rounded-full text-white text-xl"
            title="Hang Up"
          >
            <MdCallEnd />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCallRoom;
