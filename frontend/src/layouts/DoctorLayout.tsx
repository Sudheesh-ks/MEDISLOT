import React from "react";
import DoctorSidebar from "../components/doctor/DoctorSidebar";
import DoctorNavbar from "../components/doctor/DoctorNavbar";

const DoctorLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-4 sm:mx=[10%]">
      <DoctorNavbar />
      <div className="flex">
        <DoctorSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default DoctorLayout;
