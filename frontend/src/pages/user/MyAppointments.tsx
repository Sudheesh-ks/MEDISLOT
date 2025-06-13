import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { showErrorToast } from "../../utils/errorHandler";
import {
  cancelAppointmentAPI,
  getAppointmentsAPI,
} from "../../services/appointmentServices";
import { toast } from "react-toastify";
import type { AppointmentTypes } from "../../types/appointment";
import {
  PaymentRazorpayAPI,
  VerifyRazorpayAPI,
} from "../../services/paymentServices";
import type {
  RazorpayOptions,
  RazorpayPaymentResponse,
} from "../../types/razorpay";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("MyAppointments must be used within an AppContextProvider");
  }

  const { token, getDoctorsData, slotDateFormat } = context;

  const [appointments, setAppointments] = useState<AppointmentTypes[]>([]);

  const navigate = useNavigate();

  if (!token) {
    toast.error("Please login to continue...");
    return;
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await getAppointmentsAPI(token);

      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { data } = await cancelAppointmentAPI(appointmentId, token);

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const initPay = (
    order: { id: string; amount: number; currency: string; receipt?: string },
    appointmentId: string
  ) => {
    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response: RazorpayPaymentResponse) => {
        console.log(response);

        try {
          const { data } = await VerifyRazorpayAPI(
            appointmentId,
            response,
            token
          );

          if (data.success) {
            console.log(appointmentId);
            toast.success(data.message);
            getUserAppointments();
            navigate("/my-appointments");
          }
        } catch (error) {
          showErrorToast(error);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const appointmentRazorpay = async (appointmentId: string) => {
    try {
      const { data } = await PaymentRazorpayAPI(appointmentId, token);

      if (data.success) {
        initPay(data.order, appointmentId);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

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
              <img
                className="w-32 bg-indigo-50"
                src={item.docData.image}
                alt=""
              />
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

            <div>
              {!item.cancelled && item.payment && (
                <button
                  onClick={() => navigate(`/consultation/${item.docData._id}`)}
                  className="text-sm text-white text-center bg-primary sm:min-w-48 py-2 border mt-28 rounded hover:bg-blue-500 transition-all duration-300"
                >
                  Go to Consultation
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled && item.payment && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">
                  Paid
                </button>
              )}

              {!item.cancelled && !item.payment && (
                <button
                  onClick={() => appointmentRazorpay(item._id!)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounde hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Pay Online
                </button>
              )}

              {!item.cancelled && (
                <button
                  onClick={() => cancelAppointment(item._id!)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel appointment
                </button>
              )}

              {item.cancelled && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                  Appointment Cancelled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
