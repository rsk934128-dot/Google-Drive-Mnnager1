import React from "react";
import { HardDrive, Star, Plus, Sparkles, Menu } from "lucide-react";
import { FilterCategory } from "../types";

interface MobileBottomNavProps {
  currentFilter: FilterCategory;
  onFilterSelect: (filter: FilterCategory) => void;
  onOpenUpload: () => void;
  onOpenAiAssistant?: () => void;
  onOpenMobileMenu?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentFilter,
  onFilterSelect,
  onOpenUpload,
  onOpenAiAssistant,
  onOpenMobileMenu,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-800 backdrop-blur-xl px-2 py-2 flex items-center justify-around shadow-2xl pb-safe">
      {/* 1. Drive */}
      <button
        onClick={() => onFilterSelect("all")}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[50px] cursor-pointer ${
          currentFilter === "all"
            ? "text-blue-600 dark:text-blue-400 font-semibold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        <HardDrive className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Drive</span>
      </button>

      {/* 2. Starred */}
      <button
        onClick={() => onFilterSelect("starred")}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[50px] cursor-pointer ${
          currentFilter === "starred"
            ? "text-blue-600 dark:text-blue-400 font-semibold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        <Star className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Starred</span>
      </button>

      {/* 3. Center Action Button (Quick Upload FAB) */}
      <button
        onClick={onOpenUpload}
        className="flex flex-col items-center justify-center p-3.5 -mt-6 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-blue-500/30 transition-transform active:scale-95 cursor-pointer ring-4 ring-white dark:ring-slate-900"
        title="Upload File"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* 4. AI Assistant */}
      <button
        onClick={onOpenAiAssistant}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-all min-w-[50px] cursor-pointer"
        title="AI Assistant"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="text-[10px] mt-0.5 font-medium">AI Assist</span>
      </button>

      {/* 5. Menu Drawer */}
      <button
        onClick={onOpenMobileMenu}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[50px] cursor-pointer ${
          ["documents", "spreadsheets", "images", "analytics", "trashed", "shared"].includes(currentFilter)
            ? "text-blue-600 dark:text-blue-400 font-semibold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
        title="More Options"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Menu</span>
      </button>
    </nav>
  );
};
