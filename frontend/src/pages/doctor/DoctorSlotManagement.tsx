import { useEffect, useState } from "react";
import { getDoctorSlotsAPI, addDoctorSlotsAPI } from "../../services/doctorServices";
import { toast } from "react-toastify";

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
      time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

    slots.push({
      label: `${format(startTime)} - ${format(endTime)}`,
      value: format(startTime), // Use value as key
    });
  }

  return slots;
};


const DoctorSlotManager = () => {
  const [slotData, setSlotData] = useState<{ [date: string]: { slots: DaySlotMap; isCancelled: boolean } }>({});
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [slots, setSlots] = useState<DaySlotMap>({});
  const [isCancelled, setIsCancelled] = useState(false);

  const today = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return date;
  });

  const timeSlots = generateTimeSlots();

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const loadSlots = async () => {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    try {
      const { data } = await getDoctorSlotsAPI(year, month);
      const mapped: { [date: string]: { slots: DaySlotMap; isCancelled: boolean } } = {};

      data.data.forEach((item: any) => {
        const slotMap: DaySlotMap = {};
        item.slots.forEach((slot: any) => {
          slotMap[slot.start] = "available"; // assuming start is enough
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

  const handleDateChange = (index: number) => {
    setSelectedDateIndex(index);

    const key = formatDate(weekDates[index]);
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
    const date = formatDate(weekDates[selectedDateIndex]);
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
    const date = formatDate(weekDates[selectedDateIndex]);
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Manage Your Slots</h2>

      {/* Week selector */}
      <div className="flex gap-3 overflow-x-auto mb-6">
        {weekDates.map((date, i) => {
          const key = formatDate(date);
          const slot = slotData[key];
          return (
            <div
              key={i}
              className={`text-center px-4 py-5 rounded-full min-w-16 cursor-pointer ${
                selectedDateIndex === i
                  ? "bg-primary text-white"
                  : "border border-gray-300 text-gray-600"
              } ${slot?.isCancelled ? "bg-red-100" : Object.keys(slot?.slots || {}).length ? "bg-green-100" : ""}`}
              onClick={() => handleDateChange(i)}
            >
              <p>{daysOfWeek[date.getDay()]}</p>
              <p>{date.getDate()}</p>
            </div>
          );
        })}
      </div>

      {/* Slot selection */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        {isCancelled ? (
          <p className="text-red-500 font-medium">Marked as Leave</p>
        ) : (
        //   {/* Time Slot Editor */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {timeSlots.map(({ label, value }) => (
    <div
      key={value}
      className="flex justify-between items-center border rounded-lg p-3"
    >
      <p className="text-gray-700 font-medium w-32">{label}</p>
      <div className="flex gap-2">
        <button
          onClick={() => toggleSlotStatus(value, "available")}
          className={`px-3 py-1 rounded-full text-sm transition ${
            slots[value] === "available"
              ? "bg-green-500 text-white"
              : "border border-green-500 text-green-600 hover:bg-green-50"
          }`}
        >
          Available
        </button>
        <button
          onClick={() => toggleSlotStatus(value, "unavailable")}
          className={`px-3 py-1 rounded-full text-sm transition ${
            slots[value] === "unavailable"
              ? "bg-red-500 text-white"
              : "border border-red-500 text-red-600 hover:bg-red-50"
          }`}
        >
          Unavailable
        </button>
      </div>
    </div>
  ))}
</div>
)}

        <div className="mt-6 flex gap-4">
          {!isCancelled && (
            <button onClick={saveSlots} className="bg-primary text-white px-6 py-2 rounded-full">
              Save
            </button>
          )}
          <button
            onClick={markLeave}
            className="border border-red-400 text-red-500 px-6 py-2 rounded-full"
          >
            Mark Entire Day as Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorSlotManager;
