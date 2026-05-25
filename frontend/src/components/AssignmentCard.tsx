"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Trash2 } from "lucide-react";
import { Assignment } from "@/types";

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleView = () => {
    setMenuOpen(false);
    router.push(`/assignments/${assignment._id}/output`);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete(assignment._id);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-[22px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 relative group">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-[#1A1A1A] text-[17px] tracking-tight truncate pr-4">
            {assignment.title}
          </h3>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-gray-400 hover:text-gray-600"
            aria-label="Assignment options"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-[14px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-50 py-1.5 min-w-[150px] z-10 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={handleView}
                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[#1A1A1A] hover:bg-gray-50 transition-colors"
              >
                View Assignment
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[#FF4B4B] hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center text-[12px] text-gray-500 mt-2">
        <span className="font-extrabold text-[#1A1A1A]">Assigned on :</span>
        <span className="ml-1 mr-6 font-medium">{formatDate(assignment.createdAt)}</span>
        <span className="font-extrabold text-[#1A1A1A]">Due :</span>
        <span className="ml-1 font-medium">{formatDate(assignment.dueDate)}</span>
      </div>
    </div>
  );
};

export default AssignmentCard;
