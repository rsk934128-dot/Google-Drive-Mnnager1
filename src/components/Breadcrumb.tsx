import React from "react";
import { ChevronRight, HardDrive, Folder } from "lucide-react";
import { BreadcrumbItem } from "../types";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (folderId: string, index: number) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 overflow-x-auto py-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.id}>
            {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
            <button
              onClick={() => onNavigate(item.id, index)}
              disabled={isLast}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                isLast
                  ? "font-semibold text-slate-900 dark:text-slate-100 cursor-default"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {index === 0 ? (
                <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 text-amber-500" />
              )}
              <span>{item.name}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
