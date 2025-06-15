import { Route } from "react-router-dom";

// Layout
import DoctorLayout from "../layouts/DoctorLayout";

// Doctor Pages
import DoctorLogin from "../pages/admin/AdminLogin";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";
import DoctorProfile from "../pages/doctor/DoctorProfile";
import DoctorConsultation from "../pages/doctor/DoctorConsultation";
import DocChatPage from "../pages/doctor/DocChatPage";
import DoctorLandingPage from "../pages/doctor/DoctorLandingPage";
import DoctorRegister from "../pages/doctor/DoctorRegister";

const DoctorRoutes = () => {
  return (
    <>
      <Route path="/doctor" element={<DoctorLandingPage />} />
      <Route path="/doctor/register" element={<DoctorRegister />} />
      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route
        path="/doctor/dashboard"
        element={
          <DoctorLayout>
            <DoctorDashboard />
          </DoctorLayout>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <DoctorLayout>
            <DoctorAppointments />
          </DoctorLayout>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <DoctorLayout>
            <DoctorProfile />
          </DoctorLayout>
        }
      />
      <Route
        path="/doctor/consultation"
        element={
          <DoctorLayout>
            <DoctorConsultation />
          </DoctorLayout>
        }
      />
      <Route path="/doctor/chats" element={<DocChatPage />} />
    </>
  );
};

export default DoctorRoutes;
