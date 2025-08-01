import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import { getUserProfileAPI } from '../services/userProfileServices';
import { getDoctorsPaginatedAPI } from '../services/doctorServices';
import { showErrorToast } from '../utils/errorHandler';
import {
  getUserAccessToken,
  updateUserAccessToken,
  clearUserAccessToken,
} from './tokenManagerUser';
import { refreshAccessTokenAPI } from '../services/authServices';

interface userData {
  _id?: string;
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

interface PaginationData {
  data: any[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UserContextType {
  getDoctorsPaginated: (page: number, limit: number) => Promise<PaginationData>;
  backendUrl: string;
  token: string | null;
  setToken: (token: string | null) => void;
  userData: userData | null;
  setUserData: React.Dispatch<React.SetStateAction<userData | null>>;
  loadUserProfileData: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
}

const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [token, setTokenState] = useState<string | null>(getUserAccessToken());
  const [userData, setUserData] = useState<null | userData>(null);

  const getDoctorsPaginated = useCallback(
    async (page: number, limit: number): Promise<PaginationData> => {
      try {
        const { data } = await getDoctorsPaginatedAPI(page, limit);
        if (data.success) {
          return {
            data: data.data,
            totalCount: data.totalCount,
            currentPage: data.currentPage,
            totalPages: data.totalPages,
            hasNextPage: data.hasNextPage,
            hasPrevPage: data.hasPrevPage,
          };
        } else {
          toast.error(data.message);
          throw new Error(data.message);
        }
      } catch (error) {
        showErrorToast(error);
        throw error;
      }
    },
    []
  );

  const loadUserProfileData = async () => {
    try {
      const accessToken = getUserAccessToken();
      if (!accessToken) {
        toast.error('Please login to continue...');
        return;
      }

      const { data } = await getUserProfileAPI(accessToken);
      if (data.success) {
        if (data.userData.isBlocked) {
          toast.error('Your account has been blocked. Logging out.');
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
      updateUserAccessToken(newToken);
    } else {
      clearUserAccessToken();
    }
  };

  const clearToken = () => {
    setTokenState(null);
    clearUserAccessToken();
  };

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await refreshAccessTokenAPI();
        const newToken = res.data?.token;

        if (newToken) {
          setToken(newToken);
          await loadUserProfileData();
        } else {
          clearToken();
        }
      } catch (err: any) {
        console.warn('User token refresh failed', err.response?.data || err.message);
        clearToken();
      }
    };

    const wasLoggedOut = localStorage.getItem('isUserLoggedOut') === 'true';

    if (!getUserAccessToken()) {
      if (!wasLoggedOut) {
        tryRefresh();
      }
    } else {
      loadUserProfileData();
    }
  }, []);


  const value: UserContextType = {
    getDoctorsPaginated,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};

export default UserContextProvider;
