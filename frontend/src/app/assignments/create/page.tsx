"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, ArrowLeft, ArrowRight, Mic } from "lucide-react";
import QuestionTypeRow from "@/components/QuestionTypeRow";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { assignmentsApi } from "@/services/api";
import { QuestionType } from "@/types";

const DEFAULT_QUESTION_TYPES: QuestionType[] = [
  { type: "Multiple Choice Questions", count: 4, marks: 1 },
  { type: "Short Questions", count: 3, marks: 2 },
  { type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
  { type: "Numerical Problems", count: 5, marks: 5 },
];

const CreateAssignmentPage: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addAssignment, setJobStatus, setProcessingAssignmentId } =
    useAssignmentStore();

  // Form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [questionTypes, setQuestionTypes] =
    useState<QuestionType[]>(DEFAULT_QUESTION_TYPES);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Computed totals
  const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = questionTypes.reduce(
    (sum, qt) => sum + qt.count * qt.marks,
    0
  );

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];
      if (allowedTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
        setErrors((prev) => ({ ...prev, file: "" }));
      } else {
        setErrors((prev) => ({
          ...prev,
          file: "Only PDF, PNG, JPG, and PPTX files are allowed",
        }));
      }
    }
  };

  // Question type handlers
  const handleUpdateQuestionType = (
    index: number,
    field: keyof QuestionType,
    value: string | number
  ) => {
    setQuestionTypes((prev) =>
      prev.map((qt, i) => (i === index ? { ...qt, [field]: value } : qt))
    );
  };

  const handleRemoveQuestionType = (index: number) => {
    if (questionTypes.length <= 1) return;
    setQuestionTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddQuestionType = () => {
    setQuestionTypes((prev) => [
      ...prev,
      { type: "Multiple Choice Questions", count: 1, marks: 1 },
    ]);
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const dueDateObj = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDateObj < today) {
        newErrors.dueDate = "Due date must be in the future";
      }
    }

    if (questionTypes.length === 0) {
      newErrors.questionTypes = "At least one question type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      const formData = new FormData();
      let finalTitle = title.trim();
      if (!finalTitle) {
        if (file) {
          // Use filename without extension
          finalTitle = file.name.split('.').slice(0, -1).join('.') || "Untitled Assignment";
        } else {
          finalTitle = `Assignment - ${new Date().toLocaleDateString()}`;
        }
      }
      formData.append("title", finalTitle);
      formData.append("subject", subject.trim());
      formData.append("class", className.trim());
      formData.append("dueDate", dueDate);
      formData.append("questionTypes", JSON.stringify(questionTypes));
      formData.append("totalQuestions", totalQuestions.toString());
      formData.append("totalMarks", totalMarks.toString());
      formData.append("additionalInstructions", additionalInstructions.trim());

      if (file) {
        formData.append("file", file);
      }

      const response = await assignmentsApi.create(formData);

      if (response.success && response.data) {
        addAssignment(response.data);
        setJobStatus("pending");
        setProcessingAssignmentId(response.data._id);
        router.push("/assignments");
      } else {
        setErrors({ submit: response.error || "Failed to create assignment" });
      }
    } catch (error) {
      const err = error instanceof Error ? error.message : "Unknown error";
      setErrors({ submit: `Failed to create assignment: ${err}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 max-w-[820px] mx-auto pb-36">
      {/* Title Row */}
      <div className="mb-5 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-[#34D399] shrink-0" />
        <div>
          <h1 className="text-[18px] font-bold text-[#1A1A1A]">Create Assignment</h1>
          <p className="text-[13px] text-[#AAAAAA] mt-0.5">
            Set up a new assignment for your students
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E8E8E8] rounded-full h-[3px] mb-8">
        <div className="bg-[#1A1A1A] h-[3px] rounded-full w-[45%] transition-all duration-500" />
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-[28px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-7 md:p-10">
        <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-0.5">
          Assignment Details
        </h2>
        <p className="text-[13px] text-[#AAAAAA] mb-7">
          Basic information about your assignment
        </p>

        {/* Hidden fields for subject/class (still sent to API) */}
        <input type="hidden" value={subject} />
        <input type="hidden" value={className} />

        {/* File Upload */}
        <div className="mb-7">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl py-10 px-6 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? "border-[#1A1A1A] bg-gray-50"
                : file
                ? "border-emerald-300 bg-emerald-50/30"
                : "border-[#E0E0E0] hover:border-[#CCCCCC] bg-white"
            }`}
          >
            {/* Cloud upload icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`mx-auto mb-3 ${file ? "text-emerald-500" : "text-[#1A1A1A]"}`}>
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
              <path d="M12 12v9"/>
              <path d="m8 16 4-4 4 4"/>
            </svg>

            {file ? (
              <div>
                <p className="text-[14px] font-semibold text-[#1A1A1A]">{file.name}</p>
                <p className="text-[12px] text-[#AAAAAA] mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[14px] font-semibold text-[#1A1A1A]">
                  Choose a file or drag & drop it here
                </p>
                <p className="text-[12px] text-[#AAAAAA] mt-1">
                  JPEG, PNG, upto 10MB
                </p>
                <button
                  type="button"
                  className="mt-4 px-5 py-2 bg-white border border-[#E0E0E0] rounded-full text-[13px] font-semibold text-[#1A1A1A] hover:bg-gray-50 transition-all"
                >
                  Browse Files
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.pptx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <p className="text-[12px] text-center text-[#AAAAAA] mt-2.5">
            Upload images of your preferred document/image
          </p>
          {errors.file && (
            <p className="text-xs text-red-500 mt-1">{errors.file}</p>
          )}
        </div>

        {/* Due Date */}
        <div className="mb-7">
          <label className="block text-[14px] font-bold text-[#1A1A1A] mb-2">
            Due Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setErrors((prev) => ({ ...prev, dueDate: "" }));
              }}
              className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] text-[#1A1A1A] transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 ${
                errors.dueDate
                  ? "border-red-300 bg-red-50/30"
                  : "border-[#E0E0E0]"
              }`}
              placeholder="DD-MM-YYYY"
            />
            <Calendar
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAAAAA] pointer-events-none"
            />
          </div>
          {errors.dueDate && (
            <p className="text-xs text-red-500 mt-1.5">{errors.dueDate}</p>
          )}
        </div>

        {/* Question Types */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-bold text-[#1A1A1A]">Question Type</h3>
            <div className="hidden sm:flex items-center gap-16 text-[12px] font-medium text-[#AAAAAA]">
              <span>No. of Questions</span>
              <span>Marks</span>
            </div>
          </div>

          <div className="space-y-2">
            {questionTypes.map((qt, index) => (
              <QuestionTypeRow
                key={index}
                questionType={qt}
                index={index}
                onUpdate={handleUpdateQuestionType}
                onRemove={handleRemoveQuestionType}
              />
            ))}
          </div>

          {errors.questionTypes && (
            <p className="text-xs text-red-500 mt-2">{errors.questionTypes}</p>
          )}

          {/* Add Question Type */}
          <button
            type="button"
            onClick={handleAddQuestionType}
            className="flex items-center gap-2 mt-4 text-[14px] font-bold text-[#1A1A1A] hover:opacity-70 transition-opacity"
          >
            <div className="w-5 h-5 rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <Plus size={12} className="text-white" strokeWidth={3} />
            </div>
            Add Question Type
          </button>

          {/* Totals */}
          <div className="flex flex-col items-end gap-0.5 mt-5 text-[13px]">
            <span className="text-[#888888]">
              Total Questions :{" "}
              <strong className="text-[#1A1A1A]">{totalQuestions}</strong>
            </span>
            <span className="text-[#888888]">
              Total Marks :{" "}
              <strong className="text-[#1A1A1A]">{totalMarks}</strong>
            </span>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-4">
          <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-2">
            Additional Information (For better output)
          </h3>
          <div className="relative">
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-[#E0E0E0] rounded-xl text-[14px] text-[#1A1A1A] placeholder:text-[#CCCCCC] resize-none transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <button
              type="button"
              className="absolute right-3 bottom-3 p-2 rounded-lg hover:bg-gray-100 text-[#AAAAAA] transition-all"
              aria-label="Voice input"
            >
              <Mic size={16} />
            </button>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {errors.submit}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#E0E0E0] rounded-full text-[14px] font-semibold text-[#1A1A1A] hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft size={16} />
          Previous
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-7 py-3 bg-[#1A1A1A] text-white rounded-full text-[14px] font-semibold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Wait...
            </>
          ) : (
            <>
              Next
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateAssignmentPage;
