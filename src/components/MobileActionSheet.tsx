import React from "react";
import {
  X,
  Eye,
  ExternalLink,
  Download,
  Star,
  Edit2,
  FolderInput,
  Trash2,
  RotateCcw,
  Info,
  Share2,
  Folder,
  FileText,
  Table,
  Presentation,
  Image as ImageIcon,
  FileCode,
  File,
  Sparkles,
} from "lucide-react";
import { DriveFile } from "../types";
import { formatBytes, formatDate, getFileTypeInfo } from "../lib/driveUtils";

interface MobileActionSheetProps {
  file: DriveFile | null;
  onClose: () => void;
  onPreview: (file: DriveFile) => void;
  onStar: (file: DriveFile) => void;
  onRename: (file: DriveFile) => void;
  onMove?: (file: DriveFile) => void;
  onDelete: (file: DriveFile) => void;
  onRestore?: (file: DriveFile) => void;
  onDetails: (file: DriveFile) => void;
  onShare?: (file: DriveFile) => void;
  onSummarize?: (file: DriveFile) => void;
  isTrashed?: boolean;
}

export const MobileActionSheet: React.FC<MobileActionSheetProps> = ({
  file,
  onClose,
  onPreview,
  onStar,
  onRename,
  onMove,
  onDelete,
  onRestore,
  onDetails,
  onShare,
  onSummarize,
  isTrashed,
}) => {
  if (!file) return null;

  const isFolder = file.mimeType === "application/vnd.google-apps.folder";
  const typeInfo = getFileTypeInfo(file.mimeType);

  const getIcon = () => {
    if (isFolder) return <Folder className="w-6 h-6 text-amber-500 fill-amber-500/20" />;
    if (typeInfo.type === "doc") return <FileText className="w-6 h-6 text-indigo-500" />;
    if (typeInfo.type === "sheet") return <Table className="w-6 h-6 text-emerald-500" />;
    if (typeInfo.type === "slide") return <Presentation className="w-6 h-6 text-amber-500" />;
    if (typeInfo.type === "image") return <ImageIcon className="w-6 h-6 text-purple-500" />;
    if (typeInfo.type === "pdf") return <FileCode className="w-6 h-6 text-rose-500" />;
    return <File className="w-6 h-6 text-slate-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center p-0 md:hidden animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Modal */}
      <div className="relative w-full bg-white dark:bg-slate-800 rounded-t-3xl border-t border-slate-200 dark:border-slate-700 shadow-2xl p-5 pb-8 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 z-10">
        {/* Drag handle pill */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto -mt-1 mb-2" />

        {/* Header File Info */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700/60 shrink-0">
              {getIcon()}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base truncate">
                {file.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className={`font-semibold text-[10px] px-2 py-0.5 rounded-md border ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
                {!isFolder && <span>• {formatBytes(file.size)}</span>}
                <span>• {formatDate(file.modifiedTime)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions List */}
        <div className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          {!isTrashed ? (
            <>
              {!isFolder && (
                <button
                  onClick={() => {
                    onClose();
                    onPreview(file);
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/60 active:bg-blue-50 dark:active:bg-blue-950/40 text-left transition-colors"
                >
                  <Eye className="w-5 h-5 text-blue-500" />
                  <span>In-App Full Preview</span>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onDetails(file);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors"
              >
                <Info className="w-5 h-5 text-indigo-500" />
                <span>File Metadata & Info</span>
              </button>

              {onSummarize && !isFolder && (
                <button
                  onClick={() => {
                    onClose();
                    onSummarize(file);
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors text-purple-600 dark:text-purple-400 font-semibold"
                >
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span>Gemini AI Summary</span>
                </button>
              )}

              {onShare && (
                <button
                  onClick={() => {
                    onClose();
                    onShare(file);
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors text-blue-600 dark:text-blue-400 font-semibold"
                >
                  <Share2 className="w-5 h-5 text-blue-500" />
                  <span>Share & Permissions</span>
                </button>
              )}

              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-sky-500" />
                  <span>Open in Google Drive</span>
                </a>
              )}

              {!isFolder && (
                <a
                  href={`/api/drive/files/${file.id}/download`}
                  download
                  onClick={onClose}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors"
                >
                  <Download className="w-5 h-5 text-emerald-500" />
                  <span>Direct Download Proxy</span>
                </a>
              )}

              <button
                onClick={() => {
                  onClose();
                  onStar(file);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors"
              >
                <Star className={`w-5 h-5 ${file.starred ? "text-amber-500 fill-amber-500" : "text-amber-500"}`} />
                <span>{file.starred ? "Remove from Starred" : "Add to Starred"}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onRename(file);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors"
              >
                <Edit2 className="w-5 h-5 text-slate-500" />
                <span>Rename File</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

              <button
                onClick={() => {
                  onClose();
                  onDelete(file);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
              >
                <Trash2 className="w-5 h-5 text-rose-500" />
                <span>Move to Trash</span>
              </button>
            </>
          ) : (
            <>
              {onRestore && (
                <button
                  onClick={() => {
                    onClose();
                    onRestore(file);
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-colors"
                >
                  <RotateCcw className="w-5 h-5 text-emerald-500" />
                  <span>Restore File</span>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onDelete(file);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
              >
                <Trash2 className="w-5 h-5 text-rose-500" />
                <span>Delete Permanently</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
