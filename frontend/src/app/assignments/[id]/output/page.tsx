"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import QuestionPaper from "@/components/QuestionPaper";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { assignmentsApi } from "@/services/api";
import { Assignment } from "@/types";

const OutputPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { currentPaper, setCurrentPaper, jobStatus } = useAssignmentStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch assignment details
      const assignmentRes = await assignmentsApi.getById(id);
      if (assignmentRes.success && assignmentRes.data) {
        setAssignment(assignmentRes.data);
      }

      // Fetch generated paper
      const resultRes = await assignmentsApi.getResult(id);
      if (resultRes.success && resultRes.data) {
        setCurrentPaper(resultRes.data);
      } else if (
        assignmentRes.data?.status === "processing" ||
        assignmentRes.data?.status === "pending"
      ) {
        setError("Your question paper is being generated. Please wait...");
      } else if (assignmentRes.data?.status === "failed") {
        setError("Paper generation failed. Please try regenerating.");
      } else {
        setError(resultRes.error || "Paper not found");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to load paper: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [id, setCurrentPaper]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Re-fetch when job completes
  useEffect(() => {
    if (jobStatus === "done") {
      fetchData();
    }
  }, [jobStatus, fetchData]);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const response = await assignmentsApi.regenerate(id);
      if (response.success) {
        setError("Regenerating your question paper... Please wait.");
        setCurrentPaper(null);
      } else {
        setError(response.error || "Failed to regenerate");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Regeneration failed: ${msg}`);
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const blob = await assignmentsApi.downloadPdf(id);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `question-paper-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError("Failed to download PDF");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`PDF download failed: ${msg}`);
    } finally {
      setDownloading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 size={36} className="text-[#1A1A1A] animate-spin" />
        <p className="text-[14px] text-[#888888] font-medium">Loading question paper...</p>
      </div>
    );
  }

  // Processing state
  if (
    !currentPaper &&
    (assignment?.status === "processing" || assignment?.status === "pending")
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-[3px] border-[#E8E8E8] border-t-[#1A1A1A] animate-spin" />
        </div>
        <h2 className="text-[18px] font-bold text-[#1A1A1A] mt-4">
          Generating Your Question Paper
        </h2>
        <p className="text-[14px] text-[#888888] text-center max-w-md leading-relaxed">
          Our AI is crafting a customized question paper based on your
          requirements. This usually takes 15-30 seconds.
        </p>
        <div className="flex items-center gap-2 text-[12px] text-[#1A1A1A] font-semibold mt-2">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
          {assignment?.status === "pending" ? "Queued" : "Processing"}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentPaper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-6">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-[18px] font-bold text-[#1A1A1A]">
          {assignment?.status === "failed"
            ? "Generation Failed"
            : "Paper Not Available"}
        </h2>
        <p className="text-[14px] text-[#888888] text-center max-w-md">{error}</p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => router.push("/assignments")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E0E0E0] rounded-full text-[14px] font-semibold text-[#1A1A1A] hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-full text-[14px] font-semibold hover:bg-black transition-all disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={regenerating ? "animate-spin" : ""}
            />
            Regenerate
          </button>
        </div>
      </div>
    );
  }

  if (!currentPaper) return null;

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 max-w-[820px] mx-auto pb-32">
      {/* Dark Header Box */}
      <div className="bg-[#2A2A2A] rounded-[28px] p-6 lg:p-8 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
        <p className="text-[15px] lg:text-[16px] leading-[1.7] text-white/90 mb-6">
          Certainly! Here is your customized Question Paper for your{" "}
          <strong className="text-white">
            {assignment?.class ? `${assignment.class} ` : ""}
            {assignment?.subject || currentPaper.subject}
          </strong>{" "}
          class based on your requirements.
        </p>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1A1A1A] rounded-full text-[14px] font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm active:scale-[0.98]"
        >
          {downloading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Download as PDF
        </button>
      </div>

      {/* Question Paper */}
      <QuestionPaper paper={currentPaper} />
    </div>
  );
};

export default OutputPage;
