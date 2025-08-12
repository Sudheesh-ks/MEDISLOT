import { useParams } from 'react-router-dom';
import ConsultationEndedCard from '../../components/common/ConsulationEnded';

const DoctorConsultationEndedPage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();

  return (
    <div className="min-h-screen p-6 flex justify-center items-center bg-[#0a0a0a]">
      <div className="w-full max-w-xl">
        <ConsultationEndedCard role="doctor" appointmentId={appointmentId!} />
      </div>
    </div>
  );
};

export default DoctorConsultationEndedPage;
