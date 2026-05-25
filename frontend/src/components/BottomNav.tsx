"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, BookOpen, Sparkles, FileText } from "lucide-react";

interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const bottomNavItems: BottomNavItem[] = [
  { label: "Home", href: "/", icon: <LayoutGrid size={22} /> },
  { label: "Assignments", href: "/assignments", icon: <FileText size={22} /> },
  { label: "Library", href: "/library", icon: <BookOpen size={22} /> },
  { label: "AI Toolkit", href: "/ai-toolkit", icon: <Sparkles size={22} /> },
];

const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 lg:hidden">
      <nav className="bg-[#1A1A1A] rounded-[2rem] shadow-2xl px-4 py-2 border border-gray-800/50">
        <div className="flex items-center justify-between">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl min-w-[64px] transition-all duration-200 ${
                isActive(item.href)
                  ? "text-white"
                  : "text-[#666666] hover:text-gray-300"
              }`}
            >
              <span
                className={
                  isActive(item.href) ? "text-white" : "text-[#666666]"
                }
              >
                {item.icon}
              </span>
              <span className={`text-[10px] ${isActive(item.href) ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              {isActive(item.href) && (
                <div className="absolute -bottom-1 w-8 h-[3px] bg-white rounded-t-md" />
              )}
            </Link>
          ))}
        </div>
      </nav>
      {/* Safe area padding for iOS is handled by the bottom-6 margin */}
    </div>
  );
};

export default BottomNav;
