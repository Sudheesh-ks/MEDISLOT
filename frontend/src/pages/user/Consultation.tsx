import React from "react";
import VideoCallCard from "../../components/user/VideoCallCard";
import ChatCard from "../../components/user/ChatCard";
import { useParams } from "react-router-dom";

const Consultation = () => {
  const { doctorId } = useParams();

  return (
    <div className="flex place-items-center justify-center gap-6 p-8">
      <VideoCallCard />
      <ChatCard doctorId={doctorId} />
    </div>
  );
};

export default Consultation;
