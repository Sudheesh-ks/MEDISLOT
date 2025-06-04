import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import AppContextProvider from "./context/AppContext.tsx";
import PanelContextProvider from "./context/PanelContext.tsx";
import AdminContextProvider from "./context/AdminContext.tsx";
import DoctorContextProvider from "./context/DoctorContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AdminContextProvider>
      <DoctorContextProvider>
        <PanelContextProvider>
          <AppContextProvider>
            <App />
          </AppContextProvider>
        </PanelContextProvider>
      </DoctorContextProvider>
    </AdminContextProvider>
  </BrowserRouter>
);
