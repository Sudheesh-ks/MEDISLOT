import { assets } from "../../assets/user/assets";

const VideoCallCard = () => (
  <div className="flex flex-col bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl overflow-hidden h-full">
    {/* Header image */}
    <div className="h-72 overflow-hidden">
      <img
        src={assets.about_image}
        alt="Video cover"
        className="w-full h-full object-cover"
      />
    </div>

    {/* Body */}
    <div className="p-6 flex-1 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
          Start Consultation
          <img src={assets.videocall_icon} alt="video" className="h-5 w-5" />
        </h3>
        <p className="text-sm text-slate-400">No consultation available now.</p>
      </div>

      <button className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white py-3 rounded-full hover:-translate-y-0.5 transition-transform">
        Join Now
      </button>
    </div>
  </div>
);

export default VideoCallCard;
