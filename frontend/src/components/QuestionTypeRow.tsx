"use client";

import React from "react";
import { X, Minus, Plus, ChevronDown } from "lucide-react";
import { QuestionType } from "@/types";

interface QuestionTypeRowProps {
  questionType: QuestionType;
  index: number;
  onUpdate: (index: number, field: keyof QuestionType, value: string | number) => void;
  onRemove: (index: number) => void;
}

const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True/False Questions",
  "Fill in the Blanks",
  "Match the Following",
  "Case Study Questions",
  "Assertion-Reasoning Questions",
];

const QuestionTypeRow: React.FC<QuestionTypeRowProps> = ({
  questionType,
  index,
  onUpdate,
  onRemove,
}) => {
  const handleCountChange = (delta: number) => {
    const newCount = Math.max(1, questionType.count + delta);
    onUpdate(index, "count", newCount);
  };

  const handleMarksChange = (delta: number) => {
    const newMarks = Math.max(1, questionType.marks + delta);
    onUpdate(index, "marks", newMarks);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-3 py-2">
      {/* Question Type Select */}
      <div className="flex-1 w-full sm:w-auto min-w-0">
        <div className="relative">
          <select
            value={questionType.type}
            onChange={(e) => onUpdate(index, "type", e.target.value)}
            className="w-full appearance-none bg-[#F4F4F5] border-none rounded-full px-4 py-3 pr-10 text-[13px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all cursor-pointer"
          >
            {QUESTION_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none"
          />
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(index)}
        className="p-1 rounded-full hover:bg-gray-100 text-[#AAAAAA] hover:text-[#1A1A1A] transition-all shrink-0 order-first sm:order-none self-end sm:self-auto"
        aria-label="Remove question type"
      >
        <X size={16} />
      </button>

      {/* Count Stepper */}
      <div className="flex flex-col items-center gap-1 w-full sm:w-auto">
        <span className="text-[11px] text-[#AAAAAA] font-medium sm:hidden">
          No. of Questions
        </span>
        <div className="flex items-center bg-[#F4F4F5] rounded-full px-1 py-1">
          <button
            onClick={() => handleCountChange(-1)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white text-[#888888] hover:text-[#1A1A1A] transition-all"
            aria-label="Decrease count"
          >
            <Minus size={12} />
          </button>
          <span className="w-8 text-center text-[14px] font-bold text-[#1A1A1A]">
            {questionType.count}
          </span>
          <button
            onClick={() => handleCountChange(1)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white text-[#888888] hover:text-[#1A1A1A] transition-all"
            aria-label="Increase count"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Marks Stepper */}
      <div className="flex flex-col items-center gap-1 w-full sm:w-auto">
        <span className="text-[11px] text-[#AAAAAA] font-medium sm:hidden">
          Marks
        </span>
        <div className="flex items-center bg-[#F4F4F5] rounded-full px-1 py-1">
          <button
            onClick={() => handleMarksChange(-1)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white text-[#888888] hover:text-[#1A1A1A] transition-all"
            aria-label="Decrease marks"
          >
            <Minus size={12} />
          </button>
          <span className="w-8 text-center text-[14px] font-bold text-[#1A1A1A]">
            {questionType.marks}
          </span>
          <button
            onClick={() => handleMarksChange(1)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white text-[#888888] hover:text-[#1A1A1A] transition-all"
            aria-label="Increase marks"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionTypeRow;
