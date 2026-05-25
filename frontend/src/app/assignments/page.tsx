"use client";

import React, { useEffect, useState, useCallback } from "react";
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
        <div className="relative mb-8 mt-12">
          {/* Exact Figma Illustration approximation */}
          <div className="w-48 h-48 relative flex items-center justify-center">
            <div className="w-[120px] h-[140px] bg-white rounded-xl border border-gray-100 shadow-sm relative z-10 flex flex-col p-4 gap-3">
              <div className="w-12 h-2.5 bg-gray-800 rounded-full" />
              <div className="w-full h-1.5 bg-gray-200 rounded-full" />
              <div className="w-3/4 h-1.5 bg-gray-200 rounded-full" />
              <div className="w-full h-1.5 bg-gray-200 rounded-full" />
              <div className="w-5/6 h-1.5 bg-gray-200 rounded-full" />
            </div>
            
            {/* Magnifier with Red Cross */}
            <div className="absolute right-4 -bottom-2 z-20 transform rotate-12">
              <div className="w-20 h-20 rounded-full border-[6px] border-[#E8E8ED] bg-white/40 backdrop-blur-sm relative flex items-center justify-center shadow-sm">
                <span className="text-[#FF4B4B] text-4xl font-bold leading-none -mt-1">×</span>
                <div className="absolute top-[68px] -right-[6px] w-3 h-10 bg-[#E8E8ED] rounded-full transform -rotate-45 origin-top" />
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 left-2 w-8 h-8 rounded-full border-2 border-gray-300" />
            <div className="absolute top-10 -left-6 text-gray-400 rotate-12">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>
            </div>
            <div className="absolute top-12 -right-4 w-6 h-6 text-blue-400">✦</div>
            <div className="absolute bottom-10 -left-8 w-4 h-4 text-blue-500">✦</div>
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

      {/* Floating Create Button (Desktop) */}
      <div className="hidden lg:flex fixed bottom-8 left-[calc(50%+130px)] -translate-x-1/2 z-30">
        <Link
          href="/assignments/create"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-white rounded-full font-semibold text-[15px] shadow-[0_8px_16px_-6px_rgba(26,26,26,0.4)] hover:shadow-xl hover:bg-black transition-all duration-200 active:scale-[0.97]"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Assignment
        </Link>
      </div>
    </div>
  );
};

export default AssignmentsPage;
