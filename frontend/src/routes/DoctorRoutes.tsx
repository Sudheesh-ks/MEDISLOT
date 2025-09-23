import { Route } from 'react-router-dom';

// Layout
import DoctorLayout from '../layouts/DoctorLayout';

// Doctor Pages
import DoctorLogin from '../pages/doctor/DoctorLogin';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import DoctorProfile from '../pages/doctor/DoctorProfile';
import DoctorConsultation from '../pages/doctor/DoctorConsultation';
import DocChatPage from '../pages/doctor/DocChatPage';
import DoctorRegister from '../pages/doctor/DoctorRegister';
import DoctorSlotManager from '../pages/doctor/DoctorSlotManagement';
import DoctorWallet from '../pages/doctor/DoctorWallet';
import DoctorVideoCall from '../pages/doctor/DoctorVideoCall';
import DoctorConsultationEndedPage from '../pages/doctor/DoctorConsultationEndedPage';
import DoctorNotificationsPage from '../pages/doctor/DoctorNotificationPage';
import DoctorAddBlogPage from '../pages/doctor/DoctorAddBlogPage';
import PatientHistoryPage from '../pages/doctor/PatientHistoryPage';
import DoctorBlogsPage from '../pages/doctor/DoctorBlogPage';
import DoctorEditBlogPage from '../pages/doctor/DoctorUpdateBlogs';
import DoctorChangePassword from '../components/doctor/DoctorChangePassword';
import DoctorChatList from '../pages/doctor/DoctorChatList';

const DoctorRoutes = () => {
  return (
    <>
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
        path="/doctor/change-password"
        element={
          <DoctorLayout>
            <DoctorChangePassword />
          </DoctorLayout>
        }
      />
      <Route
        path="/doctor/notifications"
        element={
          <DoctorLayout>
            <DoctorNotificationsPage />
          </DoctorLayout>
        }
      />
      <Route
        path="/doctor/wallet"
        element={
          <DoctorLayout>
            <DoctorWallet />
          </DoctorLayout>
        }
      />
      <Route
        path="/doctor/slot-management"
        element={
          <DoctorLayout>
            <DoctorSlotManager />
          </DoctorLayout>
        }
      />
      <Route
        path="/doctor/consultation/:userId/:appointmentId"
        element={
          <DoctorLayout>
            <DoctorConsultation />
          </DoctorLayout>
        }
      />

      <Route path="/doctor/video-room/:appointmentId" element={<DoctorVideoCall />} />
      <Route
        path="/doctor/consultation-end/:appointmentId"
        element={<DoctorConsultationEndedPage />}
      />
      <Route path="/doctor/chats/:userId" element={<DocChatPage />} />

      <Route
        path="/doctor/add-blog"
        element={
          <DoctorLayout>
            <DoctorAddBlogPage />
          </DoctorLayout>
        }
      />

      <Route
        path="/doctor/blogs"
        element={
          <DoctorLayout>
            <DoctorBlogsPage />
          </DoctorLayout>
        }
      />

      <Route
        path="/doctor/update-blog/:id"
        element={
          <DoctorLayout>
            <DoctorEditBlogPage />
          </DoctorLayout>
        }
      />

      <Route
        path="/doctor/patient-history/:userId/:appointmentId"
        element={
          <DoctorLayout>
            <PatientHistoryPage />
          </DoctorLayout>
        }
      />

      <Route
        path="/doctor/chatlist"
        element={
          <DoctorLayout>
            <DoctorChatList />
          </DoctorLayout>
        }
      />
    </>
  );
};

export default DoctorRoutes;
