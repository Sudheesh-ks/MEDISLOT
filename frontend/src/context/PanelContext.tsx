import { createContext } from "react";
import type { ReactNode } from "react";

interface PanelContextType {}

export const PanelContext = createContext<PanelContextType | null>(null);

interface PanelContextProviderProps {
  children: ReactNode;
}

const PanelContextProvider = ({ children }: PanelContextProviderProps) => {
  const value: PanelContextType = {};

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
};

export default PanelContextProvider;
