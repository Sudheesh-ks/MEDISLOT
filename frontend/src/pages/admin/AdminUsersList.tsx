import { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import DataTable from '../../components/common/DataTable';
import { updateItemInList } from '../../utils/stateHelper.util';
import { assets } from '../../assets/user/assets';

const AdminUsersList = () => {
  const navigate = useNavigate();
  const adminContext = useContext(AdminContext);
  if (!adminContext) throw new Error('AdminContext missing');

  const { aToken, getUsersPaginated, toggleBlockUser } = adminContext;

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const perPage = 6;
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (aToken) fetchRows();
  }, [aToken, page, search]);

  useEffect(() => {
    if (!aToken) navigate('/admin/login');
  }, [aToken]);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await getUsersPaginated(page, perPage, search);
      setRows(res.data);
      setPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const doToggle = async (id: string) => {
    await toggleBlockUser(id);

    setRows((prev) =>
      updateItemInList(prev, id, (item: any) => ({
        ...item,
        isBlocked: !item.isBlocked,
      }))
    );
  };

  const cols = [
    {
      key: '#',
      header: '#',
      width: '0.5fr',
      hideOnMobile: true,
      render: (_: any, i: number) => (page - 1) * perPage + i + 1,
    },
    {
      key: 'img',
      header: 'Image',
      width: '2fr',
      render: (it: any) => (
        <img
          src={it.image || assets.default_profile}
          className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
        />
      ),
    },
    {
      key: 'name',
      header: 'Name',
      width: '2fr',
      render: (it: any) => <span className="font-medium">{it.name}</span>,
    },
    {
      key: 'mail',
      header: 'Email',
      width: '3fr',
      render: (it: any) => <span className="text-slate-400 text-sm">{it.email}</span>,
    },
    {
      key: 'st',
      header: 'Status',
      width: '1.5fr',
      render: (it: any) => (
        <span
          className={`px-3 py-0.5 text-xs rounded-full font-semibold
            ${it.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}
        >
          {it.isBlocked ? 'Blocked' : 'Active'}
        </span>
      ),
    },
    {
      key: 'act',
      header: 'Action',
      width: '1.5fr',
      className: 'text-right pr-4',
      render: (it: any) => (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={(e) => {
            e.stopPropagation();
            doToggle(it._id);
            setRows((prev) => updateItemInList(prev, it._id, { isBlocked: !it.isBlocked }));
          }}
          className={`px-4 py-1.5 text-xs rounded-lg font-medium shadow-md
            ${
              it.isBlocked
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'bg-gradient-to-r from-red-500 to-fuchsia-500 text-white'
            }`}
        >
          {it.isBlocked ? 'Unblock' : 'Block'}
        </motion.button>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl m-5 text-slate-100">
      <h1 className="mb-4 text-lg font-semibold">👥 All Users</h1>

      <div className="mb-6 max-w-sm">
        <SearchBar
          placeholder="Search by name or email"
          onSearch={(val) => {
            setSearch(val);
            setPage(1);
          }}
        />
      </div>

      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No matching users found."
        gridCols="grid-cols-[0.5fr_2fr_2fr_3fr_1.5fr_1.5fr]"
        containerClassName="max-h-[80vh] min-h-[60vh] bg-white/5 backdrop-blur ring-1 ring-white/10"
        className="hover:bg-white/5"
      />

      {pages > 1 && <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />}
    </div>
  );
};

export default AdminUsersList;
