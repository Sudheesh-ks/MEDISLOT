import { useNavigate, useParams } from 'react-router-dom';
import ConsultationEndedCard from '../../components/common/ConsulationEnded';
import { useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';

const ConsultationEndedPage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const context = useContext(UserContext);
  if (!context) throw new Error('Must be within UserContext');

  const { token } = context;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token]);

  return (
    <div className="min-h-screen p-6 flex justify-center items-center bg-[#0a0a0a]">
      <div className="w-full max-w-xl">
        <ConsultationEndedCard role="user" appointmentId={appointmentId!} />
      </div>
    </div>
  );
};

export default ConsultationEndedPage;
