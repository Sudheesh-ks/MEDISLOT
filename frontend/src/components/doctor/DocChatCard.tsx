import { assets } from "../../assets/user/assets";
import { useNavigate } from "react-router-dom";

type Props = { userId?: string };
const DocChatCard: React.FC<Props> = ({ userId }) => {
  const nav = useNavigate();
  const glass = "bg-white/5 backdrop-blur ring-1 ring-white/10";
  const btn   = "w-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 py-3 rounded-lg font-medium hover:-translate-y-0.5 transition-transform shadow-lg";
  return (
    <div className={`w-96 ${glass} rounded-3xl overflow-hidden`}>
      {/* header image */}
      <div className="h-96 overflow-hidden">
        <img src={assets.contact_image} className="w-full h-full object-cover" />
      </div>
      <div className="p-6 space-y-2">
        <h3 className="text-lg font-semibold">Start Messaging</h3>
        <p className="text-slate-400 text-sm">Chat with the patient in real‑time.</p>
      </div>
      <div className="px-6 pb-6 pt-0">
        <button onClick={() => nav(`/doctor/chats/${userId}`)} className={btn}>
          Message
        </button>
      </div>
    </div>
  );
};
export default DocChatCard;