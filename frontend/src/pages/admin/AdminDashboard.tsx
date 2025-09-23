import { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { assets } from '../../assets/admin/assets';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  Tooltip,
  Legend,
} from 'chart.js';
import { updateItemInList } from '../../utils/stateHelper.util';
import { slotDateFormat } from '../../utils/commonUtils';
import type { DateRange } from '../../components/common/DateFilter';
import {
  getAppointmentsStatsAPI,
  getRevenueStatsAPI,
  getTopDoctorsAPI,
} from '../../services/adminServices';
import DateFilter from '../../components/common/DateFilter';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  Tooltip,
  Legend
);

const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
const cardBase = 'cursor-pointer text-white p-6 rounded-xl shadow-md flex items-center gap-4';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminContext = useContext(AdminContext);
  if (!adminContext) throw new Error('Missing contexts');

  const { aToken, dashData, getDashData, cancelAppointment } = adminContext;

  const [latestAppointments, setLatestAppointments] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ type: 'today' });
  const [appointmentsData, setAppointmentsData] = useState<{ date: string; count: number }[]>([]);
  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (aToken) getDashData();
  }, [aToken]);

  useEffect(() => {
    if (!aToken) navigate('/admin/login');
  }, [aToken, navigate]);

  useEffect(() => {
    if (dashData?.latestAppointments) setLatestAppointments(dashData.latestAppointments);
  }, [dashData]);

  const computeRange = (range: DateRange) => {
    const today = new Date();
    const start = new Date();
    let end = new Date();
    switch (range.type) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        start.setDate(today.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastweek':
        start.setDate(today.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastmonth':
        start.setMonth(today.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        if (range.startDate) start.setTime(new Date(range.startDate).getTime());
        else start.setTime(0);
        if (range.endDate) {
          end = new Date(range.endDate);
          end.setHours(23, 59, 59, 999);
        } else end = new Date();
        break;
      default:
        start.setDate(today.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    return { start: start.toISOString(), end: end.toISOString() };
  };

  useEffect(() => {
    if (!aToken) return;
    const { start, end } = computeRange(dateRange);
    setLoadingStats(true);
    Promise.all([
      getAppointmentsStatsAPI(aToken, start, end),
      getTopDoctorsAPI(aToken, 5),
      getRevenueStatsAPI(aToken, start, end),
    ])
      .then(([a, t, r]) => {
        setAppointmentsData(a || []);
        setTopDoctors(t || []);
        setRevenueData(r || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingStats(false));
  }, [aToken, dateRange]);
  const stats = useMemo(
    () =>
      dashData
        ? [
            {
              count: dashData.doctors,
              label: 'Doctors',
              icon: assets.doctor_icon,
              grad: 'from-cyan-500 to-fuchsia-600',
              path: '/admin/all-doctors',
            },
            {
              count: dashData.appointments,
              label: 'Appointments',
              icon: assets.appointments_icon,
              grad: 'from-emerald-500 to-teal-500',
              path: '/admin/appointments',
            },
            {
              count: dashData.patients,
              label: 'Patients',
              icon: assets.patients_icon,
              grad: 'from-indigo-500 to-violet-600',
              path: '/admin/user-management',
            },
          ]
        : [],
    [dashData]
  );

  const lineData = useMemo(
    () => ({
      labels: appointmentsData.map((d) => d.date),
      datasets: [
        {
          label: 'Appointments',
          data: appointmentsData.map((d) => d.count),
          fill: false,
          tension: 0.3,
        },
      ],
    }),
    [appointmentsData]
  );

  const revenueLineData = useMemo(
    () => ({
      labels: revenueData.map((d) => d.date),
      datasets: [
        { label: 'Revenue', data: revenueData.map((d) => d.revenue), fill: false, tension: 0.3 },
      ],
    }),
    [revenueData]
  );

  const topDoctorsBarData = useMemo(
    () => ({
      labels: topDoctors.map((t: any) => t.doctorName || 'Unknown'),
      datasets: [
        {
          label: 'Top 5 doctors',
          data: topDoctors.map((t: any) => t.appointments),
          backgroundColor: '#007bff',
          borderRadius: 5,
          borderWidth: 1,
          borderColor: '#0056b3',
        },
      ],
    }),
    [topDoctors]
  );

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#007bff',
          font: { size: 14 },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
        borderColor: '#007bff',
      },
      point: {
        radius: 5,
        backgroundColor: '#007bff',
        borderColor: '#fff',
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 123, 255, 0.1)',
        },
        ticks: {
          color: '#007bff',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 123, 255, 0.1)',
        },
        ticks: {
          color: '#007bff',
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#007bff',
          font: { size: 14 },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#007bff' },
        grid: { color: 'rgba(0, 123, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#007bff' },
        grid: { color: 'rgba(0, 123, 255, 0.1)' },
      },
    },
  };

  return (
    <div className="m-5 space-y-10 text-slate-100">
      {!dashData || loadingStats ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((c, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                onClick={() => navigate(c.path)}
                className={`${cardBase} bg-gradient-to-r ${c.grad}`}
              >
                <img src={c.icon} className="w-12 h-12" />
                <div>
                  <p className="text-2xl font-bold">{c.count}</p>
                  <p className="text-sm opacity-80">{c.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className={`${glass} rounded-xl overflow-hidden p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={assets.list_icon} className="w-6" />
                <p className="font-semibold text-lg">Latest Bookings</p>
              </div>
              <DateFilter value={dateRange} onChange={setDateRange} />
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 bg-slate-800 p-4 rounded">
                <p className="text-sm font-semibold mb-2">Appointments Trend</p>
                <div style={{ height: 200 }}>
                  <Line data={lineData} options={chartOptions} />
                </div>
              </div>

              <div className="col-span-1 bg-slate-800 p-4 rounded">
                <p className="text-sm font-semibold mb-2">Top Doctors</p>
                <div style={{ height: 200 }}>
                  <Bar data={topDoctorsBarData as any} options={barOptions} />
                </div>
              </div>

              <div className="col-span-1 bg-slate-800 p-4 rounded">
                <p className="text-sm font-semibold mb-2">Revenue</p>
                <div style={{ height: 200 }}>
                  <Line data={revenueLineData} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="mt-6 divide-y divide-white/10 rounded overflow-hidden">
              {latestAppointments.map((it: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-white/5"
                >
                  <img
                    src={it.docData?.image}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold">{it.docData?.name}</p>
                    <p className="text-slate-400 text-xs">{slotDateFormat(it.slotDate)}</p>
                  </div>
                  {it.cancelled ? (
                    <span className="text-sm font-semibold text-red-400">Cancelled</span>
                  ) : (
                    <motion.img
                      whileTap={{ scale: 0.9 }}
                      src={assets.cancel_icon}
                      className="w-6 cursor-pointer hover:opacity-80"
                      onClick={async () => {
                        await cancelAppointment(it._id!);
                        setLatestAppointments((prev) =>
                          updateItemInList(prev, it._id!, { cancelled: true })
                        );
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
