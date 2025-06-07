import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { showErrorToast } from "../../utils/errorHandler";
import { getAppointmentsAPI } from "../../services/appointmentServices";
import { toast } from "react-toastify";
import type { AppointmentTypes } from "../../types/appointment";

const MyAppointments = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("MyAppointments must be used within an AppContextProvider");
  }

  const { token } = context;

  const [appointments, setAppointments] = useState<AppointmentTypes[]>([]);
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate: string) => {
    const dateArray = slotDate.split('_');
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
  }

  const getUserAppointments = async () => {
    try {

      if (!token) {
              toast.error("Please login to continue...");
              return;
            }

      const { data } = await getAppointmentsAPI(token);

      if(data.success) {
        setAppointments(data.appointments);
      }
      
    } catch (error) {
      showErrorToast(error);
    }
  }

  useEffect(() => {
    if(token){
      getUserAppointments();
    }
  },[token])

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointments
      </p>
      <div>
        {appointments.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img className="w-32 bg-indigo-50" src={item.docData.image} alt="" />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral font-semibold">{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end">
              <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounde hover:bg-primary hover:text-white transition-all duration-300">
                Pay Online
              </button>
              <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300">
                Cancel appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
