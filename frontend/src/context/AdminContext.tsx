import { createContext, useState } from "react";
import type { ReactNode } from "react";


interface AdminContextType {
    aToken: string;
    setAToken: (token: string) => void;
    backendUrl: string;
}

export const AdminContext = createContext<AdminContextType | null>(null);

interface AdminContextProviderProps {
  children: ReactNode
}

const AdminContextProvider = ({children}: AdminContextProviderProps) => {

    const [aToken, setAToken] = useState('');

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const value: AdminContextType = {
        aToken,setAToken,
        backendUrl
    }


    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider