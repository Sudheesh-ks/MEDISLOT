import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Info } from 'lucide-react';
import DocVideoCallCard from '../../components/doctor/DocVideoCallCard';
import DocChatCard from '../../components/doctor/DocChatCard';
import PatientHistoryCard from '../../components/doctor/PatientHistoryCard';
import { getChatSummaryAPI } from '../../services/aiChatService';
import ChatBotSummaryModal from '../../components/doctor/ChatBotSummaryModal';

const DoctorConsultation = () => {
  const { userId, appointmentId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState<string>('Loading...');
  const [loading, setLoading] = useState(false);

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
        {loading ? <p className="text-slate-400">Loading patient concerns...</p> : <p>{summary}</p>}
      </ChatBotSummaryModal>
    </div>
  );
};

export default DoctorConsultation;
