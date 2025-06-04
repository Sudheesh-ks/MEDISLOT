import Header from "../../components/user/Header";
import SpecialityMenu from "../../components/user/SpecialityMenu";
import TopDoctors from "../../components/user/TopDoctors";
import Banner from "../../components/user/Banner";

const Home = () => {
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
