import { specialityData } from '../../assets/user/assets';
import { Link } from 'react-router-dom';

const SpecialityMenu = () => (
  <section id="speciality" className="max-w-7xl mx-auto px-4 md:px-10 py-24 animate-fade">
    <h2 className="text-center text-4xl font-extrabold mb-12">Find by Speciality</h2>

    <div className="flex gap-8 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
      {specialityData.map((item, idx) => (
        <Link
          key={idx}
          to={`/all-doctors/${item.speciality}`}
          onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
          className="snap-start shrink-0 w-36 md:w-44 flex flex-col items-center gap-4 group"
        >
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/5 backdrop-blur ring-1 ring-white/10 flex items-center justify-center group-hover:-translate-y-1 transition-transform">
            <img src={item.image} alt={item.speciality} className="w-12 md:w-14" />
          </div>
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
            {item.speciality}
          </span>
        </Link>
      ))}
    </div>
  </section>
);

export default SpecialityMenu;
