import { createContext, useState } from "react";
import type { ReactNode } from "react";
import { showErrorToast } from "../utils/errorHandler";
import {
  AppointmentCancelAPI,
  AppointmentConfirmAPI,
  getDoctorAppointmentsAPI,
  getDoctorProfileAPI,
} from "../services/doctorServices";
import { toast } from "react-toastify";
import type { AppointmentTypes } from "../types/appointment";
import type { DoctorProfileType } from "../types/doctor";

interface DoctorContextType {
  dToken: string;
  setDToken: React.Dispatch<React.SetStateAction<string>>;
  backendUrl: string;
  appointments: AppointmentTypes[];
  setAppointments: React.Dispatch<React.SetStateAction<AppointmentTypes[]>>;
  getAppointments: () => Promise<void>;
  confirmAppointment: (appointmentId: string) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
    profileData: DoctorProfileType | null;
  setProfileData: React.Dispatch<React.SetStateAction<DoctorProfileType | null>>;
  getProfileData: () => Promise<void>;
}

export const DoctorContext = createContext<DoctorContextType>(
  {} as DoctorContextType
);

interface DoctorContextProviderProps {
  children: ReactNode;
}

const DoctorContextProvider = ({ children }: DoctorContextProviderProps) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") ?? "");
  const [appointments, setAppointments] = useState<AppointmentTypes[]>([]);
  const [profileData, setProfileData] = useState<DoctorProfileType | null>(null);

  const getAppointments = async () => {
    try {
      const { data } = await getDoctorAppointmentsAPI(dToken);

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
      const { data } = await AppointmentConfirmAPI(appointmentId, dToken);

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
      const { data } = await AppointmentCancelAPI(appointmentId, dToken);

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

      const { data } = await getDoctorProfileAPI(dToken);
      if(data.success){
        setProfileData(data.profileData);
      }
      
    } catch (error) {
      showErrorToast(error);
    }
  }

  const value: DoctorContextType = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    confirmAppointment,
    cancelAppointment,
    profileData, setProfileData,
    getProfileData
  };

  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
