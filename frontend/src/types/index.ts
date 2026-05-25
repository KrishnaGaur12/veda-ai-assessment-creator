export interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  class: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions: string;
  fileUrl: string;
  status: "pending" | "processing" | "done" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  text: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  type: string;
}

export interface Section {
  name: string;
  instruction: string;
  questions: Question[];
}

export interface AnswerKeyItem {
  id: number;
  answer: string;
}

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  title: string;
  subject: string;
  class: string;
  totalMarks: number;
  duration: string;
  sections: Section[];
  answerKey: AnswerKeyItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WSMessage {
  type: "connected" | "job:processing" | "job:complete" | "job:failed";
  assignmentId?: string;
  result?: GeneratedPaper;
  error?: string;
  message?: string;
}

export type JobStatus = "idle" | "pending" | "processing" | "done" | "failed";
