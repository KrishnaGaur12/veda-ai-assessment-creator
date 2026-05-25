import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  id: number;
  text: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  type: string;
}

export interface ISection {
  name: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAnswerKeyItem {
  id: number;
  answer: string;
}

export interface IGeneratedPaper extends Document {
  _id: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  class: string;
  totalMarks: number;
  duration: string;
  sections: ISection[];
  answerKey: IAnswerKeyItem[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    id: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    marks: { type: Number, required: true, min: 1 },
    type: { type: String, required: true },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
  },
  { _id: false }
);

const AnswerKeySchema = new Schema<IAnswerKeyItem>(
  {
    id: { type: Number, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    class: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    duration: { type: String, required: true },
    sections: { type: [SectionSchema], required: true },
    answerKey: { type: [AnswerKeySchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const GeneratedPaper = mongoose.model<IGeneratedPaper>(
  "GeneratedPaper",
  GeneratedPaperSchema
);

export default GeneratedPaper;
