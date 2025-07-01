// src/pages/user/MyAppointments.tsx  –  Dark‑Neon Version
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import {
  cancelAppointmentAPI,
  getAppointmentsAPI,
} from "../../services/appointmentServices";
import {
  PaymentRazorpayAPI,
  VerifyRazorpayAPI,
} from "../../services/paymentServices";
import { showErrorToast } from "../../utils/errorHandler";
import type { AppointmentTypes } from "../../types/appointment";
import type {
  RazorpayOptions,
  RazorpayPaymentResponse,
} from "../../types/razorpay";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);


/** "23:00" → "11:00 pm" (needs the customParseFormat plugin) */
const to12h = (t: string) => dayjs(t, "HH:mm").format("hh:mm A").toLowerCase();


const MyAppointments = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("MyAppointments must be within AppContext");
  const { token, getDoctorsData, slotDateFormat } = ctx;

  const [appointments, setAppointments] = useState<AppointmentTypes[]>([]);
  const nav = useNavigate();

  if (!token) {
    toast.error("Please login to continue…");
    return null;
  }

  /* ------------------- data helpers ------------------- */
  const fetchAppointments = async () => {
    try {
      const { data } = await getAppointmentsAPI(token);
      if (data.success) setAppointments(data.appointments);
    } catch (err) {
      showErrorToast(err);
    }
  };

  const cancelAppt = async (id: string) => {
    try {
      const { data } = await cancelAppointmentAPI(id, token);
      if (data.success) {
        toast.success(data.message);
        fetchAppointments();
        getDoctorsData();
      } else toast.error(data.message);
    } catch (err) {
      showErrorToast(err);
    }
  };

  const initPay = (
    order: { id: string; amount: number; currency: string; receipt?: string },
    apptId: string
  ) => {
    const opts: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (res: RazorpayPaymentResponse) => {
        try {
          const { data } = await VerifyRazorpayAPI(apptId, res, token);
          if (data.success) {
            toast.success(data.message);
            fetchAppointments();
            nav("/my-appointments");
          }
        } catch (err) {
          showErrorToast(err);
        }
      },
    };
    new window.Razorpay(opts).open();
  };

  const payNow = async (id: string) => {
    try {
      const { data } = await PaymentRazorpayAPI(id, token);
      if (data.success) initPay(data.order, id);
    } catch (err) {
      showErrorToast(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  /* ------------------------- UI ------------------------ */
  const glass =
    "bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-xl overflow-hidden";
  const btn =
    "text-sm sm:min-w-48 py-2 border rounded transition-transform hover:-translate-y-0.5";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 md:px-10 py-24">
      <h1 className="pb-4 mb-8 text-2xl font-bold border-b border-white/10">
        My Appointments
      </h1>

      {appointments.map((a) => (
        <div
          key={a._id}
          className={`grid grid-cols-[auto_1fr_auto] gap-4 md:gap-6 py-6 border-b border-white/5`}
        >
          {/* avatar */}
          <img
            src={a.docData.image}
            className="w-28 h-28 object-cover ring-1 ring-white/10 rounded-xl"
          />

          {/* info */}
          <div className="text-sm text-slate-300 space-y-1">
            <p className="text-slate-100 font-semibold">{a.docData.name}</p>
            <p>{a.docData.speciality}</p>

            <p className="text-xs">
              <span className="font-medium">Address:</span>{" "}
              {a.docData.address.line1}, {a.docData.address.line2}
            </p>

            <p className="text-xs">
              <span className="font-medium">Date & Time:</span>{" "}
              {slotDateFormat(a.slotDate)} | {to12h(a.slotTime)}
            </p>
          </div>

          {/* actions / status */}
          <div className="flex flex-col gap-2 items-end">
            {/* confirmed & paid */}
            {!a.cancelled && a.payment && a.isConfirmed && (
              <button
                onClick={() => nav(`/consultation/${a.docData._id}`)}
                className={`${btn} bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white`}
              >
                Go to Consultation
              </button>
            )}

            {/* paid but waiting */}
            {!a.cancelled && a.payment && !a.isConfirmed && (
              <div className="bg-yellow-400/10 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-400/40 animate-pulse text-center">
                ⏳ Payment received – awaiting doctor
              </div>
            )}

            {/* unpaid */}
            {!a.cancelled && !a.payment && (
              <button
                onClick={() => payNow(a._id!)}
                className={`${btn} border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white`}
              >
                Pay Online
              </button>
            )}

            {/* cancel or cancelled tag */}
            {!a.cancelled ? (
              <button
                onClick={() => cancelAppt(a._id!)}
                className={`${btn} border-red-500 text-red-400 hover:bg-red-500 hover:text-white`}
              >
                Cancel appointment
              </button>
            ) : (
              <span className="border border-red-500 text-red-400 text-xs py-1 px-3 rounded">
                Appointment Cancelled
              </span>
            )}

            {/* paid badge */}
            {!a.cancelled && a.payment && (
              <span className="border border-emerald-500 text-emerald-400 text-xs py-1 px-3 rounded">
                Paid
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyAppointments;
