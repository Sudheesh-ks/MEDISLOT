import { assets } from "../../assets/user/assets";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <section className="relative isolate overflow-hidden pt-28 pb-32 px-4 md:px-10">
      {/* blob */}
      <svg
        className="absolute -z-10 right-0 top-0 h-[140%] w-1/2 opacity-25 fill-cyan-400 blur-3xl"
        viewBox="0 0 500 500"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d="M437,34Q393,118,437,202Q481,286,417,346Q353,406,271,429Q189,452,124,404Q59,356,39,271Q19,186,60,112Q101,38,186,17Q271,-4,351,14Q431,32,437,34Z" />
      </svg>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center animate-fade">
        {/* copy */}
        <div className="space-y-8 text-center md:text-left">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight text-white">
            Cure Health Issues, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-600">With Trusted Doctors</span>
          </h1>
          <p className="text-slate-400 max-w-md mx-auto md:mx-0 leading-relaxed">
            Simply browse through our extensive list of trusted doctors,{" "}
            <br className="hidden sm:block" />
            schedule your appointment hassle-free.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <button
              onClick={() => document.getElementById("speciality")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg hover:-translate-y-0.5 transition-transform"
            >
              Browse Specialities
            </button>
            {/* <button
              onClick={() => document.getElementById("speciality")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center ring-1 ring-white/20 px-6 py-3 rounded-full text-sm hover:bg-white/10 transition-colors"
            >
              Browse Specialities
            </button> */}
            {/* <div className="md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]">
        <p className="text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight">
          Cure Health Issues, <br />
          With Trusted Doctors
        </p>
        <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm fort-light">
          <img className="w-28" src={assets.group_profiles} alt="" />
          <p>
            Simply browse through our extensive list of trusted doctors,{" "}
            <br className="hidden sm:block" />
            schedule your appointment hassle-free.
          </p>
        </div>
        <a
          href="#speciality"
          className="flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300"
        >
          Book appointment{" "}
          <img className="w-3" src={assets.arrow_icon} alt="" />
        </a>
      </div> */}
          </div>
        </div>

        {/* hero image */}
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