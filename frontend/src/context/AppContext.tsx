import { createContext, type ReactNode } from "react";
import { doctors } from "../assets/user/assets";
import type { Doctor } from "../assets/user/assets";



interface AppContextType {
    doctors: Doctor[];
    currencySymbol: string;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);


interface AppContextProviderProps {
    children: ReactNode;
}

const AppContextProvider: React.FC<AppContextProviderProps> = ({children}) => {

    const currencySymbol = '$'

    const value: AppContextType = {
        doctors,
        currencySymbol,
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider