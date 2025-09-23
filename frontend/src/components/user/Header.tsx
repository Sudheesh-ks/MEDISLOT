import { assets } from '../../assets/user/assets';

const Header = () => {
  return (
    <section className="relative isolate overflow-hidden pt-28 pb-32 px-4 md:px-10">
      <svg
        className="absolute -z-10 right-0 top-0 h-[140%] w-1/2 opacity-25 fill-cyan-400 blur-3xl"
        viewBox="0 0 500 500"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d="M437,34Q393,118,437,202Q481,286,417,346Q353,406,271,429Q189,452,124,404Q59,356,39,271Q19,186,60,112Q101,38,186,17Q271,-4,351,14Q431,32,437,34Z" />
      </svg>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center animate-fade">
        <div className="space-y-8 text-center md:text-left">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight text-white">
            Cure Health Issues,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
              With Trusted Doctors
            </span>
          </h1>
          <p className="text-slate-400 max-w-md mx-auto md:mx-0 leading-relaxed">
            Simply browse through our extensive list of trusted doctors,{' '}
            <br className="hidden sm:block" />
            schedule your appointment hassle-free.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <button
              onClick={() =>
                document.getElementById('speciality')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg hover:-translate-y-0.5 transition-transform"
            >
              Browse Specialities
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-[4/3] md:aspect-square rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-lg">
          <img
            src={assets.header_img}
            alt="hero doctor"
            className="absolute inset-0 w-full h-full object-cover object-center scale-[1.05] hover:scale-[1.1] transition-transform duration-[4000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          />
        </div>
      </div>
    </section>
  );
};

export default Header;
