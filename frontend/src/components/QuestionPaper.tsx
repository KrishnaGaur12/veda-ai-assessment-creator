"use client";

import React from "react";
import { GeneratedPaper } from "@/types";

interface QuestionPaperProps {
  paper: GeneratedPaper;
}

const QuestionPaper: React.FC<QuestionPaperProps> = ({ paper }) => {
  return (
    <div className="bg-white rounded-[28px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8 md:p-12 text-[#1A1A1A]">
      {/* Paper Header */}
      <div className="text-center mb-8 pb-6 border-b border-[#E8E8E8]">
        <h1 className="text-[22px] md:text-[26px] font-bold mb-2">
          Delhi Public School, Sector-4, Bokaro
        </h1>
        <p className="text-[14px] font-semibold">Subject: {paper.subject}</p>
        <p className="text-[14px] font-semibold mt-0.5">Class: {paper.class}</p>
      </div>

      {/* Meta Row */}
      <div className="flex justify-between items-center text-[13px] font-semibold mb-6">
        <span>Time Allowed: {paper.duration}</span>
        <span>Maximum Marks: {paper.totalMarks}</span>
      </div>

      {/* Instructions */}
      <div className="mb-6 pb-4 border-b border-[#F0F0F0]">
        <p className="text-[13px] font-medium text-[#888888] italic">
          All questions are compulsory unless stated otherwise.
        </p>
      </div>

      {/* Student Info */}
      <div className="flex flex-col gap-2.5 text-[13px] font-medium mb-10">
        <div className="flex items-center gap-2">
          <span>Name: </span>
          <span className="border-b border-[#CCCCCC] w-48 block" />
        </div>
        <div className="flex items-center gap-2">
          <span>Roll Number: </span>
          <span className="border-b border-[#CCCCCC] w-40 block" />
        </div>
        <div className="flex items-center gap-2">
          <span>Class: {paper.class} &nbsp; Section: </span>
          <span className="border-b border-[#CCCCCC] w-24 block" />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {paper.sections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <h2 className="text-[15px] font-bold mb-1">
              {section.name}
            </h2>
            {section.instruction && (
              <p className="text-[12px] italic text-[#888888] mb-4">
                {section.instruction}
              </p>
            )}

            <ol className="space-y-4 list-none">
              {section.questions.map((question, qIdx) => (
                <li key={qIdx} className="flex gap-2">
                  <span className="text-[13px] shrink-0 font-medium">
                    {question.id}.
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] leading-[1.7]">
                      {question.text}
                      <span className="text-[#888888] ml-1">
                        [{question.marks} Mark{question.marks > 1 ? "s" : ""}]
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}

        {/* Answer Key */}
        {paper.answerKey && paper.answerKey.length > 0 && (
          <div className="pt-6 mt-8 border-t border-[#E8E8E8]">
            <h2 className="text-[15px] font-bold mb-5">Answer Key</h2>
            <ol className="space-y-3 list-none">
              {paper.answerKey.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-[13px]">
                  <span className="shrink-0 font-medium">
                    {item.id}.
                  </span>
                  <p className="leading-[1.7]">{item.answer}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* End of Paper */}
      <div className="text-center mt-10 pt-4 border-t border-[#E8E8E8]">
        <p className="text-[13px] font-semibold text-[#888888]">
          — End of Question Paper —
        </p>
      </div>
    </div>
  );
};

export default QuestionPaper;
