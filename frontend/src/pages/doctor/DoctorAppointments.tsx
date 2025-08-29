import { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { assets } from '../../assets/admin/assets';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import { NotifContext } from '../../context/NotificationContext';
import { updateItemInList } from '../../utils/stateHelper.util';
import { calculateAge, currencySymbol, slotDateFormat } from '../../utils/commonUtils';
import { to12h } from '../../utils/slotManagementHelper';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const isSessionEnded = (slotDate: string, slotEndTime: string) => {
  const endDateTime = dayjs(`${slotDate} ${slotEndTime}`, 'YYYY-MM-DD HH:mm');
  return dayjs().isAfter(endDateTime.add(24, 'hour'));
};

const DoctorAppointments = () => {
  const context = useContext(DoctorContext);
  const navigate = useNavigate();
  const notif = useContext(NotifContext);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const perPage = 6;

  if (!context) throw new Error('DoctorContext missing');
  const { dToken, getAppointmentsPaginated, confirmAppointment, cancelAppointment, profileData } =
    context;

  useEffect(() => {
    if (dToken) fetchRows();
  }, [dToken, page, search, dateFilter]);

  useEffect(() => {
    if (!dToken) navigate('/doctor/login');
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const r = await getAppointmentsPaginated(page, perPage, search, dateFilter);
      setRows(r.data);
      setPages(r.totalPages);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const doConfirm = async (id: string) => {
    await confirmAppointment(id);
    setRows((prev) => updateItemInList(prev, id, { isConfirmed: true }));
  };
  const doCancel = async (id: string) => {
    await cancelAppointment(id);
    setRows((prev) => updateItemInList(prev, id, { cancelled: true }));
  };

  const filtered = rows.filter((r) => r.userData.name.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    {
      key: '#',
      header: '#',
      width: '0.5fr',
      hideOnMobile: true,
      render: (_: any, i: number) => i + 1,
    },
    {
      key: 'patient',
      header: 'Patient',
      width: '2fr',
      render: (it: any) => (
        <div className="flex items-center gap-2">
          <img className="w-12 h-12 rounded-full object-cover" src={it.userData.image} />
          <p>{it.userData.name}</p>
        </div>
      ),
    },
    {
      key: 'pay',
      header: 'Payment',
      width: '1fr',
      render: (it: any) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ring-1 ${
            it.payment ? 'ring-emerald-500 text-emerald-400' : 'ring-red-500 text-red-400'
          }`}
        >
          {it.payment ? 'Paid' : 'failed'}
        </span>
      ),
    },
    {
      key: 'age',
      header: 'Age',
      width: '1fr',
      hideOnMobile: true,
      render: (it: any) => calculateAge(it.userData.dob),
    },
    {
      key: 'dt',
      header: 'Date & Time',
      width: '3fr',
      render: (it: any) => `${slotDateFormat(it.slotDate)}, ${to12h(it.slotStartTime)}`,
    },
    {
      key: 'fees',
      header: 'Fees',
      width: '1fr',
      render: (it: any) => (
        <span>
          {currencySymbol}
          {it.amount}
        </span>
      ),
    },
    {
      key: 'act',
      header: 'Action',
      width: '1fr',
      render: (it: any) =>
        it.cancelled ? (
          <span className="text-red-500">Cancelled</span>
        ) : it.isConfirmed ? (
          isSessionEnded(it.slotDate, it.slotEndTime) ? (
            <button
              disabled
              className="bg-gray-600 px-4 py-1.5 text-sm rounded-lg text-white cursor-not-allowed"
            >
              Session Ended
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/doctor/consultation/${it.userData._id}/${it._id}`);
              }}
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 px-4 py-1.5 text-sm rounded-lg text-white shadow relative"
            >
              Consultation
              {notif?.unread?.[`${it.userData._id}_${profileData!._id}`] > 0 && (
                <span className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 bg-red-500 text-xs rounded-full flex items-center justify-center">
                  {notif.unread[`${it.userData._id}_${profileData!._id}`]}
                </span>
              )}
            </button>
          )
        ) : (
          <div className="flex gap-3">
            <img
              onClick={(e) => {
                e.stopPropagation();
                doCancel(it._id);
              }}
              src={assets.cancel_icon}
              className="w-7 cursor-pointer opacity-80 hover:opacity-100"
            />
            <img
              onClick={(e) => {
                e.stopPropagation();
                doConfirm(it._id);
              }}
              src={assets.tick_icon}
              className="w-7 cursor-pointer opacity-80 hover:opacity-100"
            />
          </div>
        ),
    },
  ];

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
    <div className="w-full max-w-6xl m-5 text-slate-100">
      <p className="mb-5 text-lg font-medium">All Appointments</p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        {/* Search Bar */}
        <div className="max-w-sm flex-1 bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-xl p-3">
          <SearchBar placeholder="Search by patient name" onSearch={setSearch} />
        </div>

        {/* Date Filter Dropdown */}
        <select
          value={filterType}
          onChange={(e) => {
            const val = e.target.value;
            setFilterType(val);
            if (val !== 'custom') {
              setDateFilter(val);
            } else {
              setDateFilter('');
            }
          }}
          className="bg-slate-800 text-slate-200 backdrop-blur text-slate-200 p-2 rounded-lg border border-slate-600"
        >
          <option value="">All</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last_week">Last Week</option>
          <option value="last_month">Last Month</option>
          <option value="custom">Custom</option>
        </select>

        {/* Custom Range Inputs (visible only if custom is chosen) */}
        {filterType === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-lg p-2 text-slate-200"
              onChange={(e) =>
                setDateFilter((prev) => `${e.target.value}_${prev?.split('_')[1] || ''}`)
              }
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              className="bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-lg p-2 text-slate-200"
              onChange={(e) =>
                setDateFilter((prev) => `${prev?.split('_')[0] || ''}_${e.target.value}`)
              }
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : filtered.length ? (
        <>
          <DataTable
            data={filtered}
            columns={cols}
            emptyMessage="No matching appointments found."
            gridCols="grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr]"
            containerClassName="max-h-[80vh] min-h-[50vh]"
          />
          {pages > 1 && <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />}
        </>
      ) : (
        <div className="text-slate-400 mt-10 text-center w-full">No appointments found.</div>
      )}
    </div>
  );
};
export default DoctorAppointments;
