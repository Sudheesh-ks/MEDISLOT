import Header from '../../components/user/Header';
import SpecialityMenu from '../../components/user/SpecialityMenu';
import TopDoctors from '../../components/user/TopDoctors';
import Banner from '../../components/user/Banner';
import { useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('Home must be used within an AppContextProvider');

  const { token } = ctx;

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