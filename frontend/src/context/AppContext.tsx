// context/AppContext.tsx
import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Doctor } from "../assets/user/assets";
import { assets } from "../assets/user/assets";
import { toast } from "react-toastify";
import { getUserProfileAPI } from "../services/userProfileServices";
import { getDoctorsAPI } from "../services/doctorServices";
import { showErrorToast } from "../utils/errorHandler";
import { updateAccessToken, clearAccessToken, getAccessToken } from "./tokenManager";
import { refreshAccessTokenAPI } from "../services/authServices";

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

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setTokenState] = useState<string | null>(getAccessToken());
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
      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error("Please login to continue...");
        return;
      }

      const { data } = await getUserProfileAPI(accessToken);
      if (data.success) {
        if (data.userData.isBlocked) {
          toast.error("Your account has been blocked. Logging out.");
          clearToken();
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

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      updateAccessToken(newToken);
    } else {
      clearAccessToken();
    }
  };

  const clearToken = () => {
    setTokenState(null);
    clearAccessToken();
  };

  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    return today.getFullYear() - birthDate.getFullYear();
  };

  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate: string): string => {
    const dateArray = slotDate.split("_");
    return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`;
  };


 useEffect(() => {
  const tryRefreshToken = async () => {
    try {
      const response = await refreshAccessTokenAPI(); // endpoint returns new accessToken
      const newAccessToken = response.data?.token;

      if (newAccessToken) {
        setToken(newAccessToken); // this also updates tokenManager
        await loadUserProfileData(); // important!
      } else {
        clearToken();
      }
    } catch (error) {
      console.error("Auto refresh failed:", error);
      clearToken();
    }
  };

  // ✅ Try refreshing only if token is missing on mount
  if (!getAccessToken()) {
    tryRefreshToken();
  } else {
    loadUserProfileData(); // already have token, load profile
  }
}, []);

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

  const value: AppContextType = {
    doctors,
    getDoctorsData,
    currencySymbol,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData,
    calculateAge,
    slotDateFormat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
