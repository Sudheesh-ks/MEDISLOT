import type React from 'react';
import { assets } from '../../assets/user/assets';
import { useNavigate } from 'react-router-dom';

type Props = { userId?: string; appointmentId?: string };

const PatientHistoryCard: React.FC<Props> = ({ userId, appointmentId }) => {
  const nav = useNavigate();

  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';

  return (
    <div className={`w-96 ${glass} rounded-3xl overflow-hidden`}>
      {/* header image */}
      <div className="h-96 overflow-hidden">
        <img src={assets.patient_history} className="w-full h-full object-cover" />
      </div>
      <div className="p-6 space-y-2">
        <h3 className="text-lg font-semibold">Patient History</h3>
        <p className="text-slate-400 text-sm">View previous reports and add new session notes.</p>
      </div>
      <div className="px-6 pb-6 pt-0">
        <button
          onClick={() => nav(`/doctor/patient-history/${userId}/${appointmentId}`)}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 py-3 rounded-lg font-medium hover:-translate-y-0.5 transition-transform shadow-lg"
        >
          View History
        </button>
      </div>
    </div>
  );
};

export default PatientHistoryCard;
