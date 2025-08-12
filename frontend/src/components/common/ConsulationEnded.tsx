import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitFeedbackAPI } from '../../services/appointmentServices';
import { toast } from 'react-toastify';
import { submitPrescriptionAPI } from '../../services/doctorServices';

interface ConsultationEndedCardProps {
  role: 'user' | 'doctor';
  appointmentId: string;
}

const ConsultationEndedCard = ({ role, appointmentId }: ConsultationEndedCardProps) => {
  const [feedback, setFeedback] = useState('');
  const [prescription, setPrescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (role === 'user') {
      if (!feedback.trim()) return;
      try {
        console.log(appointmentId);
        const { data } = await submitFeedbackAPI(appointmentId, feedback);
        if (data.success) {
          toast.success(data.message);
          setFeedback('');
          setSubmitted(true);
        }
      } catch (err) {
        console.error('Error submitting feedback', err);
      }
    } else {
      if (!prescription.trim()) return;
      try {
        console.log(appointmentId);
        const { data } = await submitPrescriptionAPI(appointmentId, prescription);
        if (data.success) {
          toast.success('Prescription saved successfully');
          setPrescription('');
          setSubmitted(true);
        }
      } catch (err) {
        console.error('Error submitting prescription', err);
      }
    }
  };

  const handleGoBack = () => {
    if (role === 'user') {
      navigate('/home');
    } else {
      navigate('/doctor/dashboard');
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-10 py-24 text-slate-100 animate-fade">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
        CONSULTATION{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-600">
          ENDED
        </span>
      </h1>

      <section className="bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl p-10">
        {role === 'user' && (
          <div className="max-w-2xl mx-auto">
            <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 text-center">
              Hope this consultation was valuable. Kindly provide your feedback about this session.
            </p>
            <label className="block text-slate-300 text-sm mb-2">Leave your feedback</label>
            <textarea
              rows={5}
              placeholder="Enter your feedback here..."
              className="w-full p-4 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-green-500"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={submitted}
            />
            <button
              className={`mt-4 w-full ${
                submitted ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              } text-white py-3 rounded-full transition`}
              disabled={submitted || !feedback.trim()}
              onClick={handleSubmit}
            >
              {submitted ? 'Feedback Submitted' : 'Submit Feedback'}
            </button>
          </div>
        )}

        {role === 'doctor' && (
          <div className="max-w-2xl mx-auto">
            <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 text-center">
              Hope you had a productive session. Kindly provide the prescription for your patient.
            </p>
            <label className="block text-slate-300 text-sm mb-2">Add Prescription</label>
            <textarea
              rows={6}
              placeholder="Enter prescription details here..."
              className="w-full p-4 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              disabled={submitted}
            />
            <button
              className={`mt-4 w-full ${
                submitted ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              } text-white py-3 rounded-full transition`}
              disabled={submitted || !prescription.trim()}
              onClick={handleSubmit}
            >
              {submitted ? 'Prescription Submitted' : 'Submit Prescription'}
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition"
          >
            {role === 'user' ? 'Go to Home' : 'Go to Dashboard'}
          </button>
        </div>
      </section>
    </main>
  );
};

export default ConsultationEndedCard;
