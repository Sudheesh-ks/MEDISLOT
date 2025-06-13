import React from "react";
import { assets } from "../../assets/user/assets";
import { useNavigate } from "react-router-dom";

type ChatCardProps = {
  doctorId?: string;
};

const DocChatCard: React.FC<ChatCardProps> = ({ doctorId }) => {
  const navigate = useNavigate();

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Card Header with Image */}
      <div className="h-96 overflow-hidden">
        <img
          src={assets.contact_image}
          alt="card-image"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-blue-gray-900 font-medium text-lg">
            Start Messaging
          </h3>
          <span className="text-blue-gray-900 font-medium text-lg">
            <img className="h-10 w-10" src={assets.message_icon} alt="" />
          </span>
        </div>
        <p className="text-gray-600 text-sm font-normal opacity-75 leading-relaxed">
          You have some new messages from the doctor.
        </p>
      </div>

      {/* Card Footer */}
      <div className="px-6 pb-6 pt-0">
        <button
          onClick={() => navigate(`/doctor/chats`)}
          className="w-full bg-primary hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:scale-105 active:scale-100 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Message
        </button>
      </div>
    </div>
  );
};

export default DocChatCard;
