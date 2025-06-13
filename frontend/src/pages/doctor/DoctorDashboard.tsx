import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const context = useContext(DoctorContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error(
      "DoctorAppointments must be used within DoctorContextProvider"
    );
  }

  const { dToken } = context;

  useEffect(() => {
    if (!dToken) {
      navigate("/doctor/login");
    }
  });

  return <div></div>;
};

export default DoctorDashboard;
