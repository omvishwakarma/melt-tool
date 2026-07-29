'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useQuiz } from '@/context/QuizContext';

export default function Welcome() {
  const router = useRouter();
  const { setParticipantId, reset } = useQuiz();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleStart(e) {
    e.preventDefault();
    setError('');
    if (!consent) {
      setError('Please agree to take part before continuing.');
      return;
    }
    setLoading(true);
    try {
      reset();
      const data = await api.startQuiz({ email, phone, consent: true });
      setParticipantId(data.participantId);
      router.push('/quiz');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen welcome">
      <div className="atmosphere" aria-hidden="true" />
      <section className="welcome-panel">
        <p className="eyebrow">Pilot validation tool</p>
        <h1 className="brand">MELT</h1>
        <p className="tagline">Connection should feel intentional, not instant.</p>
        <p className="lede">
          Answer 12 short questions. We will filter and score a curated catalogue, then show you
          three different ideas: Made for You, Easy Win, and Try Something New.
        </p>

        <form className="consent-form" onSubmit={handleStart}>
          <label>
            Email <span className="optional">(optional)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </label>
          <label>
            Phone <span className="optional">(optional)</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01X-XXXXXXX"
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              I consent to MELT saving my answers, recommendations and feedback for research and
              grant evidence.
            </span>
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Starting…' : 'Begin'}
          </button>
        </form>
      </section>
    </main>
  );
}
