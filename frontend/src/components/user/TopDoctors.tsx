import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import type { Doctor } from "../../assets/user/assets";

const TopDoctors = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  if (!context) throw new Error("TopDoctors must be used within an AppContextProvider");
  const { doctors, getDoctorsData } = context;

  useEffect(() => {
    getDoctorsData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Portrait fix ✅
     --------------------------------------------------
     • Wrapper height fixed (h-80) instead of aspect‑ratio to favour vertical human PNGs.
     • Flex + object-contain keeps full figure visible & centred.
  */

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-24 animate-fade">
      <h2 className="text-center text-4xl font-extrabold mb-12">Top Doctors</h2>

      <div className="grid gap-10 sm:gap-12 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {doctors
          .filter((d) => d.status === "approved")
          .slice(0, 10)
          .map((doc: Doctor) => (
            <div
              key={doc._id}
              onClick={() => {
                navigate(`/appointment/${doc._id}`);
                scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group bg-white/5 backdrop-blur rounded-3xl ring-1 ring-white/10 overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer"
            >
              {/* IMAGE WRAPPER */}
              <div className="h-80 bg-white/5 flex items-end justify-center overflow-hidden">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="h-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-6 space-y-2">
                <span className={`inline-flex items-center gap-2 text-sm font-medium ${doc.available ? "text-emerald-400" : "text-rose-400"}`}> 
                  <span className={`inline-block w-2 h-2 rounded-full ${doc.available ? "bg-emerald-400" : "bg-rose-400"}`} />
                  {doc.available ? "Available" : "Not Available"}
                </span>
                <h3 className="font-semibold text-lg text-white">{doc.name}</h3>
                <p className="text-sm text-slate-400">{doc.speciality}</p>
              </div>
            </div>
          ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => {
            navigate("/doctors");
            scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="mt-16 bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white px-10 py-3 rounded-full hover:-translate-y-0.5 transition-transform"
        >
          View All Doctors
        </button>
      </div>
    </section>
  );
};

export default TopDoctors;
