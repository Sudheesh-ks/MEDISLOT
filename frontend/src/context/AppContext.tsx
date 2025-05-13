import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Doctor } from "../assets/user/assets";
import axios from "axios";
import { toast } from "react-toastify";



interface AppContextType {
    doctors: Doctor[];
    currencySymbol: string;
    backendUrl: string;
    token: string | null;
    setToken: (token: string | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);


interface AppContextProviderProps {
    children: ReactNode;
}

const AppContextProvider: React.FC<AppContextProviderProps> = ({children}) => {

    const currencySymbol = '$'

    const backendUrl = import.meta.env.VITE_BACKEND_URL


    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState<string | null>(localStorage.getItem('token') ?? '')


    const getDoctorsData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if(data.success){
                setDoctors(data.doctors)
            }else{
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

    const value: AppContextType = {
        doctors,
        currencySymbol,
        token, setToken,
        backendUrl
    }


    useEffect(() => {
        getDoctorsData()
    })

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider