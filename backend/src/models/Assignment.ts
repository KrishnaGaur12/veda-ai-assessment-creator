import mongoose, { Schema, Document } from "mongoose";

export interface IQuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface IAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  class: string;
  dueDate: Date;
  questionTypes: IQuestionType[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions: string;
  fileUrl: string;
  status: "pending" | "processing" | "done" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<IQuestionType>(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, default: "" },
    class: { type: String, default: "" },
    dueDate: { type: Date, required: true },
    questionTypes: {
      type: [QuestionTypeSchema],
      required: true,
      validate: {
        validator: (v: IQuestionType[]) => v.length > 0,
        message: "At least one question type is required",
      },
    },
    totalQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    additionalInstructions: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model<IAssignment>("Assignment", AssignmentSchema);

export default Assignment;
