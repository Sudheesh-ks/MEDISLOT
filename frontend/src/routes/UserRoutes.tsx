import { Route } from "react-router-dom";

// Layouts
import UserLayout from "../layouts/UserLayout";

// User Pages
import Home from "../pages/user/Home";
import Doctors from "../pages/user/Doctors";
import Contact from "../pages/user/Contact";
import About from "../pages/user/About";
import Login from "../pages/user/Login";
import MyProfile from "../pages/user/MyProfile";
import MyAppointments from "../pages/user/MyAppointments";
import Appointment from "../pages/user/Appointment";
import EmailVerificationPage from "../pages/user/EmailVerify";
import OtpVerificationPage from "../pages/user/OTPVerification";
import NewPasswordPage from "../pages/user/SetNewPassword";
import GoogleCallback from "../pages/user/GoogleCallback";
import Consultation from "../pages/user/Consultation";
import ChatPage from "../pages/user/ChatPage";
import UserLandingPage from "../pages/user/LandingPage";

const UserRoutes = () => {
  return (
    <>
      <Route
        path="/"
        element={
            <UserLandingPage />
        }
      />
      <Route
        path="/home"
        element={
          <UserLayout>
            <Home />
          </UserLayout>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/verify-otp" element={<OtpVerificationPage />} />
      <Route path="/reset-password" element={<NewPasswordPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route
        path="/doctors"
        element={
          <UserLayout>
            <Doctors />
          </UserLayout>
        }
      />
      <Route
        path="/doctors/:speciality"
        element={
          <UserLayout>
            <Doctors />
          </UserLayout>
        }
      />
      <Route
        path="/about"
        element={
          <UserLayout>
            <About />
          </UserLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <UserLayout>
            <Contact />
          </UserLayout>
        }
      />
      <Route
        path="/my-profile"
        element={
          <UserLayout>
            <MyProfile />
          </UserLayout>
        }
      />
      <Route
        path="/my-appointments"
        element={
          <UserLayout>
            <MyAppointments />
          </UserLayout>
        }
      />
      <Route
        path="/appointment/:docId"
        element={
          <UserLayout>
            <Appointment />
          </UserLayout>
        }
      />
      <Route
        path="/consultation/:doctorId"
        element={
          <UserLayout>
            <Consultation />
          </UserLayout>
        }
      />
      <Route path="/chats/:doctorId" element={<ChatPage />} />
    </>
  );
};

export default UserRoutes;
