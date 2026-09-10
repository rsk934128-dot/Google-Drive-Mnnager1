import React from "react";
import { CheckSquare, Square, Trash2, FolderInput, RotateCcw, X, Check, Loader2 } from "lucide-react";

interface BatchSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onOpenBatchMove: () => void;
  onBatchRestore?: () => void;
  isTrashed: boolean;
  actionLoading?: boolean;
}

export const BatchSelectionBar: React.FC<BatchSelectionBarProps> = ({
  selectedCount,
  totalCount,
  allSelected,
  onToggleSelectAll,
  onClearSelection,
  onBatchDelete,
  onOpenBatchMove,
  onBatchRestore,
  isTrashed,
  actionLoading = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-950 dark:to-slate-900 text-white rounded-2xl p-3 px-4 shadow-xl border border-blue-700/50 dark:border-blue-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Left: Checkbox + Selection Count */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSelectAll}
          className="flex items-center gap-2 text-xs font-medium hover:text-blue-200 cursor-pointer select-none"
        >
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              allSelected
                ? "bg-blue-500 border-blue-400 text-white"
                : "border-blue-300/60 bg-white/10"
            }`}
          >
            {allSelected ? (
              <Check className="w-3 h-3 stroke-[3]" />
            ) : (
              <span className="w-1.5 h-1.5 bg-blue-300 rounded-xs" />
            )}
          </div>
          <span>
            {allSelected ? "Deselect All" : "Select All"} ({selectedCount}/{totalCount})
          </span>
        </button>

        <span className="h-4 w-px bg-blue-700/60 hidden sm:inline-block" />

        <div className="text-xs font-semibold bg-blue-800/60 dark:bg-blue-900/60 px-2.5 py-1 rounded-lg border border-blue-600/40 flex items-center gap-2">
          <span>{selectedCount} {selectedCount === 1 ? "item" : "items"} selected</span>
          <span className="text-[10px] opacity-75 font-normal border-l border-blue-500/40 pl-2 hidden md:inline">
            Press <kbd className="px-1 py-0.5 bg-black/30 rounded border border-white/20 font-mono">Del</kbd> to delete, <kbd className="px-1 py-0.5 bg-black/30 rounded border border-white/20 font-mono">Esc</kbd> to deselect
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {actionLoading && (
          <div className="flex items-center gap-1.5 text-xs text-blue-200 mr-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Processing...</span>
          </div>
        )}

        {isTrashed && onBatchRestore && (
          <button
            onClick={onBatchRestore}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restore ({selectedCount})</span>
            <span className="sm:hidden">Restore</span>
          </button>
        )}

        {!isTrashed && (
          <button
            onClick={onOpenBatchMove}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FolderInput className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Move ({selectedCount})</span>
            <span className="sm:hidden">Move</span>
          </button>
        )}

        <button
          onClick={onBatchDelete}
          disabled={actionLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
            isTrashed
              ? "bg-rose-600 hover:bg-rose-500"
              : "bg-rose-600/90 hover:bg-rose-600"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isTrashed ? `Delete Permanently (${selectedCount})` : `Trash (${selectedCount})`}
          </span>
          <span className="sm:hidden">
            {isTrashed ? "Delete" : "Trash"}
          </span>
        </button>

        <button
          onClick={onClearSelection}
          disabled={actionLoading}
          className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer ml-1"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
