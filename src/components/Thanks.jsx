'use client';
import Link from 'next/link';
import { useQuiz } from '@/context/QuizContext';

export default function Thanks() {
  const { participantId, reset } = useQuiz();

  return (
    <main className="screen thanks">
      <div className="atmosphere" aria-hidden="true" />
      <section className="center-panel">
        <p className="brand-mini">MELT</p>
        <h1>Thank you</h1>
        <p>
          Your answers, recommendations and feedback are saved for the pilot.
          {participantId ? (
            <>
              {' '}
              Reference: <strong>{participantId}</strong>
            </>
          ) : null}
        </p>
        <Link className="btn primary" href="/" onClick={reset}>
          Start another test
        </Link>
      </section>
    </main>
  );
}
