"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, ArrowLeft } from "lucide-react";

const DesktopHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Show back arrow on sub-pages
  const isSubPage = pathname.includes("/create") || pathname.includes("/output");

  return (
    <div className="hidden lg:flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 w-full sticky top-0 z-30">
      {/* Left side */}
      <div className="flex-1">
        {isSubPage && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#888888] hover:text-[#1A1A1A] font-medium text-[14px] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Assignment</span>
          </button>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
          <Bell size={20} className="text-[#888888]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5B22] rounded-full border-[1.5px] border-white" />
        </button>
        <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity">
          <Image
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=f3f4f6"
            alt="User"
            width={32}
            height={32}
            className="rounded-full bg-[#F4F4F5] border border-gray-100"
            unoptimized
          />
          <span className="text-[14px] font-semibold text-[#1A1A1A]">John Doe</span>
          <ChevronDown size={14} className="text-[#AAAAAA]" />
        </div>
      </div>
    </div>
  );
};

export default DesktopHeader;
