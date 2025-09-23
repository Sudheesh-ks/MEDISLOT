import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { assets } from '../../assets/admin/assets';
import { motion } from 'framer-motion';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import DataTable from '../../components/common/DataTable';
import { updateItemInList } from '../../utils/stateHelper.util';
import { calculateAge, currencySymbol, slotDateFormat } from '../../utils/commonUtils';

const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';

const AdminAppointments = () => {
  const navigate = useNavigate();
  const adminContext = useContext(AdminContext);
  if (!adminContext) throw new Error('Missing contexts');

  const { aToken, getAppointmentsPaginated, cancelAppointment } = adminContext;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const perPage = 6;

  useEffect(() => {
    if (aToken) fetchRows();
  }, [aToken, page, search, dateFilter]);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const r = await getAppointmentsPaginated(page, perPage, search, dateFilter);
      setRows(r.data);
      setPages(r.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!aToken) navigate('/admin/login');
  }, [aToken, navigate]);

  const columns = [
    {
      key: '#',
      header: '#',
      width: '0.5fr',
      hideOnMobile: true,
      render: (_: any, i: number) => <p>{(page - 1) * perPage + i + 1}</p>,
    },
    {
      key: 'patient',
      header: 'Patient',
      width: '3fr',
      render: (it: any) => (
        <div className="flex items-center gap-2">
          <img
            className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
            src={it.userData?.image || '/default-avatar.png'}
          />
          <p className="truncate">{it.userData?.name}</p>
        </div>
      ),
    },
    {
      key: 'age',
      header: 'Age',
      width: '1fr',
      hideOnMobile: true,
      render: (it: any) => calculateAge(it.userData?.dob),
    },
    {
      key: 'dt',
      header: 'Date & Time',
      width: '3fr',
      render: (it: any) => (
        <p className="truncate text-xs">
          {slotDateFormat(it.slotDate)}, {it.slotTime}
        </p>
      ),
    },
    {
      key: 'doctor',
      header: 'Doctor',
      width: '3fr',
      render: (it: any) => (
        <div className="flex items-center gap-2">
          <img
            className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
            src={it.docData?.image || '/default-avatar.png'}
          />
          <p className="truncate">{it.docData?.name}</p>
        </div>
      ),
    },
    {
      key: 'fees',
      header: 'Fees',
      width: '1fr',
      render: (it: any) => (
        <>
          {currencySymbol}
          {it.amount}
        </>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '1fr',
      render: (it: any) =>
        it.cancelled ? (
          <span className="text-xs font-semibold text-red-400">Cancelled</span>
        ) : it.isConfirmed ? (
          <span className="text-xs font-semibold text-emerald-400">Confirmed</span>
        ) : (
          <motion.img
            whileTap={{ scale: 0.9 }}
            src={assets.cancel_icon}
            className="w-7 cursor-pointer hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              cancelAppointment(it._id);
              setRows((prev) => updateItemInList(prev, it._id, { cancelled: true }));
            }}
          />
        ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto m-5 text-slate-100">
      <h2 className="mb-5 text-lg font-semibold flex items-center gap-2">
        <span>📅</span> All Appointments
      </h2>

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

        {/* Custom Range Inputs */}
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

      <DataTable
        data={rows}
        columns={columns}
        loading={loading}
        emptyMessage="No matching appointments found."
        gridCols="grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr]"
        containerClassName={`${glass} max-h-[80vh] min-h-[60vh]`}
        className="hover:bg-white/5"
      />

      {pages > 1 && <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />}
    </div>
  );
};

export default AdminAppointments;
