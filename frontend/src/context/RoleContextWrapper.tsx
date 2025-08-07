import React from 'react';
import { useLocation } from 'react-router-dom';

import AdminContextProvider from './AdminContext';
import DoctorContextProvider, { useDoctorContext } from './DoctorContext';
import UserContextProvider, { useUserContext } from './UserContext';
import { NotifProvider } from './NotificationContext';
import { VideoCallProvider } from './VideoCallContext';

function UserNotificationWrapper({ children }: { children: React.ReactNode }) {
  const { userData } = useUserContext();
  return <NotifProvider currentUser={userData}>{children}</NotifProvider>;
}

function DoctorNotificationWrapper({ children }: { children: React.ReactNode }) {
  const { profileData } = useDoctorContext();
  return <NotifProvider currentUser={profileData}>{children}</NotifProvider>;
}

export function RoleContextWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return <AdminContextProvider>{children}</AdminContextProvider>;
  }

  if (location.pathname.startsWith('/doctor')) {
    return (
      <DoctorContextProvider>
        <DoctorNotificationWrapper>
          <VideoCallProvider>{children}</VideoCallProvider>
        </DoctorNotificationWrapper>
      </DoctorContextProvider>
    );
  }

  return (
    <UserContextProvider>
      <UserNotificationWrapper>
        <VideoCallProvider>{children}</VideoCallProvider>
      </UserNotificationWrapper>
    </UserContextProvider>
  );
}
