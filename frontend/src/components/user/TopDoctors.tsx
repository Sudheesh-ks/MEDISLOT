import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import type { DoctorProfileType } from '../../types/doctor';

const TopDoctors = () => {
  const navigate = useNavigate();
  const context = useContext(UserContext);
  if (!context) throw new Error('TopDoctors must be used within an UserContextProvider');
  const { getDoctorsPaginated } = context;

  const [doctors, setDoctors] = useState<DoctorProfileType[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getDoctorsPaginated(1, 10);
        if (mounted) setDoctors(res.data);
      } catch (error) {
        console.log(error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getDoctorsPaginated]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-24 animate-fade">
      <h2 className="text-center text-4xl font-extrabold mb-12">Top Doctors</h2>

      <div className="grid gap-10 sm:gap-12 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {doctors
          .filter((d) => d.status === 'approved')
          .sort((a, b) => b.averageRating! - a.averageRating!)
          .slice(0, 9)
          .map((doc: DoctorProfileType) => (
            <div
              key={doc._id}
              onClick={() => {
                navigate(`/appointment/${doc._id}`);
                scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group bg-white/5 backdrop-blur rounded-3xl ring-1 ring-white/10 overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer"
            >
              <div className="h-80 bg-white/5 flex items-end justify-center overflow-hidden">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="h-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-6 space-y-2">
                <span
                  className={`inline-flex items-center gap-2 text-sm font-medium ${
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
                <h3 className="font-semibold text-lg text-white">{doc.name}</h3>
                <p className="text-sm text-slate-400">{doc.speciality}</p>
              </div>
            </div>
          ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => {
            navigate('/all-doctors');
            scrollTo({ top: 0, behavior: 'smooth' });
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
