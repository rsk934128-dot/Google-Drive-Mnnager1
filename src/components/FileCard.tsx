import React from "react";
import {
  Folder,
  Star,
  MoreVertical,
  ExternalLink,
  Download,
  Trash2,
  Edit2,
  Info,
  RotateCcw,
  FileText,
  Table,
  Presentation,
  Image as ImageIcon,
  FileCode,
  File,
  Check,
  Share2,
  Sparkles,
} from "lucide-react";
import { DriveFile } from "../types";
import { formatBytes, formatDate, getFileTypeInfo } from "../lib/driveUtils";

interface FileCardProps {
  file: DriveFile;
  onOpenFolder: (folderId: string, folderName: string) => void;
  onSelectFile: (file: DriveFile) => void;
  onStar: (file: DriveFile) => void;
  onRename: (file: DriveFile) => void;
  onDelete: (file: DriveFile) => void;
  onRestore?: (file: DriveFile) => void;
  onShare?: (file: DriveFile) => void;
  onSummarize?: (file: DriveFile) => void;
  onOpenMobileActions?: (file: DriveFile) => void;
  isTrashed?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (fileId: string) => void;
  hasSelection?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onOpenFolder,
  onSelectFile,
  onStar,
  onRename,
  onDelete,
  onRestore,
  onShare,
  onSummarize,
  onOpenMobileActions,
  isTrashed,
  isSelected = false,
  onToggleSelect,
  hasSelection = false,
}) => {
  const isFolder = file.mimeType === "application/vnd.google-apps.folder";
  const typeInfo = getFileTypeInfo(file.mimeType);
  const [showMenu, setShowMenu] = React.useState(false);

  const getIcon = () => {
    if (isFolder) return <Folder className="w-8 h-8 text-amber-500 fill-amber-500/20" />;
    if (typeInfo.type === "doc") return <FileText className="w-8 h-8 text-indigo-500" />;
    if (typeInfo.type === "sheet") return <Table className="w-8 h-8 text-emerald-500" />;
    if (typeInfo.type === "slide") return <Presentation className="w-8 h-8 text-amber-500" />;
    if (typeInfo.type === "image") return <ImageIcon className="w-8 h-8 text-purple-500" />;
    if (typeInfo.type === "pdf") return <FileCode className="w-8 h-8 text-rose-500" />;
    return <File className="w-8 h-8 text-slate-400" />;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasSelection && onToggleSelect) {
      onToggleSelect(file.id);
      return;
    }
    if (isFolder) {
      onOpenFolder(file.id, file.name);
    } else {
      onSelectFile(file);
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between select-none cursor-pointer ${
        isSelected
          ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-md"
          : "bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600"
      }`}
      onClick={handleClick}
    >
      {/* Top Bar: Checkbox + Icon + Badge + Menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          {onToggleSelect && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(file.id);
              }}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 opacity-0 group-hover:opacity-100"
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          )}

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
            {getIcon()}
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${typeInfo.color}`}
          >
            {typeInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!isTrashed && (
            <button
              onClick={() => onStar(file)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                file.starred
                  ? "text-amber-500 fill-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  : "text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700/60"
              }`}
              title={file.starred ? "Unstar" : "Star"}
            >
              <Star className={`w-4 h-4 ${file.starred ? "fill-amber-500" : ""}`} />
            </button>
          )}

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.innerWidth < 768 && onOpenMobileActions) {
                  onOpenMobileActions(file);
                } else {
                  setShowMenu(!showMenu);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-20 text-xs font-medium text-slate-700 dark:text-slate-200"
                onClick={(e) => e.stopPropagation()}
              >
                {!isTrashed ? (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onSelectFile(file);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-slate-400" /> Details & Preview
                    </button>

                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowMenu(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400" /> Open in Drive
                      </a>
                    )}

                    {!isFolder && (
                      <a
                        href={`/api/drive/files/${file.id}/download`}
                        download
                        onClick={() => setShowMenu(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-slate-400" /> Download Proxy
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onRename(file);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 text-slate-400" /> Rename
                    </button>

                    {onSummarize && !isFolder && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onSummarize(file);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left cursor-pointer font-medium"
                      >
                        <Sparkles className="w-4 h-4 text-purple-500" /> Gemini AI Summary
                      </button>
                    )}

                    {onShare && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onShare(file);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left cursor-pointer font-medium"
                      >
                        <Share2 className="w-4 h-4 text-blue-500" /> Share File
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(file);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" /> Move to Trash
                    </button>
                  </>
                ) : (
                  <>
                    {onRestore && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onRestore(file);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-emerald-500" /> Restore
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(file);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" /> Delete Forever
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Name & Thumbnail */}
      <div className="space-y-1 my-1">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {file.name}
        </h3>
        <p className="text-xs text-slate-400 flex items-center gap-2">
          <span>{formatDate(file.modifiedTime)}</span>
          {!isFolder && <span>• {formatBytes(file.size)}</span>}
        </p>
      </div>

      {/* Image Thumbnail Preview if available */}
      {file.thumbnailLink && typeInfo.type === "image" && (
        <div className="mt-2 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 h-28 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center">
          <img
            src={file.thumbnailLink}
            alt={file.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
};
