import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-toastify';
import type { Doctor } from '../assets/user/assets';
import type { userData } from '../types/user';
import {
  adminCancelAppointmentAPI,
  adminDashboardAPI,
  approveDoctorAPI,
  getAppointmentsPaginatedAPI,
  // getAllDoctorsAPI,
  getDoctorsPaginatedAPI,
  // getAllUsersAPI,
  getUsersPaginatedAPI,
  refreshAdminAccessTokenAPI,
  rejectDoctorAPI,
  toggleUserBlockAPI,
} from '../services/adminServices';
import { showErrorToast } from '../utils/errorHandler';
import type { AppointmentTypes } from '../types/appointment';
import { clearAdminAccessToken, getAdminAccessToken, updateAdminAccessToken } from './tokenManagerAdmin';

interface PaginationData {
  data: any[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface AdminContextType {
  aToken: string;
  setAToken: (token: string) => void;
  backendUrl: string;
  doctors: Doctor[];
  getDoctorsPaginated: (page: number, limit: number) => Promise<PaginationData>;
  users: userData[];
  getUsersPaginated: (page: number, limit: number) => Promise<PaginationData>;
  toggleBlockUser: (userId: string) => Promise<userData | null>;
  appointments: AppointmentTypes[];
  setAppointments: React.Dispatch<React.SetStateAction<AppointmentTypes[]>>;
  getAppointmentsPaginated: (page: number, limit: number) => Promise<PaginationData>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  dashData: any;
  getDashData: () => Promise<void>;
  approveDoctor: (doctorId: string) => Promise<void>;
  rejectDoctor: (doctorId: string, reason: string) => Promise<void>;
  loading: boolean;
}

export const AdminContext = createContext<AdminContextType | null>(null);

interface AdminContextProviderProps {
  children: ReactNode;
}

const AdminContextProvider = ({ children }: AdminContextProviderProps) => {
const [aToken, setAToken] = useState(getAdminAccessToken() ?? '');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [users, setUsers] = useState<userData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentTypes[]>([]);
  const [dashData, setDashData] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;


    const setToken = (newToken: string | null) => {
      setAToken(newToken ?? '');
      if (newToken) {
        updateAdminAccessToken(newToken);
      } else {
        clearAdminAccessToken();
      }
    };
  

  const getDoctorsPaginated = async (page: number, limit: number): Promise<PaginationData> => {
    try {
      const { data } = await getDoctorsPaginatedAPI(page, limit, aToken);
      if (data.success) {
        return {
          data: data.data,
          totalCount: data.totalCount,
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage
        };
      } else {
        toast.error(data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  };

  const approveDoctor = async (doctorId: string) => {
  try {
    const { data } = await approveDoctorAPI(doctorId, aToken);
    if (data.success) {
      toast.success(data.message);
      // getAllDoctors();
        setDoctors((prevDoctors) =>
    prevDoctors.map((doc) =>
      doc._id === doctorId ? { ...doc, isApproved: true } : doc
    )
  );
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    showErrorToast(error);
  }
};

const rejectDoctor = async (doctorId: string, reason: string) => {
  try {
    const { data } = await rejectDoctorAPI(doctorId, reason, aToken);
    if (data.success) {
      toast.success(data.message);
      // getAllDoctors(); 
        setDoctors((prevDoctors) =>
    prevDoctors.filter((doc) => doc._id !== doctorId)
  );
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    showErrorToast(error);
  }
};


  const getUsersPaginated = async (page: number, limit: number): Promise<PaginationData> => {
    try {
      const { data } = await getUsersPaginatedAPI(page, limit, aToken);
      if (data.success) {
        setUsers(data.data);
        return {
          data: data.data,
          totalCount: data.totalCount,
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage
        };
      } else {
        toast.error(data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  };

  const toggleBlockUser = async (userId: string) => {
  try {
    const user = users.find((u) => u._id === userId);
    if (!user) {
      toast.error('User not found');
      return null;
    }

    const newBlockStatus = !user.isBlocked;
    const { data } = await toggleUserBlockAPI(userId, newBlockStatus, aToken);

    if (data.success) {
      const updatedUser = data.data;
      toast.success(`User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'}`);
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === updatedUser._id ? updatedUser : u
        )
      );
      return updatedUser;
    } else {
      toast.error(data.message);
      return null;
    }
  } catch (error) {
    showErrorToast(error);
    return null;
  }
};


  const getAppointmentsPaginated = async (page: number, limit: number): Promise<PaginationData> => {
    try {
      const { data } = await getAppointmentsPaginatedAPI(page, limit, aToken);
      if (data.success) {
        return {
          data: data.data,
          totalCount: data.totalCount,
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage
        };
      } else {
        toast.error(data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { data } = await adminCancelAppointmentAPI(appointmentId, aToken);

      if (data.success) {
        toast.success(data.message);
        // getAllAppointments(); 
          setAppointments((prev) =>
    prev.filter((a) => a._id !== appointmentId)
  );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await adminDashboardAPI(aToken);

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };


   useEffect(() => {
      const tryRefresh = async () => {
        try {
          const res = await refreshAdminAccessTokenAPI();
          const newToken = res.data?.token;
          if (newToken) {
            setToken(newToken);
            await getDashData();
          } else {
            setToken(null);
          }
        } catch (err: any) {
          console.warn(
            'Admin token refresh failed',
            err.response?.data || err.message
          );
          setToken(null);
        } finally {
          setLoading(false);
        }
      };
  
      const wasLoggedOut = localStorage.getItem('isAdminLoggedOut') === 'true';
  
      if (!getAdminAccessToken()) {
         if (!wasLoggedOut) {
        tryRefresh();
      }
      } else {
        getDashData().finally(() => setLoading(false));
      }

    }, []);


  const value: AdminContextType = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getDoctorsPaginated,
    users,
    getUsersPaginated,
    toggleBlockUser,
    appointments,
    setAppointments,
    getAppointmentsPaginated,
    cancelAppointment,
    dashData,
    getDashData,
    approveDoctor,
    rejectDoctor,
    loading,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export default AdminContextProvider;
