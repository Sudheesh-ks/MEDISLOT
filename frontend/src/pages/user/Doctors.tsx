import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import type { Doctor } from "../../assets/user/assets";

// Dummy SearchBar component - replace with your own if you have one
const SearchBar = ({
  placeholder,
  onSearch,
}: {
  placeholder: string;
  onSearch: (query: string) => void;
}) => {
  const [query, setQuery] = useState("");
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        onSearch(e.target.value);
      }}
    />
  );
};

const Doctors = () => {
  const navigate = useNavigate();
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("TopDoctors must be used within an AppContextProvider");
  }

  const { doctors, getDoctorsData } = context;

  const applyFilter = () => {
    let filtered = speciality
      ? doctors.filter((doc) => doc.speciality === speciality)
      : doctors;

    if (searchQuery.trim()) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilterDoc(filtered);
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, searchQuery]);

  return (
    <div>
      <p className="text-gray-600">Browse through the doctors specialist.</p>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <button
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${
            showFilter ? "bg-primary text-white" : ""
          }`}
          onClick={() => setShowFilter((prev) => !prev)}
        >
          Filters
        </button>
        <div
          className={`flex-col gap-4 text-sm text-gray-600 ${
            showFilter ? "flex" : "hidden sm:flex"
          }`}
        >
          {[
            "General physician",
            "Gynecologist",
            "Dermatologist",
            "Pediatrician",
            "Neurologist",
            "Gastroenterologist",
          ].map((spec) => (
            <p
              key={spec}
              onClick={() =>
                speciality === spec
                  ? navigate("/doctors")
                  : navigate(`/doctors/${spec}`)
              }
              className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
                speciality === spec ? "bg-indigo-100 text-black" : ""
              }`}
            >
              {spec}
            </p>
          ))}
        </div>

        {/* Right side: Search bar + doctor cards */}
        <div className="w-full flex flex-col gap-4">
          {/* Search bar */}
          <div className="mb-4 w-80">
        <SearchBar
          placeholder="Search by name or email"
          onSearch={(query) => {
            setSearchQuery(query);
          }}
        />
      </div>

          {/* Doctor cards */}
          <div className="grid grid-cols-auto gap-4 gap-y-6">
            {filterDoc
              .filter((doctor) => doctor.status === "approved")
              .map((item: Doctor, index: number) => (
                <div
                  onClick={() => navigate(`/appointment/${item._id}`)}
                  className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
                  key={index}
                >
                  <img className="bg-blue-50" src={item.image} alt="" />
                  <div className="p-4">
                    {item.available ? (
                      <div className="flex items-center gap-2 text-sm text-green-500">
                        <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                        <p>Available</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <p className="w-2 h-2 bg-red-500 rounded-full"></p>
                        <p>Not Available</p>
                      </div>
                    )}

                    <p className="text-gray-900 text-lg font-medium">
                      {item.name}
                    </p>
                    <p className="text-gray-600 text-sm">{item.speciality}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
