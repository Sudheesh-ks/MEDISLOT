// src/pages/admin/AdminDoctorRequests.tsx
import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";

const AdminDoctorRequests = () => {
  const nav = useNavigate();
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("AdminContext missing");

  const { aToken, getDoctorsPaginated, approveDoctor, rejectDoctor } = ctx;

  /* ───────── local state ───────── */
  const [page,   setPage]   = useState(1);
  const [rows,   setRows]   = useState<any[]>([]);
  const [pages,  setPages]  = useState(1);
  const [count,  setCount]  = useState(0);
  const [load,   setLoad]   = useState(false);
  const [query,  setQuery]  = useState("");
  const perPage = 6;

  /* ───────── effects ───────── */
  useEffect(() => {
    if (aToken) fetchRows();
  }, [aToken, page]);

  useEffect(() => {
    if (!aToken) nav("/admin/login");
  }, [aToken]);

  useEffect(() => window.scrollTo({ top: 0, behavior: "smooth" }), [page]);

  /* ───────── fetch ───────── */
  const fetchRows = async () => {
    try {
      setLoad(true);
      const r = await getDoctorsPaginated(page, perPage);
      setRows(r.data);
      setPages(r.totalPages);
      setCount(r.totalCount);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    } finally {
      setLoad(false);
    }
  };

  /* ───────── handlers ───────── */
  const doApprove = async (id: string) => {
    await approveDoctor(id);
    fetchRows();
  };
  const doReject = async (id: string) => {
    await rejectDoctor(id);
    fetchRows();
  };

  /* ───────── filtered list ───────── */
  const pending = rows
    .filter((d) => d.status === "pending")
    .filter(
      (d) =>
        d.name?.toLowerCase().includes(query.toLowerCase()) ||
        d.speciality?.toLowerCase().includes(query.toLowerCase())
    );

  /* ───────── styles ───────── */
  const glass = "bg-white/5 backdrop-blur ring-1 ring-white/10";
  const pill  = "text-xs font-medium px-4 py-1.5 rounded-md shadow-lg hover:-translate-y-0.5 hover:scale-105 transition-all duration-300";

  /* ───────── render ───────── */
  return (
    <div className="m-5 text-slate-100 max-h-[90vh] overflow-y-auto">
      <h1 className="text-lg font-medium mb-4">Doctor Requests</h1>

      {/* search */}
      <div className="mb-6 max-w-sm">
        <SearchBar
          placeholder="Search by name or speciality"
          onSearch={setQuery}
        />
      </div>

      {/* list */}
      {load ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          Loading doctor requests…
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
                <img
                  src={doc.image}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 space-y-1">
                  <p className="text-base font-semibold truncate">{doc.name}</p>
                  <p className="text-sm text-slate-400 truncate">
                    {doc.speciality}
                  </p>

                  {/* buttons */}
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => doApprove(doc._id)}
                      className={`${pill} bg-gradient-to-r from-emerald-500 to-emerald-600 text-white`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => doReject(doc._id)}
                      className={`${pill} bg-gradient-to-r from-red-500 to-red-600 text-white`}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* pagination */}
          {pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pages}
              onPageChange={setPage}
            />
          )}
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
