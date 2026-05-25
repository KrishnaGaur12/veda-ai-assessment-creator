"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  FileText,
  Sparkles,
  BookOpen,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: <Home size={20} /> },
  { label: "My Groups", href: "/groups", icon: <Users size={20} /> },
  {
    label: "Assignments",
    href: "/assignments",
    icon: <FileText size={20} />,
  },
  {
    label: "AI Teacher's Toolkit",
    href: "/ai-toolkit",
    icon: <Sparkles size={20} />,
  },
  { label: "My Library", href: "/library", icon: <BookOpen size={20} />, badge: 39 },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] flex items-center justify-center">
          <Sparkles size={18} className="text-[#FF5B22]" />
        </div>
        <span className="font-bold text-[18px] text-[#1A1A1A] tracking-tight">
          VedaAI
        </span>
      </div>

      {/* Create Assignment Button */}
      <div className="px-5 pt-3 pb-2">
        <Link
          href="/assignments/create"
          className="flex items-center justify-center gap-2.5 w-full py-3 bg-[#FF5B22] text-white rounded-full font-semibold text-[14px] hover:bg-[#e84f1c] transition-all duration-200 shadow-md shadow-[#FF5B22]/25 active:scale-[0.98]"
        >
          <Sparkles size={16} />
          Create Assignment
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 group ${
              isActive(item.href)
                ? "bg-[#F4F4F5] text-[#1A1A1A] font-semibold"
                : "text-[#888888] hover:bg-gray-50 hover:text-[#1A1A1A]"
            }`}
          >
            <span
              className={`transition-colors duration-200 ${
                isActive(item.href)
                  ? "text-[#1A1A1A]"
                  : "text-[#AAAAAA] group-hover:text-[#888888]"
              }`}
            >
              {item.icon}
            </span>
            {item.label}
            {item.badge && (
              <span className="ml-auto bg-[#FF5B22] text-white text-[11px] font-bold rounded-md px-2 py-0.5 min-w-[28px] text-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-5 mt-auto">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-xl text-[14px] font-medium text-[#888888] hover:bg-gray-50 hover:text-[#1A1A1A] transition-all duration-200"
        >
          <Settings size={20} className="text-[#AAAAAA]" />
          Settings
        </Link>

        {/* School Info */}
        <div className="flex items-center gap-3 px-3 py-3 bg-[#F4F4F5] rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
            <Image
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=f3f4f6"
              alt="School Avatar"
              width={40}
              height={40}
              unoptimized
            />
          </div>
          <div className="min-w-0 pr-2">
            <p className="text-[13px] font-bold text-[#1A1A1A] leading-tight truncate">
              Delhi Public School
            </p>
            <p className="text-[11px] font-medium text-[#888888] truncate mt-0.5">
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
