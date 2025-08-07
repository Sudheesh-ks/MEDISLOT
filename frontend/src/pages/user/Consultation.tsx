import VideoCallCard from '../../components/user/VideoCallCard';
import ChatCard from '../../components/user/ChatCard';
import { useParams } from 'react-router-dom';

const Consultation = () => {
  const { doctorId, appointmentId } = useParams();

  return (
    <div className="flex mt-28 place-items-center justify-center gap-6 p-8">
      <VideoCallCard appointmentId={appointmentId} />
      <ChatCard doctorId={doctorId} />
    </div>
  );
};

export default Consultation;
