import { useParams } from "react-router-dom";
import DocVideoCallCard from "../../components/doctor/DocVideoCallCard";
import DocChatCard from "../../components/doctor/DocChatCard";

const DoctorConsultation = () => {
  // const { doctorId } = useParams();

  return (
    <div className="flex place-items-center justify-center gap-6 p-8">
      <DocVideoCallCard />
      <DocChatCard />
    </div>
  );
};

export default DoctorConsultation;
