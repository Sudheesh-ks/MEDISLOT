import { assets } from "../../assets/user/assets";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();
  return (
    <section className="relative isolate overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/20 to-indigo-600/20" />

      <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 text-center md:text-left space-y-6 animate-fade">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Book Faster.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 through-fuchsia-500 to-indigo-600">
              Live Healthier
            </span>
          </h2>
          <p className="text-slate-300 max-w-md mx-auto md:mx-0">
            Join 100k+ users already enjoying hassle‑free appointments.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white px-10 py-3 rounded-full hover:-translate-y-0.5 transition-transform"
          >
            Create Account
          </button>
        </div>

        <div className="hidden md:block md:w-1/2 animate-fade">
          <img
            src={assets.appointment_img}
            alt="appointment"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;
