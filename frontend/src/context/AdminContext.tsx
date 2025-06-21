import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-toastify";
import type { Doctor } from "../assets/user/assets";
import type { userData } from "../types/user";
import {
  adminCancelAppointmentAPI,
  adminDashboardAPI,
  approveDoctorAPI,
  changeAvailabilityAPI,
  getAllAppointmentsAPI,
  getAllDoctorsAPI,
  getAllUsersAPI,
  refreshAdminAccessTokenAPI,
  rejectDoctorAPI,
  toggleUserBlockAPI,
} from "../services/adminServices";
import { showErrorToast } from "../utils/errorHandler";
import type { AppointmentTypes } from "../types/appointment";
import { clearAdminAccessToken, getAdminAccessToken, updateAdminAccessToken } from "./tokenManagerAdmin";

interface AdminContextType {
  aToken: string;
  setAToken: (token: string) => void;
  backendUrl: string;
  doctors: Doctor[];
  getAllDoctors: () => Promise<void>;
  changeAvailability: (docId: string) => Promise<void>;
  users: userData[];
  getAllUsers: () => Promise<void>;
  toggleBlockUser: (userId: string) => Promise<void>;
  appointments: AppointmentTypes[];
  setAppointments: React.Dispatch<React.SetStateAction<AppointmentTypes[]>>;
  getAllAppointments: () => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  dashData: any;
  getDashData: () => Promise<void>;
  approveDoctor: (doctorId: string) => Promise<void>;
rejectDoctor: (doctorId: string) => Promise<void>;
  loading: boolean;
}

export const AdminContext = createContext<AdminContextType | null>(null);

interface AdminContextProviderProps {
  children: ReactNode;
}

const AdminContextProvider = ({ children }: AdminContextProviderProps) => {
const [aToken, setAToken] = useState(getAdminAccessToken() ?? "");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [users, setUsers] = useState<userData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentTypes[]>([]);
  const [dashData, setDashData] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;


    const setToken = (newToken: string | null) => {
      setAToken(newToken ?? "");
      if (newToken) {
        updateAdminAccessToken(newToken);
      } else {
        clearAdminAccessToken();
      }
    };
  

  const getAllDoctors = async () => {
    try {
      const { data } = await getAllDoctorsAPI(aToken);
      if (data.success) {
        setDoctors(data.doctors);
        console.log(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };


  const approveDoctor = async (doctorId: string) => {
  try {
    const { data } = await approveDoctorAPI(doctorId, aToken);
    if (data.success) {
      toast.success(data.message);
      getAllDoctors(); 
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    showErrorToast(error);
  }
};

const rejectDoctor = async (doctorId: string) => {
  try {
    const { data } = await rejectDoctorAPI(doctorId, aToken);
    if (data.success) {
      toast.success(data.message);
      getAllDoctors(); // refresh list
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    showErrorToast(error);
  }
};


  const changeAvailability = async (docId: string) => {
    try {
      const doctor = doctors.find((doc) => doc._id === docId);
      if (!doctor) {
        toast.error("Doctor not found");
        return;
      }

      const newAvailability = !doctor.available;

      const { data } = await changeAvailabilityAPI(
        docId,
        newAvailability,
        aToken
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const getAllUsers = async () => {
    try {
      const { data } = await getAllUsersAPI(aToken);
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const toggleBlockUser = async (userId: string) => {
    try {
      const user = users.find((u) => u._id === userId);
      if (!user) {
        toast.error("User not found");
        return;
      }

      const newBlockStatus = !user.isBlocked;

      const { data } = await toggleUserBlockAPI(userId, newBlockStatus, aToken);
      if (data.success) {
        toast.success(data.message);
        getAllUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await getAllAppointmentsAPI(aToken);

      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { data } = await adminCancelAppointmentAPI(appointmentId, aToken);

      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
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
            "Admin token refresh failed",
            err.response?.data || err.message
          );
          setToken(null);
        } finally {
          setLoading(false);
        }
      };
  
      const wasLoggedOut = localStorage.getItem("isAdminLoggedOut") === "true";
  
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
    getAllDoctors,
    changeAvailability,
    users,
    getAllUsers,
    toggleBlockUser,
    appointments,
    setAppointments,
    getAllAppointments,
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
