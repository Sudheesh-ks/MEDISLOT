import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Doctor } from "../assets/user/assets";
import { assets } from "../assets/user/assets";
import axios from "axios";
import { toast } from "react-toastify";
// import type { userData } from "../types/user";

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
    currencySymbol: string;
    backendUrl: string;
    token: string | null;
    setToken: (token: string | null) => void;
    userData: userData | null;
    setUserData: React.Dispatch<React.SetStateAction<userData | null>>;
    loadUserProfileData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);


interface AppContextProviderProps {
    children: ReactNode;
}

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {

    const currencySymbol = '$'

    const backendUrl = import.meta.env.VITE_BACKEND_URL


    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState<string | null>(localStorage.getItem('token') ?? '')
    const [userData, setUserData] = useState<null | userData>({
        name: '',
        email: '',
        phone: '',
        image: `${assets.upload_image}`,
        address: {
            line1: '',
            line2: ''
        },
        gender: '',
        dob: '',
    })


    const getDoctorsData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred");
            }
        }
    }


    const loadUserProfileData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) {
                if (data.userData.isBlocked) {
                    toast.error("Your account has been blocked. Logging out.");
                    localStorage.removeItem('token');
                    setToken(null);
                    return;
                }
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred");
            }
        }
    }

    const value: AppContextType = {
        doctors,
        currencySymbol,
        token, setToken,
        backendUrl,
        userData, setUserData,
        loadUserProfileData
    }


    useEffect(() => {
        getDoctorsData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        } else {
            setUserData({
                name: '',
                email: '',
                phone: '',
                image: `${assets.upload_image}`,
                address: {
                    line1: '',
                    line2: ''
                },
                gender: '',
                dob: '',
            })
        }
    }, [token])

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider