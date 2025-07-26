import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { AppContext } from "../../context/AppContext";
import { assets, type Doctor } from "../../assets/user/assets";
import RelatedDoctors from "../../components/user/RelatedDoctors";
import { toast } from "react-toastify";
import {
  appointmentBookingAPI,
  cancelAppointmentAPI,
  getAvailableSlotsAPI,
} from "../../services/appointmentServices";
import { showErrorToast } from "../../utils/errorHandler";
import type { RazorpayOptions, RazorpayPaymentResponse } from "../../types/razorpay";
import { PaymentRazorpayAPI, VerifyRazorpayAPI } from "../../services/paymentServices";
import { getDoctorsByIDAPI } from "../../services/doctorServices";

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const to12h = (t: string) =>
  dayjs(`1970-01-01T${t}`).format("hh:mm A").toLowerCase();

const Appointment = () => {
  type TimeSlot = { datetime: Date; time: string };

  const nav = useNavigate();
  const { docId } = useParams();

  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("AppContext missing");
  const { currencySymbol, token } = ctx;

    if (!token) {
    toast.error("Please login to continue…");
    return null;
  }

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [info, setInfo] = useState<Doctor | null>();
  const [slots, setSlots] = useState<TimeSlot[][]>([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [customDate, setCustomDate] = useState<Date | null>(null);

  // Removed getDoctorsData and doctors usage

  useEffect(() => {
    const fetchDoctor = async () => {
      if (docId) {
        try {
          const { data } = await getDoctorsByIDAPI(docId);
          if (data.success) setInfo(data.doctor);
          else setInfo(null);
        } catch {
          setInfo(null);
        }
      } else {
        setInfo(null);
      }
    };
    fetchDoctor();
  }, [docId]);

  useEffect(() => {
    if (docId) fetchWeekSlots();
  }, [docId]);

  const fetchDay = async (dateObj: Date): Promise<TimeSlot[]> => {
    if (!docId) return [];
    try {
      const ranges = await getAvailableSlotsAPI(docId, ymd(dateObj));
      return ranges
        .filter((r: any) => r.isAvailable)
        .map((r: any) => {
          const [hour, minute] = r.start.split(":").map(Number);
          const dt = new Date(dateObj);
          dt.setHours(hour, minute, 0, 0);
          return { datetime: dt, time: r.start };
        });
    } catch {
      return [];
    }
  };

  const fetchWeekSlots = async () => {
    if (!docId) return;

    const today = new Date();
    const dates = Array.from({ length: 90 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d;
    });

    const results = await Promise.all(dates.map(fetchDay));

    const week = results.filter((day) => day.length).slice(0, 7);
    setSlots(week);
    setDayIdx(0);
    setShowPicker(false);
  };

  const fetchCustomDateSlots = async (d: Date) => {
    if (!docId) return;
    const list = await fetchDay(d);
    setSlots([list]);
    setDayIdx(0);
  };


const initPay = (
  order: { id: string; amount: number; currency: string; receipt?: string },
  appointmentId: string
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
        const { data } = await VerifyRazorpayAPI(appointmentId, res, token);
        if (data.success) toast.success("Payment successful");
      } catch (err) {
        showErrorToast(err);
      } finally {
        nav("/my-appointments");
      }
    },
    modal: {
      ondismiss: async () => {
        toast.warn("Payment failed");
         try {
          await cancelAppointmentAPI(appointmentId, token);
        } catch (err) {
          console.error("Failed to cancel appointment:", err);
        }
      },
    },
  };

  new window.Razorpay(opts).open();
};

