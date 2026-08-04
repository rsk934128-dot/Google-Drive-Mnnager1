import React, { useState, useEffect } from "react";
import { X, Folder, FolderInput, Loader2, HardDrive, Check } from "lucide-react";
import { DriveFile } from "../types";

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFileIds: string[];
  files: DriveFile[];
  onConfirmMove: (targetFolderId: string) => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

export const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  onClose,
  selectedFileIds,
  files,
  onConfirmMove,
  getAuthHeaders,
}) => {
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>("root");
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTargetFolderId("root");
      // Fetch available folders in Drive
      const fetchFolders = async () => {
        setLoadingFolders(true);
        try {
          const res = await fetch("/api/drive/files?filter=folders", {
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            const data = await res.json();
            // Filter out folders that are currently selected to move
            const filtered = (data.files || []).filter(
              (f: DriveFile) => !selectedFileIds.includes(f.id)
            );
            setFolders(filtered);
          }
        } catch (err) {
          console.error("Failed to load folders:", err);
        } finally {
          setLoadingFolders(false);
        }
      };
      fetchFolders();
    }
  }, [isOpen, selectedFileIds, getAuthHeaders]);

  if (!isOpen) return null;

  const handleMove = async () => {
    if (moving) return;
    setMoving(true);
    try {
      await onConfirmMove(targetFolderId);
      onClose();
    } catch (err) {
      console.error("Move failed:", err);
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 rounded-xl">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                Move {selectedFileIds.length} {selectedFileIds.length === 1 ? "Item" : "Items"}
              </h2>
              <p className="text-xs text-slate-500">Select destination folder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={moving}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {/* Root Drive Option */}
            <button
              onClick={() => setTargetFolderId("root")}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                targetFolderId === "root"
                  ? "bg-blue-50/80 border-blue-500 text-blue-700 dark:bg-blue-950/50 dark:border-blue-500 dark:text-blue-300"
                  : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>My Drive (Root Directory)</span>
              </div>
              {targetFolderId === "root" && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            {loadingFolders ? (
              <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span>Loading destination folders...</span>
              </div>
            ) : folders.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-xs">
                No custom subfolders found. Items will be moved to My Drive.
              </div>
            ) : (
              folders.map((folder) => {
                const isSelected = targetFolderId === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setTargetFolderId(folder.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-500 text-blue-700 dark:bg-blue-950/50 dark:border-blue-500 dark:text-blue-300"
                        : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={onClose}
              disabled={moving}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleMove}
              disabled={moving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {moving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{moving ? "Moving..." : "Move Here"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
