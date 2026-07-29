'use client';

import { createContext, useContext, useMemo, useState } from 'react';

const QuizContext = createContext(null);

const emptyAnswers = {
  location: '',
  occasion: '',
  budget: '',
  time: '',
  duration: '',
  moods: [],
  categories: [],
  avoid: [],
  dietary: [],
  allergyNotes: '',
  travel: '',
  friction: '',
  novelty: '',
};

export function QuizProvider({ children }) {
  const [participantId, setParticipantId] = useState('');
  const [answers, setAnswers] = useState(emptyAnswers);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState({ message: null, widenedNote: null, insufficient: false });

  const value = useMemo(
    () => ({
      participantId,
      setParticipantId,
      answers,
      setAnswers,
      results,
      setResults,
      meta,
      setMeta,
      reset: () => {
        setParticipantId('');
        setAnswers(emptyAnswers);
        setResults([]);
        setMeta({ message: null, widenedNote: null, insufficient: false });
      },
    }),
    [participantId, answers, results, meta]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
