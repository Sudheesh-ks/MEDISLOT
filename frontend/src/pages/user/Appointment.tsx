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
  cancelTempBookingAPI,
  getAvailableSlotsAPI,
  getDoctorReviewsAPI,
} from '../../services/appointmentServices';
import { showErrorToast } from '../../utils/errorHandler';
import type { RazorpayOptions, RazorpayPaymentResponse } from '../../types/razorpay';
import { VerifyRazorpayAPI } from '../../services/paymentServices';
import { getDoctorsByIDAPI } from '../../services/doctorServices';
import type { DoctorProfileType } from '../../types/doctor';
import { currencySymbol } from '../../utils/commonUtils';
import type { feedbackTypes } from '../../types/feedback';
import StarRating from '../../components/common/StarRating';
import { to12h } from '../../utils/slotManagementHelper';

dayjs.extend(relativeTime);

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const Appointment = () => {
  type TimeSlot = { datetime: Date; slotStartTime: string; slotEndTime: string };

  const navigate = useNavigate();
  const { docId } = useParams();
  const context = useContext(UserContext);
  if (!context) throw new Error('AppContext missing');
  const { token } = context;

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token]);

  if (!token) {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'availability'>('overview');

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
    tempBookingId: string
  ) => {
    console.log(order.amount);
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
          const { data } = await VerifyRazorpayAPI(tempBookingId, res);

          if (data.success) {
            toast.success('Payment successful');
            navigate('/my-appointments');
          } else {
            throw new Error(data.message || 'Payment verification failed');
          }
        } catch (err) {
          console.error('Payment verification failed:', err);
          toast.error('Payment failed. Releasing slot lock...');

          try {
            console.log('Releasing lock for tempBookingId:', tempBookingId);
            const { data } = await cancelTempBookingAPI(tempBookingId);
            if (data.success) {
              toast.info('Slot lock released due to payment failure');
            } else {
              console.error('Failed to release slot lock:', data.message);
            }
          } catch (cleanupErr) {
            console.error('Error releasing slot lock:', cleanupErr);
          }
        }
      },

      modal: {
        ondismiss: async () => {
          toast.warn('Payment cancelled');
          try {
            console.log('Modal dismissed. Releasing lock for tempBookingId:', tempBookingId);
            const { data } = await cancelTempBookingAPI(tempBookingId);
            console.log('Cancel temp booking response (modal dismiss):', data);
            if (data.success) {
              toast.info('Temporary booking released');
            } else {
              console.error('Failed to release slot lock:', data.message);
            }
          } catch (err) {
            console.error('Failed to cancel temporary booking:', err);
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
        target.slotEndTime
      );

      if (!res.data.success) return toast.error(res.data.message);

      const { tempBookingId, order } = res.data;
      console.log('Order amount:', order.amount);
      initPay(order, tempBookingId);
    } catch (err) {
      showErrorToast(err);
    }
  };

  const getNextAvailableDate = () => {
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].length > 0) {
        return slots[i][0].datetime;
      }
    }
    return null;
  };

  const nextAvailableDate = getNextAvailableDate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getDoctorReviewsAPI(docId!);
        if (res.data.success) {
          setReviews(res.data.data);
        }
      } catch (err) {
        showErrorToast(err);
      }
    };
    fetchReviews();
  }, [token]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '0.0';

  const TabButton = ({
    label,
    isActive,
    onClick,
  }: {
    tab: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium text-sm transition-all relative ${
        isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-100 hover:text-blue-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Header Section */}
      <div className="bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Doctor Image */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gray-700 shadow-lg">
                <img src={info?.image} alt={info?.name} className="w-full h-full object-cover" />
              </div>
              {/* Online Status */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                <span className="text-gray-900 text-[10px] md:text-xs font-bold">✓</span>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row items-start md:items-start justify-between w-full">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-100">{info?.name}</h1>
                    <img
                      src={assets.verified_icon}
                      className="w-5 h-5 md:w-6 md:h-6"
                      alt="Verified"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-base md:text-lg text-blue-400 font-semibold">
                      {info?.speciality}
                    </p>
                    <p className="text-sm md:text-base text-gray-300">{info?.degree}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-300">
                      <span className="flex items-center gap-1">💼 {info?.experience}</span>
                      <span className="flex items-center gap-1">
                        ⭐ {averageRating} ({reviews.length} reviews)
                      </span>
                      <span className="flex items-center gap-1">
                        💰 {currencySymbol}
                        {info?.fees}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {nextAvailableDate ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-700 text-green-100">
                        Available{' '}
                        {ymd(nextAvailableDate) === ymd(new Date())
                          ? 'Today'
                          : dayjs(nextAvailableDate).format('MMM D')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-700 text-green-100">
                        No Slots Available
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-700 text-blue-100">
                      Video Consultation
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 items-center md:items-end mt-3 md:mt-0">
                  <button
                    onClick={() => setActiveTab('availability')}
                    className="bg-blue-600 hover:bg-blue-500 text-gray-100 px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors shadow-md"
                  >
                    Book Appointment
                  </button>
                  {/* <button className="border border-gray-700 hover:bg-gray-700 text-gray-200 px-6 py-2 rounded-lg font-medium transition-colors">
                  Message Doctor
                </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-wrap">
            <TabButton
              tab="overview"
              label="Overview"
              isActive={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              tab="availability"
              label="Book Appointment"
              isActive={activeTab === 'availability'}
              onClick={() => setActiveTab('availability')}
            />
            <TabButton
              tab="reviews"
              label={`Reviews (${reviews.length})`}
              isActive={activeTab === 'reviews'}
              onClick={() => setActiveTab('reviews')}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* About */}
                <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-100">
                    About {info?.name}
                  </h2>
                  <p className="text-gray-300 leading-relaxed mb-6">{info?.about}</p>

                  {/* Specializations */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-100 mb-3">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-900 text-blue-400 rounded-full text-sm font-medium">
                        {info?.speciality}
                      </span>
                    </div>
                  </div>

                  {/* Education & Experience */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-100 mb-3">Education</h3>
                      <p className="text-gray-300">{info?.degree}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100 mb-3">Experience</h3>
                      <p className="text-gray-300">{info?.experience}</p>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-300">
                    Services Offered
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-2 md:p-3 bg-gray-900 rounded-lg">
                      <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center text-gray-200">
                        💻
                      </div>
                      <div>
                        <p className="font-medium text-gray-100">Video Consultation</p>
                        <p className="text-sm text-gray-400">Online consultation available</p>
                      </div>
                    </div>
                    {/* <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                    <div className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center text-gray-200">
                      🏥
                    </div>
                    <div>
                      <p className="font-medium text-gray-100">In-Person Visit</p>
                      <p className="text-sm text-gray-400">Clinic consultation</p>
                    </div>
                  </div> */}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold mb-6 text-gray-100">
                  Select Appointment Slot
                </h2>

                {/* Date Selector */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-100 mb-3">Choose Date</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {slots.map((day, idx) =>
                      day.length ? (
                        <button
                          key={idx}
                          onClick={() => {
                            setDayIdx(idx);
                            setShowPicker(false);
                            setSlotTime('');
                          }}
                          className={`min-w-[80px] py-3 md:py-4 px-3 rounded-xl text-center text-sm transition-all border ${
                            dayIdx === idx && !showPicker
                              ? 'bg-blue-600 text-gray-100 border-blue-600 shadow-md'
                              : 'bg-gray-900 border-gray-700 hover:border-blue-500 text-gray-300'
                          }`}
                        >
                          <p className="text-xs font-medium opacity-80">
                            {days[day[0].datetime.getDay()]}
                          </p>
                          <p className="text-lg font-bold">{day[0].datetime.getDate()}</p>
                          <p className="text-xs opacity-80">
                            {day[0].datetime.toLocaleDateString('en', { month: 'short' })}
                          </p>
                        </button>
                      ) : null
                    )}

                    <button
                      onClick={() => {
                        void (showPicker ? fetchInitialSlots() : setShowPicker(true));
                        setSlotTime('');
                      }}
                      className={`min-w-[80px] py-3 md:py-4 px-3 rounded-xl text-center text-sm transition-all border ${
                        showPicker
                          ? 'bg-blue-600 text-gray-100 border-blue-600 shadow-md'
                          : 'bg-gray-900 border-gray-700 hover:border-blue-500 text-gray-300'
                      }`}
                    >
                      📅
                      <p className="text-xs font-medium mt-1">{showPicker ? 'Back' : 'More'}</p>
                    </button>
                  </div>

                  {/* DatePicker */}
                  {showPicker && (
                    <div className="mt-4">
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
                        className="w-full bg-gray-900 border border-gray-700 text-gray-100 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Time Slots */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-100 mb-3">Available Time Slots</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {slots[dayIdx]?.length ? (
                      slots[dayIdx].map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setSlotTime(s.slotStartTime)}
                          className={`p-2 md:p-3 rounded-lg text-xs md:text-sm font-medium transition-all border ${
                            slotTime === s.slotStartTime
                              ? 'bg-blue-600 text-gray-100 border-blue-600 shadow-md'
                              : 'bg-gray-900 border-gray-700 hover:border-blue-500 text-gray-300'
                          }`}
                        >
                          {to12h(s.slotStartTime)}
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 col-span-full text-center py-8">
                        No available slots for this date
                      </p>
                    )}
                  </div>
                </div>

                {/* Booking Summary */}
                {slotTime && (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-100 mb-2">Appointment Summary</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>Date: {slots[dayIdx]?.[0]?.datetime.toDateString()}</p>
                      <p>Start Time: {to12h(slotTime)}</p>
                      <p>
                        End Time:{' '}
                        {to12h(
                          slots[dayIdx]?.find((s) => s.slotStartTime === slotTime)?.slotEndTime ||
                            ''
                        )}
                      </p>
                      <p>
                        Fee: {currencySymbol}
                        {info?.fees}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={book}
                  disabled={!slotTime}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-100 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-colors shadow-md"
                >
                  {slotTime
                    ? `Book Appointment - ${currencySymbol}${info?.fees}`
                    : 'Select a time slot'}
                </button>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-100">
                    Patient Reviews
                  </h2>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-100">{averageRating}</div>
                    <div className="text-sm text-gray-400">{reviews.length} reviews</div>
                  </div>
                </div>

                {reviews.length ? (
                  <div className="space-y-4">
                    {reviews.slice(0, visibleReviews).map((r, idx) => (
                      <div key={idx} className="border-b border-gray-700 pb-4 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-700 rounded-full flex items-center justify-center text-gray-100 font-semibold">
                            {r.userData.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-100">{r.userData.name}</h4>
                              <span className="text-sm text-gray-400">
                                {dayjs(r.timestamp).fromNow()}
                              </span>
                            </div>
                            {r.rating && <StarRating rating={r.rating} />}
                            <p className="text-gray-300 mt-2">{r.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {visibleReviews < reviews.length && (
                      <div className="text-center pt-4">
                        <button
                          onClick={() => setVisibleReviews((prev) => prev + 3)}
                          className="text-blue-500 hover:text-blue-400 font-medium"
                        >
                          Load more reviews
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      ⭐
                    </div>
                    <p className="text-gray-500">No reviews yet</p>
                    <p className="text-sm text-gray-400 mt-1">Be the first to review this doctor</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-100 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Consultation Fee</span>
                  <span className="font-semibold text-gray-100">
                    {currencySymbol}
                    {info?.fees}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Experience</span>
                  <span className="font-semibold text-gray-100">{info?.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Rating</span>
                  <span className="font-semibold text-gray-100">{averageRating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Next Available</span>
                  <span
                    className={`font-semibold ${nextAvailableDate ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {nextAvailableDate
                      ? ymd(nextAvailableDate) === ymd(new Date())
                        ? 'Today'
                        : dayjs(nextAvailableDate).format('MMM D, ddd')
                      : 'No Slots'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            {/* <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-100 mb-4">Need Help?</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-700 rounded-lg transition-colors">
                📞
                <div>
                  <p className="font-medium text-gray-100">Call Support</p>
                  <p className="text-sm text-gray-400">Get instant help</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-700 rounded-lg transition-colors">
                💬
                <div>
                  <p className="font-medium text-gray-100">Live Chat</p>
                  <p className="text-sm text-gray-400">Chat with us now</p>
                </div>
              </button>
            </div>
          </div> */}

            {/* Safety Badge */}
            <div className="bg-green-900 border border-green-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center text-gray-100">
                  🛡️
                </div>
                <div>
                  <h3 className="font-semibold text-green-100">Verified Doctor</h3>
                  <p className="text-sm text-green-200">Licensed & Authenticated</p>
                </div>
              </div>
              <p className="text-sm text-green-200">
                This doctor's credentials have been verified by our medical team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Doctors */}
      <div className="bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <RelatedDoctors docId={docId} speciality={info?.speciality} />
        </div>
      </div>
    </div>
  );
};

export default Appointment;
