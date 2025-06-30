import { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDoctorSlotsAPI, addDoctorSlotsAPI } from "../../services/doctorServices";
import { toast } from "react-toastify";
import { DoctorContext } from "../../context/DoctorContext";

type SlotStatus = "available" | "unavailable";
type DaySlotMap = { [time: string]: SlotStatus };

const generateTimeSlots = (): { label: string; value: string }[] => {
  const slots: { label: string; value: string }[] = [];
  const start = new Date();
  start.setHours(10, 0, 0, 0);

  for (let i = 0; i < 22; i++) {
    const startTime = new Date(start);
    startTime.setMinutes(startTime.getMinutes() + i * 30);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const format = (time: Date) =>
      time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

    slots.push({
      label: `${format(startTime)} - ${format(endTime)}`,
      value: format(startTime),
    });
  }

  return slots;
};

const DoctorSlotManager = () => {

  const context = useContext(DoctorContext);

  if (!context) throw new Error("DoctorProfile must be used within DoctorContextProvider");

  const { profileData } = context;


  const [slotData, setSlotData] = useState<{ [date: string]: { slots: DaySlotMap; isCancelled: boolean } }>({});
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [slots, setSlots] = useState<DaySlotMap>({});
  const [isCancelled, setIsCancelled] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState<Date | null>(null);

  const today = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return date;
  });

  const timeSlots = generateTimeSlots();

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const loadSlots = async () => {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    try {
      const { data } = await getDoctorSlotsAPI(year, month);
      const mapped: { [date: string]: { slots: DaySlotMap; isCancelled: boolean } } = {};

      data.data.forEach((item: any) => {
        const slotMap: DaySlotMap = {};
        item.slots.forEach((slot: any) => {
          slotMap[slot.start] = "available";
        });

        mapped[item.date] = {
          slots: slotMap,
          isCancelled: item.isCancelled,
        };
      });

      setSlotData(mapped);
    } catch {
      toast.error("Failed to load slots");
    }
  };

  const handleDateChange = (indexOrDate: number | Date) => {
    let date: Date;

    if (typeof indexOrDate === "number") {
      setSelectedDateIndex(indexOrDate);
      setCustomDate(null);
      setShowCustomDatePicker(false);
      date = weekDates[indexOrDate];
    } else {
      setCustomDate(indexOrDate);
      setShowCustomDatePicker(true);
      date = indexOrDate;
    }

    const key = formatDate(date);
    const existing = slotData[key];

    setSlots(existing?.slots || {});
    setIsCancelled(existing?.isCancelled || false);
  };

  const toggleSlotStatus = (time: string, status: SlotStatus) => {
    setSlots((prev) => ({
      ...prev,
      [time]: status,
    }));
  };

  const saveSlots = async () => {
    const currentDate = showCustomDatePicker && customDate ? customDate : weekDates[selectedDateIndex];
    const date = formatDate(currentDate);

    const selectedSlots = Object.entries(slots)
      .filter(([_, status]) => status === "available")
      .map(([start]) => {
        const startDate = new Date(`1970-01-01 ${start}`);
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
        return {
          start,
          end: endDate.toTimeString().slice(0, 5),
        };
      });

    try {
      await addDoctorSlotsAPI(date, selectedSlots, false);
      toast.success("Slots updated");
      loadSlots();
    } catch {
      toast.error("Error saving slots");
    }
  };

  const markLeave = async () => {
    const currentDate = showCustomDatePicker && customDate ? customDate : weekDates[selectedDateIndex];
    const date = formatDate(currentDate);

    try {
      await addDoctorSlotsAPI(date, [], true);
      toast.success("Marked as leave");
      loadSlots();
    } catch {
      toast.error("Error marking leave");
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  useEffect(() => {
    handleDateChange(selectedDateIndex);
  }, [slotData]);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];


  // 🔒 Handle pending status
  if (profileData?.status === "pending") {
    return (
      <div className="m-5 text-center bg-yellow-100 border border-yellow-300 rounded-xl p-6 text-yellow-800 shadow-md">
        <h2 className="text-xl font-semibold mb-2">⏳ Awaiting Approval</h2>
        <p>Your registration is under review. The admin has not approved your account yet.</p>
      </div>
    );
  }

  // 🔒 Handle rejected status
  if (profileData?.status === "rejected") {
    return (
      <div className="m-5 text-center bg-red-100 border border-red-300 rounded-xl p-6 text-red-700 shadow-md">
        <h2 className="text-xl font-semibold mb-2">❌ Registration Rejected</h2>
        <p>Your registration has been rejected by the admin.</p>
        <p className="mt-2 text-sm">Please contact support or try registering again with updated details.</p>
      </div>
    );
  }

  // ✅ Show full dashboard only if approved
  if (profileData?.status !== "approved") return null;

  return (
    <div className="py-10 px-4 max-w-5xl mx-auto bg-slate-950 text-slate-100">
      <h2 className="text-2xl font-semibold mb-8">Manage Your Slots</h2>

      {/* ── Week selector ── */}
      <div className="flex gap-3 overflow-x-auto pb-6">
        {weekDates.map((date, i) => {
          const key = formatDate(date);
          const info = slotData[key];
          const selected = selectedDateIndex === i && !showCustomDatePicker;
          return (
            <div
              key={i}
              onClick={() => handleDateChange(i)}
              className={`flex flex-col items-center justify-center min-w-16 px-4 py-5 rounded-full cursor-pointer transition
                ${
                  selected
                    ? "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white"
                    : "ring-1 ring-white/10 text-slate-300 hover:bg-white/5"
                }
                ${
                  info?.isCancelled
                    ? "bg-red-600/20 text-red-300"
                    : Object.keys(info?.slots || {}).length
                    ? "bg-emerald-600/20 text-emerald-300"
                    : ""
                }`}
            >
              <span>{daysOfWeek[date.getDay()]}</span>
              <span className="text-lg font-semibold">{date.getDate()}</span>
            </div>
          );
        })}

        {/* 📅 bubble */}
        <div
          onClick={() => {
            if (showCustomDatePicker) {
              setShowCustomDatePicker(false);
              setCustomDate(null);
              handleDateChange(0);
            } else setShowCustomDatePicker(true);
          }}
          className={`flex flex-col items-center justify-center min-w-16 px-4 py-5 rounded-full cursor-pointer ring-1 ring-white/10 transition
            ${
              showCustomDatePicker
                ? "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white"
                : "text-slate-300 hover:bg-white/5"
            }`}
        >
          <span>📅</span>
          <span className="text-[10px] mt-1">
            {showCustomDatePicker ? "Back" : "More"}
          </span>
        </div>
      </div>

      {/* ── Date‑picker ── */}
      {showCustomDatePicker && (
        <div className="mb-6">
          <DatePicker
            selected={customDate}
            onChange={(d) => d && handleDateChange(d)}
            minDate={new Date()}
            className="px-4 py-2 rounded bg-transparent ring-1 ring-white/10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholderText="Select a future date"
          />
        </div>
      )}

      {/* ── Slot grid / leave notice ── */}
      <div className="bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl p-8 space-y-6">
        {isCancelled ? (
          <p className="text-red-400 font-medium">Marked as Leave</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {timeSlots.map(({ label, value }) => (
              <div
                key={value}
                className="flex justify-between items-center ring-1 ring-white/10 rounded-lg p-4"
              >
                <p className="font-medium w-32">{label}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSlotStatus(value, "available")}
                    className={`px-3 py-1 rounded-full text-xs transition
                      ${
                        slots[value] === "available"
                          ? "bg-emerald-500 text-white"
                          : "ring-1 ring-emerald-500 text-emerald-300 hover:bg-emerald-500/10"
                      }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => toggleSlotStatus(value, "unavailable")}
                    className={`px-3 py-1 rounded-full text-xs transition
                      ${
                        slots[value] === "unavailable"
                          ? "bg-red-500 text-white"
                          : "ring-1 ring-red-500 text-red-300 hover:bg-red-500/10"
                      }`}
                  >
                    Unavailable
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex gap-4 pt-4">
          {!isCancelled && (
            <button
              onClick={saveSlots}
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 px-8 py-2 rounded-full hover:-translate-y-0.5 transition-transform shadow-lg"
            >
              Save
            </button>
          )}
          <button
            onClick={markLeave}
            className="px-8 py-2 rounded-full ring-1 ring-red-500 text-red-300 hover:bg-red-600/20 transition"
          >
            Mark Entire Day as Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorSlotManager;
