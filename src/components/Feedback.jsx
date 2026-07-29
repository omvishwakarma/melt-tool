'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { feedbackQuestions } from '@/data/questions';
import { useQuiz } from '@/context/QuizContext';

export default function Feedback() {
  const router = useRouter();
  const { participantId } = useQuiz();
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState({
    favourite: '',
    relevance: '',
    bookingIntent: '',
    searchComparison: '',
    improvement: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const q = feedbackQuestions[step];

  useEffect(() => {
    if (!participantId) router.replace('/');
  }, [participantId, router]);

  if (!participantId) return null;

  async function handleNext() {
    setError('');
    const value = feedback[q.id];
    if (q.type !== 'text' && !value) {
      setError('Please choose an answer.');
      return;
    }

    if (step < feedbackQuestions.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);
    try {
      await api.submitFeedback(participantId, feedback);
      router.push('/thanks');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen quiz">
      <div className="quiz-top">
        <div className="brand-mini">MELT</div>
        <div className="progress-meta">
          <span>
            {q.code} · Feedback {step + 1} of {feedbackQuestions.length}
          </span>
        </div>
      </div>

      <section className="question-panel">
        <h1>{q.text}</h1>

        {q.type === 'text' ? (
          <textarea
            className="feedback-text"
            rows={5}
            value={feedback.improvement}
            onChange={(e) => setFeedback((prev) => ({ ...prev, improvement: e.target.value }))}
            placeholder="Share anything that would improve the suggestions"
          />
        ) : (
          <div className="options">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`option ${feedback[q.id] === opt.value ? 'selected' : ''}`}
                onClick={() => setFeedback((prev) => ({ ...prev, [q.id]: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {error ? <p className="error">{error}</p> : null}

        <div className="nav-row">
          <button
            type="button"
            className="btn ghost"
            disabled={step === 0 || loading}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </button>
          <button type="button" className="btn primary" onClick={handleNext} disabled={loading}>
            {step === feedbackQuestions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </section>
    </main>
  );
}
