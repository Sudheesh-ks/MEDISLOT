import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-toastify";
import { showErrorToast } from "../utils/errorHandler";
import {
  AppointmentCancelAPI,
  AppointmentConfirmAPI,
  getDoctorAppointmentsAPI,
  getDoctorProfileAPI,
  refreshDoctorAccessTokenAPI,
} from "../services/doctorServices";
import type { AppointmentTypes } from "../types/appointment";
import type { DoctorProfileType } from "../types/doctor";
import {
  getDoctorAccessToken,
  updateDoctorAccessToken,
  clearDoctorAccessToken,
} from "./tokenManagerDoctor";

interface DoctorContextType {
  dToken: string;
  setDToken: (token: string | null) => void;
  backendUrl: string;
  appointments: AppointmentTypes[];
  setAppointments: React.Dispatch<React.SetStateAction<AppointmentTypes[]>>;
  getAppointments: () => Promise<void>;
  confirmAppointment: (appointmentId: string) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  profileData: DoctorProfileType | null;
  setProfileData: React.Dispatch<
    React.SetStateAction<DoctorProfileType | null>
  >;
  getProfileData: () => Promise<void>;
  loading: boolean;
}

export const DoctorContext = createContext<DoctorContextType>(
  {} as DoctorContextType
);

interface DoctorContextProviderProps {
  children: ReactNode;
}

const DoctorContextProvider = ({ children }: DoctorContextProviderProps) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState("");
  const [appointments, setAppointments] = useState<AppointmentTypes[]>([]);
  const [profileData, setProfileData] = useState<DoctorProfileType | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const setToken = (newToken: string | null) => {
    setDToken(newToken ?? "");
    if (newToken) {
      updateDoctorAccessToken(newToken);
    } else {
      clearDoctorAccessToken();
      setAppointments([]);
      setProfileData(null);
    }
  };

  const getAppointments = async () => {
    try {
      const { data } = await getDoctorAppointmentsAPI();
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const confirmAppointment = async (appointmentId: string) => {
    try {
      const { data } = await AppointmentConfirmAPI(appointmentId);
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { data } = await AppointmentCancelAPI(appointmentId);
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await getDoctorProfileAPI();
      if (data.success) {
        setProfileData(data.profileData);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await refreshDoctorAccessTokenAPI();
        const newToken = res.data?.token;
        if (newToken) {
          setToken(newToken);
          await getProfileData();
        } else {
          setToken(null);
        }
      } catch (err: any) {
        console.warn(
          "Doctor token refresh failed",
          err.response?.data || err.message
        );
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    if (!getDoctorAccessToken()) {
      tryRefresh();
    } else {
      getProfileData().finally(() => setLoading(false));
    }
  }, []);

  const value: DoctorContextType = {
    dToken,
    setDToken: setToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    confirmAppointment,
    cancelAppointment,
    profileData,
    setProfileData,
    getProfileData,
    loading,
  };

  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
