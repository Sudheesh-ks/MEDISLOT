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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center gap-8 p-8 relative">
      {/* Info Icon */}
      <button
        onClick={openSummary}
        className="absolute top-6 right-6 text-blue-400 hover:text-blue-300"
        title="View Patient Concerns"
      >
        <Info size={28} />
      </button>

      <DocVideoCallCard appointmentId={appointmentId} />
      <DocChatCard userId={userId} />
      <PatientHistoryCard userId={userId} appointmentId={appointmentId} />

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
