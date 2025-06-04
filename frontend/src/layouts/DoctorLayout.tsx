import React from "react";
import Navbar from "../components/doctor/DoctorNavbar";
import Footer from "../components/doctor/DoctorFooter";

const DoctorLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-4 sm:mx=[10%]">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default DoctorLayout;
