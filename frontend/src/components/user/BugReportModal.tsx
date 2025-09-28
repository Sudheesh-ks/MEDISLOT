import { useState } from 'react';
import { reportBugAPI } from '../../services/userProfileServices';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';
import { reportDoctorIssueAPI } from '../../services/doctorServices';

interface Props {
  token: string | null;
  isOpen: boolean;
  role: 'user' | 'doctor';
  onClose: () => void;
}

const ReportBugModal = ({ isOpen, role, onClose }: Props) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!subject || !description) return toast.error('Fill all fields');
    setLoading(true);

    try {
      let response;
      if (role === 'user') {
        response = await reportBugAPI({ subject, description });
      } else {
        response = await reportDoctorIssueAPI({ subject, description });
      }

      toast.success(response.message);
      setSubject('');
      setDescription('');
      onClose();
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-white mb-4">Report a Bug</h2>

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
        />
        <textarea
          placeholder="Describe the issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white min-h-[100px]"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportBugModal;
