import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/admin/assets";
import { AppContext } from "../../context/AppContext";
import type { AppointmentTypes } from "../../types/appointment";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const context = useContext(AdminContext);
  const appContext = useContext(AppContext);

  if (!context) {
    throw new Error("AdminContext must be used within AdminContextProvider");
  }

  const { aToken, dashData, getDashData, cancelAppointment } = context;

    if (!appContext) {
    throw new Error("AdminContext must be used within AdminContextProvider");
  }

  const { slotDateFormat } = appContext;

  useEffect(() => {
    if(aToken) {
      getDashData()
    }
  },[aToken])

  useEffect(() => {
    if (!aToken) {
      navigate("/admin/login");
    }
  });

  return dashData && (
    <div className="m-5">
      <div className="flex flex-wrap gap-6 justify-center">
        <div onClick={() => navigate('/admin/all-doctors')} className="flex items-center gap-2 bg-blue-100 p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img src={assets.doctor_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.doctors}</p>
            <p className="text-gray-600">Doctors</p>
          </div>
        </div>

        <div onClick={() => navigate('/admin/appointments')} className="flex items-center gap-2 bg-blue-100 p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img src={assets.appointments_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.appointments}</p>
            <p className="text-gray-600">Appointments</p>
          </div>
        </div>

        <div onClick={() => navigate('/admin/user-management')} className="flex items-center gap-2 bg-blue-100 p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img src={assets.patients_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.patients}</p>
            <p className="text-gray-600">Patients</p>
          </div>
        </div>

      </div>

      <div className="bg-white">

        <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
          <img src={assets.list_icon} alt="" />
          <p className="font-semibold">Latest Bookings</p>
        </div>

        <div className="pt-4 border border-t-0">
          {
            dashData.latestAppointments.map((item: AppointmentTypes,index: number) => (
                <div className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100" key={index}>
                  <img className="rounded-full w-10" src={item.docData.image} alt="" />
                  <div className="flex-1 text-sm">
                    <p className="text-gray-800 font-medium">{item.docData.name}</p>
                    <p className="text-gray-600">{slotDateFormat(item.slotDate)}</p>
                  </div>
                  {
                      item.cancelled 
                      ? <p className="text-red-400 text-xs font-medium">Cancelled</p>
                      : <img onClick={() => cancelAppointment(item._id!)} className="w-10 cursor-pointer" src={assets.cancel_icon} alt="" />
                    }
                </div>
            ))
          }
        </div>

      </div>
    </div>
  )
};

export default AdminDashboard;
