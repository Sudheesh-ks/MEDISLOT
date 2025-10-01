import { useEffect, useState, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { DateRange } from '../../components/common/DateFilter';
import DateFilter from '../../components/common/DateFilter';
import { assets } from '../../assets/admin/assets';
import { getDoctorDashboardDataAPI } from '../../services/doctorServices';
import { currencySymbol } from '../../utils/commonUtils';
import { DoctorContext } from '../../context/DoctorContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
const cardBase = 'text-white p-6 rounded-xl shadow-md flex items-center gap-4';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const context = useContext(DoctorContext);
  const [dateRange, setDateRange] = useState<DateRange>({ type: 'today' });
  const [appointmentsData, setAppointmentsData] = useState<{ date: string; count: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  if (!context) throw new Error('DoctorContext missing');
  const { dToken, profileData } = context;

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
    const { start, end } = computeRange(dateRange);
    setLoadingStats(true);
    getDoctorDashboardDataAPI(start, end)
      .then((res) => {
        const data = res.data;
        setAppointmentsData(
          data.appointmentData?.map((d: { date: string; count: number }) => ({
            date: d.date,
            count: d.count,
          })) || []
        );
        setRevenueData(
          data.revenueData?.map((d: { date: string; revenue: number }) => ({
            date: d.date,
            revenue: d.revenue,
          })) || []
        );

        setTotalAppointments(
          data.appointmentData?.reduce((acc: number, cur: any) => acc + cur.count, 0) || 0
        );
        setTotalRevenue(
          data.revenueData?.reduce((acc: number, cur: any) => acc + cur.revenue, 0) || 0
        );
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingStats(false));
  }, [dateRange]);

  const lineData = useMemo(
    () => ({
      labels: appointmentsData.map((d) => d.date),
      datasets: [
        {
          label: 'Appointments',
          data: appointmentsData.map((d) => d.count),
          fill: false,
          tension: 0.3,
          borderColor: '#007bff',
          backgroundColor: '#007bff',
        },
      ],
    }),
    [appointmentsData]
  );

  const revenueLineData = useMemo(
    () => ({
      labels: revenueData.map((d) => d.date),
      datasets: [
        {
          label: 'Revenue',
          data: revenueData.map((d) => d.revenue),
          fill: false,
          tension: 0.3,
          borderColor: '#28a745',
          backgroundColor: '#28a745',
        },
      ],
    }),
    [revenueData]
  );

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#fff' } },
    },
    scales: {
      x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
    },
  };

  useEffect(() => {
    if (!dToken) {
      navigate('/doctor/login');
    }
  }, [dToken]);

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
    <div className="m-4 sm:m-5 space-y-8 sm:space-y-10 text-slate-100">
      {loadingStats ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <motion.div
              onClick={() => navigate('/doctor/appointments')}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`${cardBase} bg-gradient-to-r from-emerald-500 to-teal-500`}
            >
              <img src={assets.appointments_icon} className="w-10 h-10 sm:w-12 sm:h-12" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{totalAppointments}</p>
                <p className="text-xs sm:text-sm opacity-80">Appointments</p>
              </div>
            </motion.div>

            <motion.div
              onClick={() => navigate('/doctor/wallet')}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`${cardBase} bg-gradient-to-r from-indigo-500 to-violet-600`}
            >
              <img src={assets.earning_icon} className="w-10 h-10 sm:w-12 sm:h-12" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {currencySymbol}
                  {totalRevenue}
                </p>
                <p className="text-xs sm:text-sm opacity-80">Total Revenue</p>
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className={`${glass} rounded-xl overflow-hidden p-4 sm:p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <p className="font-semibold text-base sm:text-lg">Performance Overview</p>
              <DateFilter value={dateRange} onChange={setDateRange} />
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-slate-800 p-3 sm:p-4 rounded">
                <p className="text-xs sm:text-sm font-semibold mb-2">Appointments Trend</p>
                <div style={{ height: 200 }}>
                  <Line data={lineData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-slate-800 p-3 sm:p-4 rounded">
                <p className="text-xs sm:text-sm font-semibold mb-2">Revenue</p>
                <div style={{ height: 200 }}>
                  <Line data={revenueLineData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
