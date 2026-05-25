"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, FileText } from "lucide-react";
import AssignmentCard from "@/components/AssignmentCard";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { assignmentsApi } from "@/services/api";

const AssignmentsPage: React.FC = () => {
  const { assignments, setAssignments, deleteAssignment } =
    useAssignmentStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await assignmentsApi.getAll();
      if (response.success && response.data) {
        setAssignments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoading(false);
    }
  }, [setAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleDelete = async (id: string) => {
    try {
      const response = await assignmentsApi.delete(id);
      if (response.success) {
        deleteAssignment(id);
      }
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    }
  };

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-72" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-100 rounded-2xl border border-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 relative">
        <div className="relative mb-10 mt-12 w-64 h-64 flex items-center justify-center mx-auto">
          {/* Base Circle Background */}
          <div className="absolute inset-0 bg-gray-100/80 rounded-full scale-[0.85] z-0"></div>
          
          {/* Curvy line decorative */}
          <svg className="absolute left-2 top-8 z-0 text-[#1A1A1A]" width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M 35 15 C 25 15, 20 25, 10 25 C 0 25, 5 15, 15 15" strokeDasharray="3 3" />
            <path d="M 35 15 C 30 15, 20 25, 5 20 C 0 18, 5 10, 15 12" />
          </svg>

          {/* Sparkles & Dots */}
          <div className="absolute left-8 bottom-12 w-4 h-4 text-[#4285F4]">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2 8 8 2-8 2-2 8-2-8-8-2 8-2z"/></svg>
          </div>
          <div className="absolute right-6 top-1/2 w-2 h-2 bg-[#4285F4] rounded-full"></div>
          <div className="absolute left-1/4 top-4 w-2 h-2 bg-[#EA4335] rounded-full"></div>

          {/* Main Document */}
          <div className="relative z-10 w-[90px] h-[120px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-4 gap-3">
            <div className="w-10 h-2 bg-[#1A1A1A] rounded-full"></div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full"></div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full"></div>
            <div className="w-4/5 h-1.5 bg-gray-200 rounded-full"></div>
          </div>

          {/* Floating Card Top Right */}
          <div className="absolute z-10 right-10 top-10 w-12 h-8 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center px-2 gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A3A3B1]"></div>
            <div className="w-5 h-2 rounded-full bg-gray-200"></div>
          </div>

          {/* Magnifying Glass with Red X */}
          <div className="absolute z-20 right-12 bottom-12">
            <div className="relative">
              {/* Glass Handle */}
              <div className="absolute -bottom-8 -right-6 w-10 h-3.5 bg-[#E8E8ED] rounded-full transform rotate-45 border border-white"></div>
              {/* Glass Ring */}
              <div className="w-[70px] h-[70px] rounded-full border-[6px] border-[#DCDCE4] bg-white/50 backdrop-blur-[2px] flex items-center justify-center relative z-10 shadow-sm">
                {/* Red X */}
                <div className="relative w-8 h-8 flex items-center justify-center transform rotate-45 text-[#FF4B4B]">
                  <div className="absolute w-full h-1.5 bg-current rounded-full"></div>
                  <div className="absolute h-full w-1.5 bg-current rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-[22px] font-extrabold text-[#1A1A1A] mb-3 text-center tracking-tight">
          No assignments yet
        </h2>
        <p className="text-[15px] text-[#666666] text-center max-w-sm mb-10 leading-[1.6]">
          Create your first assignment to start collecting and
          grading student submissions. You can set up rubrics,
          define marking criteria, and let AI assist with grading.
        </p>

        <Link
          href="/assignments/create"
          className="inline-flex items-center justify-center gap-2 w-full max-w-[280px] py-3.5 bg-[#1A1A1A] text-white rounded-full font-semibold text-[15px] hover:bg-black transition-all duration-200 active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Your First Assignment
        </Link>
        
        {/* Floating Add Button for empty state (Mobile) */}
        <div className="fixed bottom-[100px] right-6 z-30 lg:hidden">
          <Link
            href="/assignments/create"
            className="w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 hover:bg-gray-50 active:scale-[0.96] transition-all"
          >
            <Plus size={24} className="text-[#FF5B22]" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    );
  }

  // Filled state
  return (
    <div className="p-6 md:p-8">
      {/* Header Mobile & Desktop */}
      <div className="mb-6 lg:mb-8 mt-2 lg:mt-0">
        {/* Mobile Title */}
        <div className="flex lg:hidden items-center justify-center relative mb-6">
          <button className="absolute left-0 w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1A1A1A]"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-[17px] font-bold text-[#1A1A1A]">Assignments</h1>
        </div>

        {/* Desktop Title */}
        <div className="hidden lg:block mb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
            <h1 className="text-[22px] font-bold text-[#1A1A1A]">Assignments</h1>
          </div>
          <p className="text-[14px] text-gray-400 ml-5">
            Manage and create assignments for your classes.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <button className="inline-flex items-center gap-2 px-4 py-[11px] bg-white border border-gray-100 rounded-full shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] text-[14px] font-medium text-gray-400 hover:bg-gray-50 transition-all shrink-0">
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filter By</span>
          <span className="sm:hidden">Filter</span>
        </button>

        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-[11px] bg-white border border-gray-100 rounded-full shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all"
          />
        </div>
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAssignments.map((assignment) => (
          <AssignmentCard
            key={assignment._id}
            assignment={assignment}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredAssignments.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">
            No assignments found matching &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      )}

      {/* Floating Add Button for filled state (Mobile) */}
      <div className="fixed bottom-[100px] right-6 z-30 lg:hidden">
        <Link
          href="/assignments/create"
          className="w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 hover:bg-gray-50 active:scale-[0.96] transition-all"
        >
          <Plus size={24} className="text-[#FF5B22]" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Blurred Bottom Bar (Desktop) */}
      <div className="hidden lg:flex fixed bottom-0 left-[260px] right-0 h-[120px] bg-gradient-to-t from-[#F4F4F5] via-[#F4F4F5]/90 to-transparent backdrop-blur-[3px] z-30 pointer-events-none items-end justify-center pb-8">
        <Link
          href="/assignments/create"
          className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-white rounded-full font-semibold text-[15px] shadow-[0_8px_16px_-6px_rgba(26,26,26,0.4)] hover:shadow-xl hover:bg-black transition-all duration-200 active:scale-[0.97]"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Assignment
        </Link>
      </div>
    </div>
  );
};

export default AssignmentsPage;
