import axios from "axios";
import { createContext, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-toastify";
import type { Doctor } from "../assets/user/assets";
import type { userData } from "../types/user";
import { changeAvailabilityAPI, getAllDoctorsAPI, getAllUsersAPI, toggleUserBlockAPI } from "../services/adminServices";


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
}

export const AdminContext = createContext<AdminContextType | null>(null);

interface AdminContextProviderProps {
    children: ReactNode
}

const AdminContextProvider = ({ children }: AdminContextProviderProps) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ?? '');
    const [doctors, setDoctors] = useState([]);
    const [users, setUsers] = useState<userData[]>([]);

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const getAllDoctors = async () => {
        try {

            const { data } = await getAllDoctorsAPI(aToken)
            if (data.success) {
                setDoctors(data.doctors)
                console.log(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMsg = error.response?.data?.message || "Something went wrong";
                toast.error(errorMsg);
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred");
            }
        }
    }

    const changeAvailability = async (docId: string) => {
        try {

            const { data } = await changeAvailabilityAPI(docId, aToken)
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMsg = error.response?.data?.message || "Something went wrong";
                toast.error(errorMsg);
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred");
            }
        }
    }


    const getAllUsers = async () => {
        try {

            const { data } = await getAllUsersAPI(aToken);
            if (data.success) {
                setUsers(data.users);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMsg = error.response?.data?.message || "Something went wrong";
                toast.error(errorMsg);
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred");
            }
        }
    }


    const toggleBlockUser = async (userId: string) => {
        try {

            const { data } = await toggleUserBlockAPI(userId, aToken);
            if (data.success) {
                toast.success(data.message);
                getAllUsers();
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMsg = error.response?.data?.message || "Something went wrong";
                toast.error(errorMsg);
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred");
            }
        }
    }


    const value: AdminContextType = {
        aToken, setAToken,
        backendUrl, doctors,
        getAllDoctors, changeAvailability,
        users, getAllUsers, toggleBlockUser
    }


    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider