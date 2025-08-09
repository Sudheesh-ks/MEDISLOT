import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ConsultationEndedPageProps {
  role: 'user' | 'doctor';
}

const ConsultationEndedCard = ({ role }: ConsultationEndedPageProps) => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  //   const { appointmentId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    try {
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback', err);
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
        <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 text-center">
          Thank you for attending the session. We hope it was helpful. You may now close this page
          or continue browsing.
        </p>

        {role === 'user' && (
          <div className="max-w-2xl mx-auto">
            <label className="block text-slate-300 text-sm mb-2">Leave your feedback</label>
            <textarea
              rows={5}
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
