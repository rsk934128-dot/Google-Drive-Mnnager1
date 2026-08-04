import React, { useState } from "react";
import { X, FolderPlus, Loader2 } from "lucide-react";

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => Promise<void>;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
}) => {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || loading) return;

    setLoading(true);
    try {
      await onCreateFolder(folderName.trim());
      setFolderName("");
      onClose();
    } catch (error) {
      console.error("Failed to create folder:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-xl">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
              New Folder
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Work Documents"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
