import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AppContext } from "../../context/AppContext";
import { assets, type Doctor } from "../../assets/user/assets";
import RelatedDoctors from "../../components/user/RelatedDoctors";
import { toast } from "react-toastify";
import { appointmentBookingAPI, getAvailableSlotsAPI } from "../../services/appointmentServices";
import { showErrorToast } from "../../utils/errorHandler";

// ---------------- helpers ------------------------------------
function parse12HourTime(timeStr: string) {
  const [time, mod] = timeStr.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hour = h;
  const minute = m;
  if (mod.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (mod.toUpperCase() === "AM" && hour === 12) hour = 0;
  return { hour, minute };
}
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// --------------------------------------------------------------
const Appointment = () => {
  type TimeSlot = { datetime: Date; time: string };

  const nav = useNavigate();
  const { docId } = useParams();

  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("AppContext missing");
  const { doctors, currencySymbol, token, getDoctorsData } = ctx;

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [info, setInfo] = useState<Doctor | null>();
  const [slots, setSlots] = useState<TimeSlot[][]>([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [customDate, setCustomDate] = useState<Date | null>(null);

  // ---------------- fetch doctor & slots ----------------------
  useEffect(() => { getDoctorsData(); setInfo(doctors.find((d) => d._id === docId)); }, []);
  useEffect(() => { fetchWeekSlots(); }, [info]);

  const fetchWeekSlots = async () => {
    setSlots([]);
    if (!docId) return;
    const today = new Date();
    try {
      const arr = await getAvailableSlotsAPI(docId, today.getFullYear(), today.getMonth() + 1);
      const map: Record<string, any[]> = {};
      arr.forEach((i: any) => { if (!i.isCancelled) map[i.date] = i.slots.filter((s: any) => !s.booked); });
      const week: TimeSlot[][] = [];
      let cur = new Date(today);
      let scanned = 0;
      while (week.length < 7 && scanned < 90) {
        const key = ymd(cur);
        const free = map[key] || [];
        if (free.length) {
          week.push(free.map((s: any) => { const { hour, minute } = parse12HourTime(s.start); const d = new Date(cur); d.setHours(hour, minute); return { datetime: d, time: s.start }; }));
        }
        cur.setDate(cur.getDate() + 1);
        scanned++;
      }
      setSlots(week);
      setDayIdx(0);
      setShowPicker(false);
    } catch { toast.error("Failed to load slots"); }
  };

  const fetchCustomDateSlots = async (d: Date) => {
    if (!docId) return;
    try {
      const arr = await getAvailableSlotsAPI(docId, d.getFullYear(), d.getMonth() + 1);
      const target = arr.find((i: any) => i.date === ymd(d));
      const list: TimeSlot[] = target?.slots.filter((s: any) => !s.booked).map((s: any) => {
        const { hour, minute } = parse12HourTime(s.start);
        const dt = new Date(d); dt.setHours(hour, minute);
        return { datetime: dt, time: s.start };
      }) || [];
      setSlots([list]);
      setDayIdx(0);
    } catch { toast.error("Failed to fetch slots"); }
  };

  // ---------------- book --------------------------------------
  const book = async () => {
    if (!token) { toast.warn("Login to book"); return nav("/login"); }
    const target = slots[dayIdx]?.find((s) => s.time === slotTime);
    if (!target) return toast.error("No slot selected");
    try {
      const res = await appointmentBookingAPI(docId!, ymd(target.datetime), slotTime, token);
      if (res.data.success) { toast.success(res.data.message); getDoctorsData(); nav("/my-appointments"); }
      else toast.error(res.data.message);
    } catch (err) { showErrorToast(err); }
  };

  // ---------------- render ------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-24 text-slate-100 animate-fade">
      {/* Doctor card */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl overflow-hidden w-full sm:max-w-72">
          <img src={info?.image} alt="doctor" className="w-full h-full object-cover" />
        </div>
        {/* Info */}
        <div className="flex-1 bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl p-8 space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-white">
            {info?.name} <img src={assets.verified_icon} className="w-5" />
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{info?.degree} • {info?.speciality}</span>
            <span className="py-0.5 px-2 rounded-full ring-1 ring-white/10">{info?.experience}</span>
          </div>
          <div>
            <p className="font-medium">About</p>
            <p className="text-sm text-slate-400 mt-1">{info?.about}</p>
          </div>
          <p className="text-slate-400">Appointment fee: <span className="text-slate-100 font-semibold">{currencySymbol}{info?.fees}</span></p>
        </div>
      </div>

      {/* Slots */}
      <section className="sm:ml-80 mt-12 space-y-6">
        <h3 className="font-semibold text-lg">Booking Slots</h3>

        {/* Day chips */}
        <div className="flex gap-3 overflow-x-auto">
          {slots.map((day, idx) => day.length && (
            <button key={idx} onClick={() => { setDayIdx(idx); setShowPicker(false); }}
              className={`min-w-16 py-5 rounded-2xl text-center text-sm transition-colors ${dayIdx === idx && !showPicker ? "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white" : "ring-1 ring-white/10"}`}>
              <p>{days[day[0].datetime.getDay()]}</p>
              <p className="mt-1 text-lg font-bold">{day[0].datetime.getDate()}</p>
            </button>
          ))}

          {/* calendar chip */}
          <button onClick={() => { showPicker ? fetchWeekSlots() : setShowPicker(true); }}
            className={`min-w-16 py-5 rounded-2xl text-center text-sm transition-colors ${showPicker ? "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white" : "ring-1 ring-white/10"}`}>
            📅<p className="text-xs">{showPicker ? "Back" : "More"}</p>
          </button>
        </div>

        {/* date picker */}
        {showPicker && (
          <DatePicker
            selected={customDate}
            onChange={(d) => { if (d) { setCustomDate(d); fetchCustomDateSlots(d); } }}
            minDate={new Date()}
            placeholderText="Select a future date"
            className="mt-4 bg-white/5 backdrop-blur ring-1 ring-white/10 text-slate-100 px-4 py-2 rounded"
          />
        )}

        {/* time chips */}
        <div className="flex gap-3 overflow-x-auto">
          {slots[dayIdx]?.length ? (
            slots[dayIdx].map((s, i) => (
              <button key={i} onClick={() => setSlotTime(s.time)}
                className={`px-6 py-2 rounded-full text-sm transition-colors ${slotTime === s.time ? "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white" : "ring-1 ring-white/10 text-slate-400"}`}>
                {s.time.toLowerCase()}
              </button>
            ))
          ) : (
            <p className="text-slate-400">No available slots</p>
          )}
        </div>

        <button onClick={book}
          className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white px-14 py-3 rounded-full hover:-translate-y-0.5 transition-transform">
          Book an appointment
        </button>
      </section>

      <RelatedDoctors docId={docId} speciality={info?.speciality} />
    </div>
  );
};
export default Appointment;