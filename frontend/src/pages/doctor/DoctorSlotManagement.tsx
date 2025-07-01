import React, { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/doctor/SlotCard";
import { Button } from "../../components/doctor/Button";
import { Input } from "../../components/doctor/SlotInput";
import { getDaySlotsAPI, upsertDaySlotsAPI } from "../../services/doctorServices";
import { toast } from "react-toastify";


/** "23:00" -> "11:00 pm" */
const to12h = (t: string) => dayjs(t, "HH:mm").format("hh:mm A").toLowerCase();


/**
 * DoctorSlotManager – UI‑only component that lets a doctor
 * pick a day in a monthly calendar, add arbitrary [start,end]
 * ranges for that day, mark them available/unavailable, and save.
 *
 * Hook up your API calls inside the TODO comments.
 * Uses TailwindCSS, Framer Motion, shadcn/ui, lucide‑react.
 */
export default function DoctorSlotManager() {
  /* ---------------- state ---------------- */
  const [month, setMonth] = useState<Dayjs>(dayjs().startOf("month"));
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [ranges, setRanges] = useState<Range[]>([]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  /* --------- compute days for calendar --------- */
  const monthDays = useMemo(() => {
    const startDay = month.startOf("week"); // locale aware (Sunday)
    const endDay = month.endOf("month").endOf("week");

    const days: Dayjs[] = [];
    let day = startDay;
    while (day.isBefore(endDay)) {
      days.push(day);
      day = day.add(1, "day");
    }
    return days;
  }, [month]);

  /* -------------- handlers -------------- */
  const addRange = () => {
if (dayjs(end, "HH:mm").isBefore(dayjs(start, "HH:mm"))) {
  return alert("End time must be after start time");
}
    setRanges((r) => [
      ...r,
      { start, end, isAvailable: true },
    ]);
  };

  const toggleAvailability = (i: number) =>
    setRanges((r) =>
      r.map((range, idx) =>
        idx === i ? { ...range, isAvailable: !range.isAvailable } : range
      )
    );

  const deleteRange = (i: number) =>
    setRanges((r) => r.filter((_, idx) => idx !== i));

const saveSchedule = async () => {
 if (!selectedDate) return;
 try {
   await upsertDaySlotsAPI(
     selectedDate.format("YYYY-MM-DD"),
     ranges,
     false   // isCancelled
   );
   toast.success("Schedule saved");
 } catch {
   toast.error("Failed to save schedule");
 }
};

 useEffect(() => {
  if (!selectedDate) return;
  (async () => {
    try {
      const dayRanges = await getDaySlotsAPI(
        selectedDate.format("YYYY-MM-DD")
      );                           // ← this is already the array
      setRanges(dayRanges ?? []);
    } catch {
      toast.error("Failed to load day slots");
      setRanges([]);
    }
  })();
}, [selectedDate]);
  /* ---------------- render ---------------- */
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 md:px-10 py-12"
    >
      <h1 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
        <CalendarIcon className="w-8 h-8 text-[#5f6FFF]" /> Manage Slots
      </h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* ---------- calendar ---------- */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center border-b border-muted-foreground/10 pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMonth((m) => m.subtract(1, "month"))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-lg md:text-xl font-semibold">
              {month.format("MMMM YYYY")}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMonth((m) => m.add(1, "month"))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            {/* day names */}
            <div className="grid grid-cols-7 mb-2 text-center text-sm font-semibold text-muted-foreground">
              {"SUN MON TUE WED THU FRI SAT".split(" ").map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {/* dates */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((d) => {
                const isCurrentMonth = d.month() === month.month();
                const isSelected = selectedDate && d.isSame(selectedDate, "day");
                return (
                  <button
                    key={d.toString()}
                    onClick={() => setSelectedDate(d)}
                    className={`relative h-12 rounded-lg flex flex-col items-center justify-center transition
                      ${isSelected ? "bg-[#5f6FFF] text-white" : "hover:bg-gray-700/50"}
                      ${!isCurrentMonth ? "opacity-40" : ""}`}
                  >
                    <span className="text-sm font-medium">
                      {d.date()}
                    </span>
                    {/* Availability bubble – placeholder */}
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ---------- editor panel ---------- */}
        <Card className="rounded-2xl shadow-lg h-fit sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedDate ? selectedDate.format("DD MMM, YYYY") : "Pick a date"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* time inputs */}
            <div className="flex gap-4 items-end">
              <div className="flex flex-col gap-1 w-full max-w-[128px]">
                <label className="text-xs uppercase tracking-wide">Start</label>
                <Input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1 w-full max-w-[128px]">
                <label className="text-xs uppercase tracking-wide">End</label>
                <Input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
              
              <Button variant="secondary" className="mt-6" onClick={addRange}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {/* ranges list */}
            <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {ranges.map((r, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-muted p-3 rounded-xl"
                >
                  <span className="text-sm font-medium">
   {to12h(r.start)} – {to12h(r.end)}
 </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleAvailability(i)}
                    >
                      {r.isAvailable ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteRange(i)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
              {!ranges.length && (
                <li className="text-muted-foreground text-sm text-center py-6">
                  No ranges added yet
                </li>
              )}
            </ul>

            {/* save / mark day unavailable */}
            <div className="flex flex-col gap-3">
              <Button className="w-full" onClick={saveSchedule}>
                Save Schedule
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  if (confirm("Mark entire day unavailable?")) {
                    setRanges([{ start: "00:00", end: "23:59", isAvailable: false }]);
                  }
                }}
              >
                Mark Day Unavailable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}

interface Range {
  start: string; // HH:mm
  end: string; // HH:mm
  isAvailable: boolean;
}