const book = async () => {
  if (!token) {
    toast.warn("Login to book");
    return nav("/login");
  }

  const target = slots[dayIdx]?.find((s) => s.time === slotTime);
  if (!target) return toast.error("No slot selected");

  try {
    const res = await appointmentBookingAPI(docId!, ymd(target.datetime), slotTime, token);

    console.log("appointmentBookingAPI response:", res.data);

    if (!res.data.success) return toast.error(res.data.message);

    // toast.success("Appointment booked! Redirecting to payment…");

    // Step 2: Get Razorpay Order for this appointment
    const apptId = res.data?.appointmentId ?? res.data?.appointment?._id;
if (!apptId) {
  toast.error("Failed to retrieve appointment ID");
  return;
}
    const paymentRes = await PaymentRazorpayAPI(apptId, token);

    if (paymentRes.data.success) {
      initPay(paymentRes.data.order, apptId);
    } else {
      toast.error("Unable to initiate payment");
      nav("/my-appointments");
    }
  } catch (err) {
    showErrorToast(err);
  }
};


  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-24 text-slate-100 animate-fade">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl overflow-hidden w-full sm:max-w-72">
          <img
            src={info?.image}
            alt="doctor"
            className="w-full bg-primary h-full object-cover"
          />
        </div>
        <div className="flex-1 bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl p-8 space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-white">
            {info?.name} <img src={assets.verified_icon} className="w-5" />
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>
              {info?.degree} • {info?.speciality}
            </span>
            <span className="py-0.5 px-2 rounded-full ring-1 ring-white/10">
              {info?.experience}
            </span>
          </div>
          <div>
            <p className="font-medium">About</p>
            <p className="text-sm text-slate-400 mt-1">{info?.about}</p>
          </div>
          <p className="text-slate-400">
            Appointment fee:{" "}
            <span className="text-slate-100 font-semibold">
              {currencySymbol}
              {info?.fees}
            </span>
          </p>
        </div>
      </div>

      <section className="sm:ml-80 mt-12 space-y-6">
        <h3 className="font-semibold text-lg">Booking Slots</h3>

        <div className="flex gap-3 overflow-x-auto">
          {slots.map((day, idx) =>
            day.length ? (
              <button
                key={idx}
                onClick={() => {
                  setDayIdx(idx);
                  setShowPicker(false);
                  setSlotTime("");
                }}
                className={`min-w-16 py-5 rounded-2xl text-center text-sm transition-colors ${
                  dayIdx === idx && !showPicker
                    ? "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white"
                    : "ring-1 ring-white/10"
                }`}
              >
                <p>{days[day[0].datetime.getDay()]}</p>
                <p className="mt-1 text-lg font-bold">
                  {day[0].datetime.getDate()}
                </p>
              </button>
            ) : null
          )}

          <button
            onClick={() => {
              showPicker ? fetchWeekSlots() : setShowPicker(true);
              setSlotTime("");
            }}
            className={`min-w-16 py-5 rounded-2xl text-center text-sm transition-colors ${
              showPicker
                ? "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white"
                : "ring-1 ring-white/10"
            }`}
          >
            📅<p className="text-xs">{showPicker ? "Back" : "More"}</p>
          </button>
        </div>

        {showPicker && (
          <DatePicker
            selected={customDate}
            onChange={(d) => {
              if (d) {
                setCustomDate(d);
                fetchCustomDateSlots(d);
              }
            }}
            minDate={new Date()}
            placeholderText="Select a future date"
            className="mt-4 bg-white/5 backdrop-blur ring-1 ring-white/10 text-slate-100 px-4 py-2 rounded"
          />
        )}

        <div className="flex gap-3 overflow-x-auto">
          {slots[dayIdx]?.length ? (
            slots[dayIdx].map((s, i) => (
              <button
                key={i}
                onClick={() => setSlotTime(s.time)}
                className={`px-6 py-2 rounded-full text-sm transition-colors ${
                  slotTime === s.time
                    ? "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white"
                    : "ring-1 ring-white/10 text-slate-400"
                }`}
              >
                {to12h(s.time)}
              </button>
            ))
          ) : (
            <p className="text-slate-400">No available slots</p>
          )}
        </div>

        <button
          onClick={book}
          className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white px-14 py-3 rounded-full hover:-translate-y-0.5 transition-transform"
        >
          Book an appointment
        </button>
      </section>

      <RelatedDoctors docId={docId} speciality={info?.speciality} />
    </div>
  );
};
export default Appointment;
