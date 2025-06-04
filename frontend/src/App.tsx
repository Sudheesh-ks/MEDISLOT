import { Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Routes
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import DoctorRoutes from "./routes/DoctorRoutes";

const App = () => {
  return (
    <div>
      <Routes>
        {UserRoutes()}
        {AdminRoutes()}
        {DoctorRoutes()}
      </Routes>

      <ToastContainer />
    </div>
  );
};

export default App;
