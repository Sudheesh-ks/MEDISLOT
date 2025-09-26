import { useNavigate, useParams } from 'react-router-dom';
import ConsultationEndedCard from '../../components/common/ConsulationEnded';
import { useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';

const DoctorConsultationEndedPage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();

  const navigate = useNavigate();
  const { dToken } = useContext(DoctorContext);

  useEffect(() => {
    if (!dToken) navigate('/doctor/login');
  }, [dToken]);

  return (
    <div className="min-h-screen p-6 flex justify-center items-center bg-[#0a0a0a]">
      <div className="w-full max-w-xl">
        <ConsultationEndedCard role="doctor" appointmentId={appointmentId!} />
      </div>
    </div>
  );
};

export default DoctorConsultationEndedPage;
