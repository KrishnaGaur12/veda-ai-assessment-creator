"use client";

import React from "react";
import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";
import Image from "next/image";

const MobileHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/assignments" className="flex items-center gap-2.5">
          <Image src="/vedalogo.png" alt="VedaAI Logo" width={32} height={32} priority className="w-8 h-8 object-contain" />
          <span className="font-bold text-[16px] text-[#1A1A1A] tracking-tight">
            VedaAI
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-[#888888]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5B22] rounded-full border-[1.5px] border-white" />
          </button>

          <button
            className="w-8 h-8 rounded-full bg-[#F4F4F5] flex items-center justify-center overflow-hidden"
            aria-label="Profile"
          >
            <Image
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=f3f4f6"
              alt="User"
              width={32}
              height={32}
              className="rounded-full"
              unoptimized
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
