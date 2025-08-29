import { useContext, useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  X,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/doctor/SlotCard';
import { Button } from '../../components/doctor/Button';
import { Input } from '../../components/doctor/SlotInput';
import { getDaySlotsAPI, upsertDaySlotsAPI } from '../../services/doctorServices';
import { toast } from 'react-toastify';
import { DoctorContext } from '../../context/DoctorContext';

const to12h = (t: string) => dayjs(t, 'HH:mm').format('hh:mm A').toLowerCase();

interface Range {
  start: string;
  end: string;
  isAvailable: boolean;
}

export default function DoctorSlotManager() {
  const doctorContext = useContext(DoctorContext);

  if (!doctorContext) throw new Error('context missing');

  const { profileData } = doctorContext;
  const [month, setMonth] = useState<Dayjs>(dayjs().startOf('month'));
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [ranges, setRanges] = useState<Range[]>([]);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [dayStatus, setDayStatus] = useState<Record<string, boolean>>({});

  const monthDays = useMemo(() => {
    const startDay = month.startOf('week');
    const endDay = month.endOf('month').endOf('week');

    const days: Dayjs[] = [];
    let day = startDay;
    while (day.isBefore(endDay)) {
      days.push(day);
      day = day.add(1, 'day');
    }
    return days;
  }, [month]);

  const addRange = () => {
    const newStart = dayjs(start, 'HH:mm');
    const newEnd = dayjs(end, 'HH:mm');

    if (!newEnd.isAfter(newStart)) {
      toast.error('End time must be after start time');
      return;
    }

    const clashes = ranges.some((r) => {
      const s = dayjs(r.start, 'HH:mm');
      const e = dayjs(r.end, 'HH:mm');
      return newStart.isBefore(e) && newEnd.isAfter(s);
    });

    if (clashes) {
      toast.error('This time slot already exists');
      return;
    }

    setRanges((r) => [...r, { start, end, isAvailable: true }]);
    toast.success('Time slot added');
  };

  const toggleAvailability = (i: number) =>
    setRanges((r) =>
      r.map((range, idx) => (idx === i ? { ...range, isAvailable: !range.isAvailable } : range))
    );

  const deleteRange = (i: number) => setRanges((r) => r.filter((_, idx) => idx !== i));

  const saveSchedule = async () => {
    if (!selectedDate) return;
    try {
      await upsertDaySlotsAPI(selectedDate.format('YYYY-MM-DD'), ranges, false);
      toast.success('Schedule saved');

      setDayStatus((s) => ({
        ...s,
        [selectedDate.format('YYYY-MM-DD')]: ranges.some((r) => r.isAvailable),
      }));
    } catch {
      toast.error('Failed to save schedule');
    }
  };

  const markDayUnavailable = () => {
    setRanges([{ start: '00:00', end: '23:59', isAvailable: false }]);
    setConfirmLeave(false);

    if (selectedDate) {
      setDayStatus((s) => ({
        ...s,
        [selectedDate.format('YYYY-MM-DD')]: false,
      }));
    }
  };

  useEffect(() => {
    if (!selectedDate) return;
    (async () => {
      try {
        const dayRanges = await getDaySlotsAPI(selectedDate.format('YYYY-MM-DD'));
        setRanges(dayRanges ?? []);
      } catch {
        toast.error('Failed to load day slots');
        setRanges([]);
      }
    })();
  }, [selectedDate]);

  useEffect(() => {
    const fetchMonthStatus = async () => {
      const startOfMonth = month.startOf('month');
      const endOfMonth = month.endOf('month');
      const tasks: Promise<{ date: string; hasFree: boolean }>[] = [];

      let d = startOfMonth.clone();
      while (d.isSame(endOfMonth, 'day') || d.isBefore(endOfMonth)) {
        const iso = d.format('YYYY-MM-DD');
        tasks.push(
          getDaySlotsAPI(iso)
            .then((ranges) => ({
              date: iso,
              hasFree: (ranges ?? []).some((r: Range) => r.isAvailable),
            }))
            .catch(() => ({ date: iso, hasFree: false }))
        );
        d = d.add(1, 'day');
      }

      const results = await Promise.all(tasks);
      setDayStatus(
        results.reduce<Record<string, boolean>>((acc, { date, hasFree }) => {
          acc[date] = hasFree;
          return acc;
        }, {})
      );
    };

    fetchMonthStatus();
  }, [month]);

  if (profileData?.status === 'pending')
    return (
      <div className="m-5 text-center bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 text-yellow-200 shadow-md">
        <h2 className="text-xl font-semibold mb-2">⏳ Awaiting Approval</h2>
        <p>Your registration is under review. The admin has not approved your account yet.</p>
      </div>
    );
  if (profileData?.status === 'rejected')
    return (
      <div className="m-5 text-center bg-red-900/30 border border-red-600 rounded-xl p-6 text-red-300 shadow-md">
        <h2 className="text-xl font-semibold mb-2">❌ Registration Rejected</h2>
        <p>Your registration has been rejected by the admin.</p>
        <p className="mt-2 text-sm">
          Please contact support or try registering again with updated details.
        </p>
      </div>
    );
  if (profileData?.status !== 'approved') return null;
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
        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center border-b border-muted-foreground/10 pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMonth((m) => m.subtract(1, 'month'))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-lg md:text-xl font-semibold">
              {month.format('MMMM YYYY')}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setMonth((m) => m.add(1, 'month'))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-7 mb-2 text-center text-sm font-semibold text-muted-foreground">
              {'SUN MON TUE WED THU FRI SAT'.split(' ').map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((d) => {
                const iso = d.format('YYYY-MM-DD');
                const hasFree = dayStatus[iso];
                const dotColour =
                  hasFree === undefined
                    ? 'bg-rose-400'
                    : hasFree
                      ? 'bg-emerald-400'
                      : 'bg-rose-400';
                const isCurrentMonth = d.month() === month.month();
                const isSelected = selectedDate && d.isSame(selectedDate, 'day');
                return (
                  <button
                    key={d.toString()}
                    onClick={() => setSelectedDate(d)}
                    className={`relative h-12 rounded-lg flex flex-col items-center justify-center transition
                      ${isSelected ? 'bg-[#5f6FFF] text-white' : 'hover:bg-gray-700/50'}
                      ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <span className="text-sm font-medium">{d.date()}</span>
                    <span className={`w-2 h-2 rounded-full ${dotColour} mt-1`} />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg h-fit sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedDate ? selectedDate.format('DD MMM, YYYY') : 'Pick a date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 items-end">
              <div className="flex flex-col gap-1 w-full max-w-[128px]">
                <label className="text-xs uppercase tracking-wide">Start</label>
                <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1 w-full max-w-[128px]">
                <label className="text-xs uppercase tracking-wide">End</label>
                <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>

              <Button variant="secondary" className="mt-6" onClick={addRange}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {ranges.map((r, i) => (
                <li key={i} className="flex items-center justify-between bg-muted p-3 rounded-xl">
                  <span className="text-sm font-medium">
                    {to12h(r.start)} – {to12h(r.end)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => toggleAvailability(i)}>
                      {r.isAvailable ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteRange(i)}>
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

            <div className="flex flex-col gap-3">
              <Button className="w-full" onClick={saveSchedule}>
                Save Schedule
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setConfirmLeave(true)}
              >
                Mark Day Unavailable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {confirmLeave && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmLeave(false)}
          />
          <div className="relative z-50 w-72 rounded-2xl bg-slate-900 p-6 text-center ring-1 ring-white/10 shadow-2xl">
            <h4 className="mb-4 text-lg font-semibold text-slate-100">
              Mark entire day unavailable?
            </h4>
            <p className="mb-6 text-sm text-slate-400">
              Patients will not be able to book any slots for this day.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={() => setConfirmLeave(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={markDayUnavailable}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
