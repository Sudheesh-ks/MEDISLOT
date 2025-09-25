import { Route } from 'react-router-dom';

// Layouts
import UserLayout from '../layouts/UserLayout';

// User Pages
import Home from '../pages/user/Home';
import Doctors from '../pages/user/Doctors';
import Contact from '../pages/user/Contact';
import About from '../pages/user/About';
import Login from '../pages/user/Login';
import MyProfile from '../pages/user/MyProfile';
import MyAppointments from '../pages/user/MyAppointments';
import Appointment from '../pages/user/Appointment';
import EmailVerificationPage from '../pages/user/EmailVerify';
import OtpVerificationPage from '../pages/user/OTPVerification';
import NewPasswordPage from '../pages/user/SetNewPassword';
import GoogleCallback from '../pages/user/GoogleCallback';
import Consultation from '../pages/user/Consultation';
import ChatPage from '../pages/user/ChatPage';
import UserLandingPage from '../pages/user/LandingPage';
import Wallet from '../pages/user/Wallet';
import UserVideoCall from '../pages/user/UserVideoCallRoom';
import ConsultationEndedPage from '../pages/user/ConsultationEndedpage';
import NotificationsPage from '../pages/user/NotificationPage';
import BlogPage from '../pages/user/BlogPage';
import BlogDetailPage from '../pages/user/BlogDetailPage';
import BlockedPage from '../pages/user/BlockedUsersPage';
import AppointmentDetail from '../pages/user/AppointmentDetail';

const UserRoutes = () => {
  return (
    <>
      <Route path="/" element={<UserLandingPage />} />
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
        path="/all-doctors"
        element={
          <UserLayout>
            <Doctors />
          </UserLayout>
        }
      />
      <Route
        path="/all-doctors/:speciality"
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
        path="/notifications"
        element={
          <UserLayout>
            <NotificationsPage />
          </UserLayout>
        }
      />
      <Route
        path="/wallet"
        element={
          <UserLayout>
            <Wallet />
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
        path="/appointment-details/:appointmentId"
        element={
          <UserLayout>
            <AppointmentDetail />
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
        path="/consultation/:doctorId/:appointmentId"
        element={
          <UserLayout>
            <Consultation />
          </UserLayout>
        }
      />
      <Route path="/video-room/:appointmentId" element={<UserVideoCall />} />
      <Route path="/consultation-end/:appointmentId" element={<ConsultationEndedPage />} />
      <Route path="/chats/:doctorId" element={<ChatPage />} />

      <Route
        path="/blogs"
        element={
          <UserLayout>
            <BlogPage />
          </UserLayout>
        }
      />

      <Route
        path="/blogs/:articleId"
        element={
          <UserLayout>
            <BlogDetailPage />
          </UserLayout>
        }
      />

      <Route
        path="/blocked"
        element={
          <UserLayout>
            <BlockedPage />
          </UserLayout>
        }
      />
    </>
  );
};

export default UserRoutes;
