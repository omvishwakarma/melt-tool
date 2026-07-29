'use client';

import { QuizProvider } from '@/context/QuizContext';

export default function Providers({ children }) {
  return <QuizProvider>{children}</QuizProvider>;
}
