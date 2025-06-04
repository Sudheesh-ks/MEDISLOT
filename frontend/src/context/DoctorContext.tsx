import { createContext } from "react";
import type { ReactNode } from "react";

interface DoctorContextType {}

export const DoctorContext = createContext<DoctorContextType | null>(null);

interface DoctorContextProviderProps {
  children: ReactNode;
}

const DoctorContextProvider = ({ children }: DoctorContextProviderProps) => {
  const value: DoctorContextType = {};

  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
