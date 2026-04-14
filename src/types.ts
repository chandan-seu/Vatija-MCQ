export interface MCQ {
  question: string;
  options: string[];
  correct_answer: string;
}

export type Category = 
  | "Bangladesh Affairs"
  | "ICT"
  | "English"
  | "Mathematics"
  | "Physics"
  | "History"
  | "General Knowledge"
  | "International Affairs"
  | "Geography"
  | "Ethics & Good Governance"
  | "Random"
  | "Sports";

export interface ExamConfig {
  category: Category;
  questionCount: number;
}

export interface ExamResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  scorePercentage: number;
  userAnswers: (string | null)[];
  questions: MCQ[];
}
