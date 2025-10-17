import { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';

const AdminDoctorRequests = () => {
  const navigate = useNavigate();
  const adminContext = useContext(AdminContext);
  if (!adminContext) throw new Error('AdminContext missing');

  const { aToken, getDoctorsPaginated } = adminContext;

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const perPage = 10;

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

  const pending = rows.filter((d) => d.status === 'pending');

  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
  const pill =
    'text-xs font-medium px-4 py-1.5 rounded-md shadow-lg hover:-translate-y-0.5 hover:scale-105 transition-all duration-300';

  return (
    <div className="m-5 text-slate-100 max-h-[90vh] overflow-y-auto">
      <h1 className="text-lg font-medium mb-4">Doctor Requests</h1>

      <div className="mb-6 max-w-sm">
        <SearchBar placeholder="Search by name or speciality" onSearch={setSearch} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : pending.length ? (
        <>
          <div className="w-full flex flex-wrap gap-6">
            {pending.map((doc, i) => (
              <motion.div
                key={i}
                className={`${glass} max-w-56 rounded-2xl overflow-hidden transition-transform hover:-translate-y-1`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
              >
                <img src={doc.image} className="w-full h-40 object-cover" />
                <div className="p-4 space-y-1">
                  <p className="text-base font-semibold truncate">{doc.name}</p>
                  <p className="text-sm text-slate-400 truncate">{doc.speciality}</p>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => navigate(`/admin/doctors/requests/${doc._id}`)}
                      className={`${pill} bg-sky-500 text-white`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {pages > 1 && <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />}
        </>
      ) : (
        <div className="text-center py-10 text-slate-400 text-sm">
          No matching doctor requests found.
        </div>
      )}
    </div>
  );
};

export default AdminDoctorRequests;
