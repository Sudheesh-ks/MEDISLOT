import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Doctor } from "../assets/user/assets";
import { assets } from "../assets/user/assets";
import { toast } from "react-toastify";
import { getUserProfileAPI } from "../services/userProfileServices";
import { getDoctorsAPI } from "../services/doctorServices";
import { showErrorToast } from "../utils/errorHandler";

interface userData {
  name: string;
  email: string;
  image: string;
  address: {
    line1: string;
    line2: string;
  };
  gender: string;
  dob: string;
  phone: string;
}

interface AppContextType {
  doctors: Doctor[];
  getDoctorsData: () => Promise<void>;
  currencySymbol: string;
  backendUrl: string;
  token: string | null;
  setToken: (token: string | null) => void;
  userData: userData | null;
  setUserData: React.Dispatch<React.SetStateAction<userData | null>>;
  loadUserProfileData: () => Promise<void>;
  calculateAge: (dob: string) => number;
  slotDateFormat: (slotDate: string) => string;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  const currencySymbol = "₹";

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token") ?? ""
  );
  const [userData, setUserData] = useState<null | userData>({
    name: "",
    email: "",
    phone: "",
    image: `${assets.upload_image}`,
    address: {
      line1: "",
      line2: "",
    },
    gender: "",
    dob: "",
  });

  const getDoctorsData = async () => {
    try {
      const { data } = await getDoctorsAPI();
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const loadUserProfileData = async () => {
    try {
      if (!token) {
        toast.error("Please login to continue...");
        return;
      }

      const { data } = await getUserProfileAPI(token);
      if (data.success) {
        if (data.userData.isBlocked) {
          toast.error("Your account has been blocked. Logging out.");
          localStorage.removeItem("token");
          setToken(null);
          return;
        }
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();
    return age;
  }

      const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const slotDateFormat = (slotDate: string): string => {
    const dateArray = slotDate.split('_');
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
  }

  const value: AppContextType = {
    doctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
    calculateAge,
    slotDateFormat
  };

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData({
        name: "",
        email: "",
        phone: "",
        image: `${assets.upload_image}`,
        address: {
          line1: "",
          line2: "",
        },
        gender: "",
        dob: "",
      });
    }
  }, [token]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
