'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { laneMeta } from '@/data/questions';
import { useQuiz } from '@/context/QuizContext';

function laneScore(result) {
  if (!result?.scores) return null;
  if (result.lane === 'made_for_you') return result.scores.madeForYou;
  if (result.lane === 'easy_win') return result.scores.easyWin;
  return result.scores.trySomethingNew;
}

export default function Results() {
  const router = useRouter();
  const { participantId, results, meta } = useQuiz();

  useEffect(() => {
    if (!participantId) router.replace('/');
  }, [participantId, router]);

  if (!participantId) return null;

  return (
    <main className="screen results">
      <header className="results-header">
        <p className="brand-mini">MELT</p>
        <h1>Your three ideas</h1>
        <p className="lede">
          Each result passed every hard filter first. Scores only ranked what was already suitable.
        </p>
        {meta.widenedNote ? <p className="note">{meta.widenedNote}</p> : null}
        {meta.message ? <p className="note warn">{meta.message}</p> : null}
      </header>

      <div className="result-list">
        {results.map((result, index) => {
          const metaLane = laneMeta[result.lane] || { title: result.lane, blurb: '' };
          return (
            <article
              key={result.experienceId}
              className="result-item"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="result-kicker">
                <span>{metaLane.title}</span>
                <span className="score">Score {laneScore(result)}</span>
              </div>
              <h2>{result.title}</h2>
              <p className="desc">{result.shortDescription}</p>
              <p className="meta-line">
                {result.categoryLabel} · {result.location} · ~RM{result.price}
              </p>
              <p className="why">{result.explanation}</p>
            </article>
          );
        })}
      </div>

      <div className="nav-row sticky-actions">
        <button type="button" className="btn primary" onClick={() => router.push('/feedback')}>
          Choose a favourite
        </button>
      </div>
    </main>
  );
}
