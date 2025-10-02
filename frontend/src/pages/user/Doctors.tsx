import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import type { Doctor } from '../../assets/user/assets';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import StarRating from '../../components/common/StarRating';

const Doctors = () => {
  const navigate = useNavigate();
  const { speciality } = useParams();
  const context = useContext(UserContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showStarFilter, setShowStarFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortOrder, setSortOrder] = useState<string | null>(null);
  const [showSort, setShowSort] = useState(false);

  if (!context) throw new Error('Doctors must be used within an UserContextProvider');
  const { token, getDoctorsPaginated } = context;

  const itemsPerPage = 4;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token]);

  useEffect(() => {
    fetchDoctors();
  }, [currentPage, speciality, searchQuery, minRating, sortOrder]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await getDoctorsPaginated(
        currentPage,
        itemsPerPage,
        searchQuery,
        speciality,
        minRating,
        sortOrder!
      );
      setDoctors(res.data);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const specialities = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Gastroenterologist',
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20 md:py-24 text-slate-100 animate-fade">
      <p className="mb-6 sm:mb-8 text-slate-400 text-sm sm:text-base">
        Browse through the doctors specialist.
      </p>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar */}
        <aside className="md:w-56 space-y-4">
          {/* Toggle button for small screens */}
          <button
            className={`md:hidden w-full py-2 px-4 rounded-full ring-1 ring-white/20 text-sm ${
              showFilter ? 'bg-white/10' : ''
            }`}
            onClick={() => setShowFilter(!showFilter)}
          >
            {showFilter ? 'Hide Specialities' : 'Specialities'}
          </button>

          {/* Specialities */}
          <div
            className={`${showFilter ? 'flex' : 'hidden md:flex'} flex-col gap-3 transition-all`}
          >
            {specialities.map((spec) => (
              <button
                key={spec}
                onClick={() =>
                  speciality === spec ? navigate('/all-doctors') : navigate(`/all-doctors/${spec}`)
                }
                className={`text-left px-4 py-2 rounded-lg text-sm ring-1 ring-white/10 hover:bg-white/5 transition-colors ${
                  speciality === spec ? 'bg-cyan-500/20 text-white' : ''
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 space-y-8">
          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search Bar */}
            <div className="w-full sm:flex-1">
              <SearchBar placeholder="Search by name" onSearch={setSearchQuery} />
            </div>

            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => {
                  if (minRating > 0) {
                    setMinRating(0);
                  } else {
                    setShowStarFilter(!showStarFilter);
                  }
                }}
                className="flex w-full sm:w-auto items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-sm text-slate-300"
              >
                {minRating > 0 ? (
                  <>
                    ⭐ {minRating} Star
                    <span className="text-red-400 hover:text-white text-2xl sm:text-3xl leading-none">
                      &times;
                    </span>
                  </>
                ) : (
                  'Filter'
                )}
              </button>

              {showStarFilter && minRating === 0 && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg ring-1 ring-white/10 z-10">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        setMinRating(rating);
                        setShowStarFilter(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
                        minRating === rating ? 'bg-cyan-500/20 text-white' : 'text-slate-300'
                      }`}
                    >
                      ⭐ {rating}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex w-full sm:w-auto items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-sm text-slate-300"
              >
                {sortOrder ? (sortOrder === 'asc' ? 'Lowest Rating' : 'Highest Rating') : 'Sort'}
                {(sortOrder === 'asc' || sortOrder === 'desc') && (
                  <span
                    onClick={() => {
                      setSortOrder(null);
                      setShowSort(false);
                    }}
                    className="text-red-400 hover:text-white text-2xl sm:text-3xl leading-none"
                  >
                    &times;
                  </span>
                )}
              </button>

              {showSort && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg ring-1 ring-white/10 z-10">
                  <button
                    onClick={() => {
                      setSortOrder('desc');
                      setShowSort(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
                      sortOrder === 'desc' ? 'bg-cyan-500/20 text-white' : 'text-slate-300'
                    }`}
                  >
                    Highest Rating
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder('asc');
                      setShowSort(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
                      sortOrder === 'asc' ? 'bg-cyan-500/20 text-white' : 'text-slate-300'
                    }`}
                  >
                    Lowest Rating
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Doctors Grid Section */}
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : doctors.length ? (
            <>
              <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
                {doctors
                  .filter((doc) => doc.status === 'approved')
                  .map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => navigate(`/appointment/${doc._id}`)}
                      className="group cursor-pointer bg-white/5 backdrop-blur rounded-2xl sm:rounded-3xl ring-1 ring-white/10 overflow-hidden hover:-translate-y-1 transition-transform"
                    >
                      <div className="h-60 sm:h-72 flex items-end justify-center bg-white/5 overflow-hidden">
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="h-full object-contain object-bottom group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-4 sm:p-6 space-y-1 sm:space-y-2">
                        <span
                          className={`inline-flex items-center gap-2 text-xs font-medium ${
                            doc.available ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              doc.available ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          {doc.available ? 'Available' : 'Not Available'}
                        </span>
                        <h3 className="font-semibold text-base sm:text-lg text-white">
                          {doc.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400">{doc.speciality}</p>
                        <StarRating rating={doc.averageRating} />
                      </div>
                    </div>
                  ))}
              </div>

              {totalPages > 1 && (
                <div className="pt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-400 mt-10 text-center w-full text-sm sm:text-base">
              No doctors found.
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
export default Doctors;
