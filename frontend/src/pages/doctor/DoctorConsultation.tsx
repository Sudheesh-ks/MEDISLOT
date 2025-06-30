import { useParams } from "react-router-dom";
import DocVideoCallCard from "../../components/doctor/DocVideoCallCard";
import DocChatCard from "../../components/doctor/DocChatCard";

const DoctorConsultation = () => {
  const { userId } = useParams();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center gap-8 p-8">
      <DocVideoCallCard />
      <DocChatCard userId={userId} />
    </div>
  );
};
export default DoctorConsultation;