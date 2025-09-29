import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import DocVideoCallCard from '../../components/doctor/DocVideoCallCard';
import DocChatCard from '../../components/doctor/DocChatCard';
import PatientHistoryCard from '../../components/doctor/PatientHistoryCard';
import { getChatSummaryAPI } from '../../services/aiChatService';
import ChatBotSummaryModal from '../../components/doctor/ChatBotSummaryModal';
import { DoctorContext } from '../../context/DoctorContext';

const DoctorConsultation = () => {
  const navigate = useNavigate();

  const { userId, appointmentId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState<string>('Loading...');
  const [loading, setLoading] = useState(false);

  const { dToken } = useContext(DoctorContext);

  useEffect(() => {
    if (!dToken) navigate('/doctor/login');
  }, [dToken]);

  const openSummary = async () => {
    if (!userId) return;
    setIsModalOpen(true);
    setLoading(true);
    try {
      const data = await getChatSummaryAPI(userId);
      setSummary(data.summary || 'No chat history available.');
    } catch (err) {
      console.error('Failed to fetch chat summary:', err);
      setSummary('⚠️ Unable to fetch summary. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 relative">
      {/* Info Icon */}
      <button
        onClick={openSummary}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-blue-400 hover:text-blue-300 z-50"
        title="View Patient Concerns"
      >
        <Info size={24} className="sm:w-7 sm:h-7" />
      </button>

      {/* Cards Section */}
      <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-6 lg:gap-8 w-full max-w-7xl mt-12 sm:mt-14 lg:mt-0">
        <div className="flex-1 min-w-[280px]">
          <DocVideoCallCard appointmentId={appointmentId} />
        </div>
        <div className="flex-1 min-w-[280px]">
          <DocChatCard userId={userId} />
        </div>
        <div className="flex-1 min-w-[280px]">
          <PatientHistoryCard userId={userId} appointmentId={appointmentId} />
        </div>
      </div>

      {/* Modal */}
      <ChatBotSummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="📝 Patient Concerns"
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <p>{summary}</p>
        )}
      </ChatBotSummaryModal>
    </div>
  );
};

export default DoctorConsultation;
