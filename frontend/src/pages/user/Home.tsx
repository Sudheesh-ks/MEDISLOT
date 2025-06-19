import Header from "../../components/user/Header";
import SpecialityMenu from "../../components/user/SpecialityMenu";
import TopDoctors from "../../components/user/TopDoctors";
import Banner from "../../components/user/Banner";
import { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const Home = () => {

      const context = useContext(AppContext);
      const navigate = useNavigate();
      
        if (!context) {
          throw new Error("LangingPage must be used within an AppContextProvider");
        }
      
        const { token } = context;

    useEffect(() => {
      if (!token) {
        navigate("/login");
      }
    }, [token, navigate]);


  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
};

export default Home;
