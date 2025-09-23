import Header from '../../components/user/Header';
import SpecialityMenu from '../../components/user/SpecialityMenu';
import TopDoctors from '../../components/user/TopDoctors';
import Banner from '../../components/user/Banner';
import { useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const context = useContext(UserContext);
  if (!context) throw new Error('Home must be used within an UserContextProvider');

  const { token } = context;

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
};

export default Home;
