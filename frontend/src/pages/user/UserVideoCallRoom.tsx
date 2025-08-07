// import { useEffect, useRef, useState, useContext } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import {
//   MdMic,
//   MdMicOff,
//   MdVideocam,
//   MdVideocamOff,
//   MdCallEnd,
// } from "react-icons/md";
// import { NotifContext } from "../../context/NotificationContext";

import VideoCallRoom from '../../components/common/VideoCallRoom';

// const VideoCallRoom = () => {
//   const { appointmentId } = useParams();
//   const navigate = useNavigate();
//   const search = useLocation().search;
//   const targetUserId = new URLSearchParams(search).get("target");

//   const { socket } = useContext(NotifContext);
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);

//   const [callStarted, setCallStarted] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isHidden, setIsHidden] = useState(false);

//   useEffect(() => {
//     if (!socket || !appointmentId) return;

//     socket.emit("join-video-room", appointmentId);

//     const peerConnection = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     peerConnectionRef.current = peerConnection;

//     peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", {
//           appointmentId,
//           candidate: event.candidate,
//           senderId: socket.id,
//         });
//       }
//     };

//     peerConnection.ontrack = (event) => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//     socket.on("incoming-call", async ({ appointmentId: incomingappointmentId }) => {
//       if (incomingappointmentId !== appointmentId) return;

//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         });
//         localStreamRef.current = stream;

//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = stream;
//         }

//         stream.getTracks().forEach((track) => {
//           peerConnectionRef.current?.addTrack(track, stream);
//         });
//       } catch (err) {
//         console.error("Failed to prepare for incoming call:", err);
//       }
//     });

//     socket.on("webrtc-offer", async ({ offer }) => {
//       if (!peerConnectionRef.current) return;
//       await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerConnectionRef.current.createAnswer();
//       await peerConnectionRef.current.setLocalDescription(answer);
//       socket.emit("webrtc-answer", { appointmentId, answer, senderId: socket.id });
//       setCallStarted(true);
//     });

//     socket.on("webrtc-answer", async ({ answer }) => {
//       if (!peerConnectionRef.current) return;
//       await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       try {
//         await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
//       } catch (err) {
//         console.error("ICE error:", err);
//       }
//     });

//     socket.on("end-call", () => {
//       peerConnectionRef.current?.close();
//       peerConnectionRef.current = null;

//       if (localStreamRef.current) {
//         localStreamRef.current.getTracks().forEach((track) => track.stop());
//       }

//       if (localVideoRef.current) localVideoRef.current.srcObject = null;
//       if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//       alert("The other user has ended the call.");
//       navigate(-1);
//     });

//     return () => {
//       socket.emit("leave-video-room", appointmentId);
//       peerConnectionRef.current?.close();

//       if (localStreamRef.current) {
//         localStreamRef.current.getTracks().forEach((track) => track.stop());
//       }

//       if (localVideoRef.current) localVideoRef.current.srcObject = null;
//       if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//       socket.off("incoming-call");
//       socket.off("webrtc-offer");
//       socket.off("webrtc-answer");
//       socket.off("ice-candidate");
//       socket.off("end-call");
//     };
//   }, [appointmentId, socket, navigate]);

//   const startCall = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       localStreamRef.current = stream;

//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//       }

//       stream.getTracks().forEach((track) => {
//         peerConnectionRef.current?.addTrack(track, stream);
//       });

//       const offer = await peerConnectionRef.current?.createOffer();
//       await peerConnectionRef.current?.setLocalDescription(offer);
//       socket?.emit("webrtc-offer", {
//         appointmentId,
//         offer,
//         senderId: socket.id,
//         receiverId: targetUserId,
//       });

//       setCallStarted(true);
//     } catch (err) {
//       console.error("Failed to start call:", err);
//     }
//   };

//   const handleMute = () => {
//     if (!localStreamRef.current) return;
//     localStreamRef.current.getAudioTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//     });
//     setIsMuted((prev) => !prev);
//   };

//   const handleHide = () => {
//     if (!localStreamRef.current) return;
//     localStreamRef.current.getVideoTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//     });
//     setIsHidden((prev) => !prev);
//   };

//   const hangUp = () => {
//     socket?.emit("end-call", { appointmentId });
//     peerConnectionRef.current?.close();
//     peerConnectionRef.current = null;

//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => track.stop());
//       localStreamRef.current = null;
//     }

//     if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//     navigate(-1);
//   };

//   return (
//     <div className="relative w-full h-screen bg-black text-white overflow-hidden">
//       <video
//         ref={remoteVideoRef}
//         autoPlay
//         playsInline
//         className="absolute inset-0 w-full h-full object-cover"
//       />

//       <video
//         ref={localVideoRef}
//         autoPlay
//         muted
//         playsInline
//         className="absolute bottom-4 right-4 w-40 h-28 rounded-lg border-2 border-white object-cover shadow-lg"
//       />

//       <div className="absolute top-4 left-4 text-xl font-bold z-10">
//         Video Room
//       </div>

//       {!callStarted ? (
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
//           <button
//             onClick={startCall}
//             className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full shadow-md text-lg"
//           >
//             Start Call
//           </button>
//         </div>
//       ) : (
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-6">
//           <button
//             onClick={handleMute}
//             className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full text-white text-xl"
//             title={isMuted ? "Unmute" : "Mute"}
//           >
//             {isMuted ? <MdMicOff /> : <MdMic />}
//           </button>

//           <button
//             onClick={handleHide}
//             className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full text-white text-xl"
//             title={isHidden ? "Show Video" : "Hide Video"}
//           >
//             {isHidden ? <MdVideocamOff /> : <MdVideocam />}
//           </button>

//           <button
//             onClick={hangUp}
//             className="bg-red-600 hover:bg-red-500 p-3 rounded-full text-white text-xl"
//             title="Hang Up"
//           >
//             <MdCallEnd />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoCallRoom;

const UserVideoCall = () => {
  return <VideoCallRoom role="user" />;
};

export default UserVideoCall;
