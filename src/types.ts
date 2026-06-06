export type OptionType = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: number;
  correctAnswer: OptionType;
}

export interface AnswerState {
  // Map of option opacity/fill level: A, B, C, D (from 0.0 to 1.0)
  A: number;
  B: number;
  C: number;
  D: number;
}

export interface AnswerSheet {
  [questionId: number]: AnswerState;
}

export type GameStatus = 'idle' | 'playing' | 'success' | 'failure';

// Generate default 20 questions with pre-defined correct answers
export const QUESTIONS: Question[] = Array.from({ length: 20 }, (_, index) => {
  const id = index + 1;
  // A pattern of repeating containing various answers A, B, C, D
  const options: OptionType[] = ['A', 'B', 'C', 'D'];
  const correctAnswer = options[(id * 3 + (id % 2 === 0 ? 1 : 2)) % 4];
  return { id, correctAnswer };
});
