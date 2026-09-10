import React from "react";
import {
  Folder,
  Star,
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
  MoreVertical,
  Share2,
  Sparkles,
} from "lucide-react";
import { DriveFile } from "../types";
import { formatBytes, formatDate, getFileTypeInfo } from "../lib/driveUtils";

interface FileTableRowProps {
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

export const FileTableRow: React.FC<FileTableRowProps> = ({
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

  const getIcon = () => {
    if (isFolder) return <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20 shrink-0" />;
    if (typeInfo.type === "doc") return <FileText className="w-5 h-5 text-indigo-500 shrink-0" />;
    if (typeInfo.type === "sheet") return <Table className="w-5 h-5 text-emerald-500 shrink-0" />;
    if (typeInfo.type === "slide") return <Presentation className="w-5 h-5 text-amber-500 shrink-0" />;
    if (typeInfo.type === "image") return <ImageIcon className="w-5 h-5 text-purple-500 shrink-0" />;
    if (typeInfo.type === "pdf") return <FileCode className="w-5 h-5 text-rose-500 shrink-0" />;
    return <File className="w-5 h-5 text-slate-400 shrink-0" />;
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
    <tr
      onClick={handleClick}
      className={`group border-b transition-colors text-sm select-none cursor-pointer ${
        isSelected
          ? "bg-blue-50/90 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/60 text-slate-900 dark:text-slate-100"
          : "hover:bg-blue-50/40 dark:hover:bg-slate-800/60 border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300"
      }`}
    >
      {/* Checkbox Column */}
      <td className="py-3 pl-4 pr-1 w-10" onClick={(e) => e.stopPropagation()}>
        {onToggleSelect && (
          <div
            onClick={() => onToggleSelect(file.id)}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
              isSelected
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 opacity-0 group-hover:opacity-100"
            }`}
          >
            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        )}
      </td>

      {/* Name + Star */}
      <td className="py-3 px-3 flex items-center gap-3 font-medium text-slate-900 dark:text-slate-100 max-w-md">
        {!isTrashed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStar(file);
            }}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              file.starred
                ? "text-amber-500 fill-amber-500"
                : "text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-500"
            }`}
          >
            <Star className={`w-4 h-4 ${file.starred ? "fill-amber-500" : ""}`} />
          </button>
        )}
        {getIcon()}
        <span className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {file.name}
        </span>
      </td>

      {/* Type */}
      <td className="py-3 px-4 hidden lg:table-cell">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </td>

      {/* Last Modified */}
      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap hidden md:table-cell">
        {formatDate(file.modifiedTime)}
      </td>

      {/* Size */}
      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:table-cell">
        {isFolder ? "--" : formatBytes(file.size)}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {onOpenMobileActions && (
            <button
              onClick={() => onOpenMobileActions(file)}
              className="sm:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
              title="More Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}

          {!isTrashed ? (
            <>
              <button
                onClick={() => onSelectFile(file)}
                title="Details"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              >
                <Info className="w-4 h-4" />
              </button>

              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Google Drive"
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {!isFolder && (
                <a
                  href={`/api/drive/files/${file.id}/download`}
                  download
                  title="Download File Proxy"
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}

              <button
                onClick={() => onRename(file)}
                title="Rename"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {onSummarize && !isFolder && (
                <button
                  onClick={() => onSummarize(file)}
                  title="Gemini AI Summary"
                  className="p-1.5 text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}

              {onShare && (
                <button
                  onClick={() => onShare(file)}
                  title="Share Permissions"
                  className="p-1.5 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onDelete(file)}
                title="Move to Trash"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {onRestore && (
                <button
                  onClick={() => onRestore(file)}
                  title="Restore"
                  className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(file)}
                title="Delete Forever"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
