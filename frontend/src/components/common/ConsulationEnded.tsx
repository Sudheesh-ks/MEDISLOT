import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitFeedbackAPI } from '../../services/appointmentServices';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';

interface ConsultationEndedCardProps {
  role: 'user' | 'doctor';
  appointmentId: string;
}

const ConsultationEndedCard = ({ role, appointmentId }: ConsultationEndedCardProps) => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (role === 'user') {
      if (!feedback.trim()) return;
      try {
        console.log(appointmentId);
        const { data } = await submitFeedbackAPI(appointmentId, feedback, rating);
        if (data.success) {
          toast.success(data.message);
          setFeedback('');
          setSubmitted(true);
        }
      } catch (err) {
        console.error('Error submitting feedback', err);
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
    <main className="max-w-4xl mx-auto px-4 md:px-10 py-16 md:py-24 text-slate-100 animate-fade">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-8 md:mb-12">
        CONSULTATION{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
          ENDED
        </span>
      </h1>

      <section className="bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl p-6 sm:p-8 md:p-10">
        {role === 'user' && (
          <div className="max-w-lg mx-auto">
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 md:mb-8 text-center">
              Hope this consultation was valuable. Kindly provide your feedback about this session.
            </p>

            <label className="block text-slate-300 text-sm mb-2 text-center">
              Leave your feedback
            </label>
            <div className="flex gap-2 my-4 justify-center flex-wrap">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={24}
                  className={
                    star <= rating
                      ? 'text-yellow-400 cursor-pointer'
                      : 'text-gray-500 cursor-pointer'
                  }
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            <textarea
              rows={5}
              placeholder="Enter your feedback here..."
              className="w-full p-3 sm:p-4 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
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
          <div className="max-w-lg mx-auto text-center text-slate-300 text-sm sm:text-base md:text-lg">
            <p>The consultation has ended. Hope it was a productive one.</p>
          </div>
        )}

        <div className="mt-6 md:mt-8 flex justify-center">
          <button
            onClick={handleGoBack}
            className="px-5 sm:px-6 py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition text-sm sm:text-base"
          >
            {role === 'user' ? 'Go to Home' : 'Go to Dashboard'}
          </button>
        </div>
      </section>
    </main>
  );
};

export default ConsultationEndedCard;
