import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import AppContextProvider from './context/AppContext.tsx';
import AdminContextProvider from './context/AdminContext.tsx';
import DoctorContextProvider from './context/DoctorContext.tsx';
import { NotifProvider } from './context/NotificationContext.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AdminContextProvider>
      <DoctorContextProvider>
          <AppContextProvider>
            <NotifProvider>
            <App />
            </NotifProvider>
          </AppContextProvider>
      </DoctorContextProvider>
    </AdminContextProvider>
  </BrowserRouter>
);
