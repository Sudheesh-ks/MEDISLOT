import { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';

const AdminDoctorList = () => {
  const navigate = useNavigate();
  const adminContext = useContext(AdminContext);
  if (!adminContext) throw new Error('AdminContext missing');

  const { aToken, getDoctorsPaginated } = adminContext;

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const perPage = 14;

  useEffect(() => {
    if (aToken) fetchRows();
  }, [aToken, page, search]);

  useEffect(() => {
    if (!aToken) navigate('/admin/login');
  }, [aToken]);

  useEffect(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [page]);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const r = await getDoctorsPaginated(page, perPage, search);
      setRows(r.data);
      setPages(r.totalPages);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = rows
    .filter((d) => d.status === 'approved')
    .filter(
      (d) =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.speciality?.toLowerCase().includes(search.toLowerCase())
    );

  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
  const card =
    'max-w-56 overflow-hidden cursor-pointer group transition-transform hover:-translate-y-1';

  return (
    <div className="m-5 text-slate-100 max-h-[90vh] overflow-y-auto">
      <h1 className="text-lg font-medium mb-4">👨‍⚕️ All Doctors</h1>

      {/* search */}
      <div className="mb-6 max-w-sm">
        <SearchBar placeholder="Search by name or speciality" onSearch={setSearch} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : filtered.length ? (
        <>
          <div className="w-full flex flex-wrap gap-6">
            {filtered.map((doc, i) => (
              <motion.div
                key={i}
                className={`${glass} ${card} rounded-2xl ring-white/10`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={doc.image}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-4 space-y-1">
                  <p className="text-base font-semibold truncate">{doc.name}</p>
                  <p className="text-sm text-slate-400 truncate">{doc.speciality}</p>

                  {doc.available ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-red-400">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />
                      Not&nbsp;Available
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* pagination */}
          {pages > 1 && <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />}
        </>
      ) : (
        <div className="text-center py-10 text-slate-400 text-sm">No matching doctors found.</div>
      )}
    </div>
  );
};

export default AdminDoctorList;
