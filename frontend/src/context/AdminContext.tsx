import axios from "axios";
import { createContext, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-toastify";
import type { Doctor } from "../assets/user/assets";


interface AdminContextType {
    aToken: string;
    setAToken: (token: string) => void;
    backendUrl: string;
    doctors: Doctor[];
    getAllDoctors: () => Promise<void>;
}

export const AdminContext = createContext<AdminContextType | null>(null);

interface AdminContextProviderProps {
  children: ReactNode
}

const AdminContextProvider = ({children}: AdminContextProviderProps) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ?? '');
    const [doctors, setDoctors] = useState([]);

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const getAllDoctors = async () => {
        try {
            
            const {data} = await axios.post(backendUrl + '/api/admin/all-doctors', {}, {headers:{aToken}})
            if(data.success){
                setDoctors(data.doctors)
                console.log(data.doctors)
            }else{
                toast.error(data.message)
            }

        } catch (error:any) {
            toast.error(error.message)
        }
    }

    const value: AdminContextType = {
        aToken,setAToken,
        backendUrl,doctors,
        getAllDoctors
    }


    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider