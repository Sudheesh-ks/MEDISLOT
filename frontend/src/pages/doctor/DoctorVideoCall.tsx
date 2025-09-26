import { useContext, useEffect } from 'react';
import VideoCallRoom from '../../components/common/VideoCallRoom';
import { DoctorContext } from '../../context/DoctorContext';
import { useNavigate } from 'react-router-dom';

const DoctorVideoCall = () => {
  const navigate = useNavigate();
  const { dToken } = useContext(DoctorContext);
  useEffect(() => {
    if (!dToken) navigate('/doctor/login');
  }, [dToken]);

  return <VideoCallRoom role="doctor" />;
};

export default DoctorVideoCall;
