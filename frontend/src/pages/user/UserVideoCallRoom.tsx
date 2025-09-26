import { useNavigate } from 'react-router-dom';
import VideoCallRoom from '../../components/common/VideoCallRoom';
import { UserContext } from '../../context/UserContext';
import { useContext, useEffect } from 'react';

const UserVideoCall = () => {
  const navigate = useNavigate();
  const context = useContext(UserContext);
  if (!context) throw new Error('Home must be used within an UserContextProvider');

  const { token } = context;

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  return <VideoCallRoom role="user" />;
};

export default UserVideoCall;
