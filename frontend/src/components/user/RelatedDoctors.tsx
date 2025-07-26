import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import type { Doctor } from "../../assets/user/assets";

interface RelatedDoctorsProps {
  docId?: string;
  speciality?: string;
}

const RelatedDoctors = ({ docId, speciality }: RelatedDoctorsProps) => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("RelatedDoctors must be used within an AppContextProvider");
  const { getDoctorsPaginated } = context;

  const navigate = useNavigate();
  const [relDoc, setRelDoc] = useState<Doctor[]>([]);

  useEffect(() => {
    (async () => {
      if (speciality) {
        const res = await getDoctorsPaginated(1, 20);
        const data = res.data.filter(
          (d: any) => d.speciality === speciality && d._id !== docId
        );
        setRelDoc(data);
      }
    })();
  }, [getDoctorsPaginated, speciality, docId]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-24 animate-fade">
      <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-10">
        Related Doctors
      </h2>
      <p className="text-center text-slate-400 mb-10">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="grid gap-10 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {relDoc
          .filter((d) => d.status === "approved")
          .slice(0, 5)
          .map((doc) => (
            <div
              key={doc._id}
              onClick={() => {
                navigate(`/appointment/${doc._id}`);
                scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group bg-white/5 backdrop-blur rounded-3xl ring-1 ring-white/10 overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer"
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

      <div className="flex justify-center">
        <button
          onClick={() => {
            navigate("/doctors");
            scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="mt-14 bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white px-10 py-3 rounded-full hover:-translate-y-0.5 transition-transform"
        >
          More Doctors
        </button>
      </div>
    </section>
  );
};

export default RelatedDoctors;
