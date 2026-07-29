'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { questions } from '@/data/questions';
import { useQuiz } from '@/context/QuizContext';

function isAnswered(q, answers) {
  const value = answers[q.id];
  if (q.type === 'single') return Boolean(value);
  if (q.type === 'text') return Boolean(value?.trim?.());
  if (q.type === 'multi' || q.type === 'rank') return Array.isArray(value) && value.length > 0;
  return false;
}

export default function Quiz() {
  const router = useRouter();
  const { participantId, answers, setAnswers, setResults, setMeta } = useQuiz();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const q = questions[step];
  const progress = useMemo(() => ((step + 1) / questions.length) * 100, [step]);

  useEffect(() => {
    if (!participantId) router.replace('/');
  }, [participantId, router]);

  if (!participantId) return null;

  function selectSingle(value) {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  }

  function toggleMulti(value) {
    setAnswers((prev) => {
      let current = [...(prev[q.id] || [])];

      if (q.id === 'avoid') {
        if (value === 'nothing') return { ...prev, avoid: ['nothing'] };
        current = current.filter((v) => v !== 'nothing');
      }
      if (q.id === 'dietary') {
        if (value === 'no_restrictions' || value === 'not_relevant') {
          return { ...prev, dietary: [value], allergyNotes: '' };
        }
        current = current.filter((v) => v !== 'no_restrictions' && v !== 'not_relevant');
      }

      if (current.includes(value)) current = current.filter((v) => v !== value);
      else {
        if (q.max && current.length >= q.max) return prev;
        current.push(value);
      }
      return { ...prev, [q.id]: current };
    });
  }

  function toggleRank(value) {
    setAnswers((prev) => {
      let current = [...(prev.categories || [])];
      if (current.includes(value)) current = current.filter((v) => v !== value);
      else if (current.length < 3) current.push(value);
      return { ...prev, categories: current };
    });
  }

  async function handleNext() {
    setError('');
    if (!isAnswered(q, answers)) {
      setError('Please choose an answer to continue.');
      return;
    }
    if (q.id === 'dietary' && answers.dietary.includes('food_allergy') && !answers.allergyNotes.trim()) {
      setError('Please briefly describe the food allergy.');
      return;
    }

    if (step < questions.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);
    router.push('/generating');
    try {
      const data = await api.submitAnswers(participantId, answers);
      setResults(data.results || []);
      setMeta({
        message: data.message,
        widenedNote: data.widenedNote,
        insufficient: data.insufficient,
      });
      router.push('/results');
    } catch (err) {
      setError(err.message);
      router.push('/quiz');
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
            {q.code} · {step + 1} of {questions.length}
          </span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="question-panel">
        <h1>{q.text}</h1>
        {q.hint ? <p className="hint">{q.hint}</p> : null}
        {q.type === 'multi' && q.max ? (
          <p className="hint">Choose up to {q.max}</p>
        ) : null}

        <div className="options">
          {q.options.map((opt) => {
            let selected = false;
            let rank = null;
            if (q.type === 'single') selected = answers[q.id] === opt.value;
            if (q.type === 'multi') selected = (answers[q.id] || []).includes(opt.value);
            if (q.type === 'rank') {
              rank = (answers.categories || []).indexOf(opt.value);
              selected = rank >= 0;
            }

            return (
              <button
                key={opt.value}
                type="button"
                className={`option ${selected ? 'selected' : ''}`}
                onClick={() => {
                  if (q.type === 'single') selectSingle(opt.value);
                  else if (q.type === 'rank') toggleRank(opt.value);
                  else toggleMulti(opt.value);
                }}
              >
                <span>{opt.label}</span>
                {rank !== null && rank >= 0 ? <em>{rank + 1}</em> : null}
              </button>
            );
          })}
        </div>

        {q.id === 'dietary' && (answers.dietary || []).includes('food_allergy') ? (
          <label className="allergy">
            Allergy notes
            <textarea
              value={answers.allergyNotes}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, allergyNotes: e.target.value }))
              }
              placeholder="e.g. peanut allergy"
              rows={3}
            />
          </label>
        ) : null}

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
            {step === questions.length - 1 ? 'See results' : 'Next'}
          </button>
        </div>
      </section>
    </main>
  );
}
