import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { UserContext } from '../../context/UserContext';
import { assets } from '../../assets/user/assets';
import RelatedDoctors from '../../components/user/RelatedDoctors';
import { toast } from 'react-toastify';
import {
  appointmentBookingAPI,
  cancelAppointmentAPI,
  getAvailableSlotsAPI,
  getDoctorReviewsAPI,
} from '../../services/appointmentServices';
import { showErrorToast } from '../../utils/errorHandler';
import type { RazorpayOptions, RazorpayPaymentResponse } from '../../types/razorpay';
import { PaymentRazorpayAPI, VerifyRazorpayAPI } from '../../services/paymentServices';
import { getDoctorsByIDAPI } from '../../services/doctorServices';
import type { DoctorProfileType } from '../../types/doctor';
import { currencySymbol } from '../../utils/commonUtils';
import type { feedbackTypes } from '../../types/feedback';

dayjs.extend(relativeTime);

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const to12h = (t: string) => dayjs(`1970-01-01T${t}`).format('hh:mm A').toLowerCase();

const Appointment = () => {
  type TimeSlot = { datetime: Date; slotStartTime: string; slotEndTime: string };

  const nav = useNavigate();
  const { docId } = useParams();
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('AppContext missing');
  const { token } = ctx;

  if (!token) {
    toast.error('Please login to continue…');
    return null;
  }

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const [info, setInfo] = useState<DoctorProfileType | null>();
  const [slots, setSlots] = useState<TimeSlot[][]>([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [reviews, setReviews] = useState<feedbackTypes[]>([]);
  const [visibleReviews, setVisibleReviews] = useState(3);

  const slotCache = useRef(new Map<string, TimeSlot[]>());

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!docId) return;
      try {
        const { data } = await getDoctorsByIDAPI(docId);
        if (data.success) setInfo(data.doctor);
        else setInfo(null);
      } catch {
        setInfo(null);
      }
    };
    fetchDoctor();
  }, [docId]);

  useEffect(() => {
    if (docId) fetchInitialSlots();
  }, [docId]);

  const fetchDay = async (dateObj: Date): Promise<TimeSlot[]> => {
    const key = ymd(dateObj);
    if (slotCache.current.has(key)) {
      return slotCache.current.get(key)!;
    }

    try {
      const ranges = await getAvailableSlotsAPI(docId!, key);
      const now = new Date();
      const slots = ranges
        .filter((r: any) => r.isAvailable)
        .map((r: any) => {
          const [hour, minute] = r.start.split(':').map(Number);
          const dt = new Date(dateObj);
          dt.setHours(hour, minute, 0, 0);
          return { datetime: dt, slotStartTime: r.start, slotEndTime: r.end };
        })
        .filter((slot: TimeSlot) => {
          if (ymd(dateObj) !== ymd(now)) return true;
          return slot.datetime > now;
        });
      slotCache.current.set(key, slots);
      return slots;
    } catch {
      return [];
    }
  };

  const fetchInitialSlots = async () => {
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d;
    });

    const results = await Promise.all(dates.map(fetchDay));
    setSlots(results);
    setDayIdx(0);
    setShowPicker(false);
  };

  const fetchCustomDateSlots = async (d: Date) => {
    const result = await fetchDay(d);
    setSlots([result]);
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
      name: 'Appointment Payment',
      description: 'Appointment Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (res: RazorpayPaymentResponse) => {
        try {
          const { data } = await VerifyRazorpayAPI(appointmentId, res, token);
          if (data.success) toast.success('Payment successful');
        } catch (err) {
          showErrorToast(err);
        } finally {
          nav('/my-appointments');
        }
      },
      modal: {
        ondismiss: async () => {
          toast.warn('Payment failed');
          try {
            await cancelAppointmentAPI(appointmentId, token);
          } catch (err) {
            console.error('Failed to cancel appointment:', err);
          }
        },
      },
    };

    new window.Razorpay(opts).open();
  };

  const book = async () => {
    const target = slots[dayIdx]?.find((s) => s.slotStartTime === slotTime);
    if (!target) return toast.error('No slot selected');

    try {
      const res = await appointmentBookingAPI(
        docId!,
        ymd(target.datetime),
        target.slotStartTime,
        target.slotEndTime,
        token
      );

      if (!res.data.success) return toast.error(res.data.message);

      const apptId = res.data?.appointmentId ?? res.data?.appointment?._id;
      if (!apptId) return toast.error('Failed to retrieve appointment ID');

      const paymentRes = await PaymentRazorpayAPI(apptId, token);
      if (paymentRes.data.success) {
        initPay(paymentRes.data.order, apptId);
      } else {
        toast.error('Unable to initiate payment');
        nav('/my-appointments');
      }
    } catch (err) {
      showErrorToast(err);
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getDoctorReviewsAPI(token);
        if (res.data.success) {
          setReviews(res.data.data);
        }
      } catch (err) {
        showErrorToast(err);
      }
    };
    fetchReviews();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-24 text-slate-100 animate-fade">
      {/* Doctor profile section */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl overflow-hidden w-full sm:max-w-72">
          <img src={info?.image} alt="doctor" className="w-full h-full object-cover" />
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
            Appointment fee:{' '}
            <span className="text-slate-100 font-semibold">
              {currencySymbol}
              {info?.fees}
            </span>
          </p>
        </div>
      </div>

      {/* Booking slots */}
      <section className="sm:ml-80 mt-12 space-y-6">
        <h3 className="font-semibold text-lg">Booking Slots</h3>

        {/* Date selector */}
        <div className="flex gap-3 overflow-x-auto">
          {slots.map((day, idx) =>
            day.length ? (
              <button
                key={idx}
                onClick={() => {
                  setDayIdx(idx);
                  setShowPicker(false);
                  setSlotTime('');
                }}
                className={`min-w-16 py-5 rounded-2xl text-center text-sm transition-colors ${
                  dayIdx === idx && !showPicker
                    ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white'
                    : 'ring-1 ring-white/10'
                }`}
              >
                <p>{days[day[0].datetime.getDay()]}</p>
                <p className="mt-1 text-lg font-bold">{day[0].datetime.getDate()}</p>
              </button>
            ) : null
          )}

          <button
            onClick={() => {
              void (showPicker ? fetchInitialSlots() : setShowPicker(true));
              setSlotTime('');
            }}
            className={`min-w-16 py-5 rounded-2xl text-center text-sm transition-colors ${
              showPicker
                ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white'
                : 'ring-1 ring-white/10'
            }`}
          >
            📅<p className="text-xs">{showPicker ? 'Back' : 'More'}</p>
          </button>
        </div>

        {/* DatePicker */}
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

        {/* Time slots */}
        <div className="flex gap-3 overflow-x-auto">
          {slots[dayIdx]?.length ? (
            slots[dayIdx].map((s, i) => (
              <button
                key={i}
                onClick={() => setSlotTime(s.slotStartTime)}
                className={`px-6 py-2 rounded-full text-sm transition-colors ${
                  slotTime === s.slotStartTime
                    ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white'
                    : 'ring-1 ring-white/10 text-slate-400'
                }`}
              >
                {to12h(s.slotStartTime)}
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

      <section className="mt-16 space-y-6">
        <h3 className="font-semibold text-lg">Patient Reviews</h3>

        {reviews.length ? (
          <div className="space-y-4">
            {reviews.slice(0, visibleReviews).map((r, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-2xl p-5 flex gap-4"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10">
                  <img src={r.userData.image} />
                </div>

                {/* Review content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{r.userData.name}</p>
                    <span className="text-xs text-slate-400">{dayjs(r.timestamp).fromNow()}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{r.message}</p>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {visibleReviews < reviews.length && (
              <div className="text-center">
                <button
                  onClick={() => setVisibleReviews((prev) => prev + 3)}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white text-sm hover:-translate-y-0.5 transition-transform"
                >
                  Load more reviews
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No reviews yet</p>
        )}
      </section>

      <RelatedDoctors docId={docId} speciality={info?.speciality} />
    </div>
  );
};

export default Appointment;
