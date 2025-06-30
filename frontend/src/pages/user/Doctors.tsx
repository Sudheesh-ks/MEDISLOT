import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import type { Doctor } from "../../assets/user/assets";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";

const Doctors = () => {
  const nav = useNavigate();
  const { speciality } = useParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);

  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("Doctors must be used within an AppContextProvider");
  const { getDoctorsPaginated } = ctx;

  const itemsPerPage = 6;

  useEffect(() => {
    fetchDoctors();
  }, [currentPage, speciality]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await getDoctorsPaginated(currentPage, itemsPerPage);
      setDoctors(res.data);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  /** filter logic */
  useEffect(() => {
    let list = speciality ? doctors.filter((d) => d.speciality === speciality) : doctors;
    if (searchQuery.trim()) list = list.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setFiltered(list);
  }, [doctors, speciality, searchQuery]);

  const specialities = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Gastroenterologist",
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-10 py-24 text-slate-100 animate-fade">
      <p className="mb-8 text-slate-400">Browse through the doctors specialist.</p>

      <div className="flex flex-col sm:flex-row gap-8">
        {/* Filters */}
        <aside className="sm:w-56 space-y-4">
          <button
            className={`sm:hidden py-1.5 px-4 rounded-full ring-1 ring-white/20 text-sm ${showFilter ? "bg-white/10" : ""}`}
            onClick={() => setShowFilter(!showFilter)}
          >
            {showFilter ? "Hide Filters" : "Filters"}
          </button>

          <div className={`${showFilter ? "flex" : "hidden sm:flex"} flex-col gap-3`}>
            {specialities.map((spec) => (
              <button
                key={spec}
                onClick={() => (speciality === spec ? nav("/doctors") : nav(`/doctors/${spec}`))}
                className={`text-left px-4 py-2 rounded-lg text-sm ring-1 ring-white/10 hover:bg-white/5 transition-colors ${speciality === spec ? "bg-cyan-500/20 text-white" : ""}`}
              >
                {spec}
              </button>
            ))}
          </div>
        </aside>

        {/* Result list */}
        <section className="flex-1 space-y-8">
          <SearchBar placeholder="Search by name" onSearch={setSearchQuery} />

          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : filtered.filter((d) => d.status === "approved").length ? (
            <>
              <div className="grid gap-10 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
                {filtered
                  .filter((d) => d.status === "approved")
                  .map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => nav(`/appointment/${doc._id}`)}
                      className="group cursor-pointer bg-white/5 backdrop-blur rounded-3xl ring-1 ring-white/10 overflow-hidden hover:-translate-y-1 transition-transform"
                    >
                      <div className="h-72 flex items-end justify-center bg-white/5 overflow-hidden">
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="h-full object-contain object-bottom group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-6 space-y-2">
                        <span
                          className={`inline-flex items-center gap-2 text-xs font-medium ${
                            doc.available ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              doc.available ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          />
                          {doc.available ? "Available" : "Not Available"}
                        </span>
                        <h3 className="font-semibold text-lg text-white">{doc.name}</h3>
                        <p className="text-sm text-slate-400">{doc.speciality}</p>
                      </div>
                    </div>
                  ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="text-slate-400 mt-10 text-center w-full">No doctors found.</div>
          )}
        </section>
      </div>
    </main>
  );
};
export default Doctors;