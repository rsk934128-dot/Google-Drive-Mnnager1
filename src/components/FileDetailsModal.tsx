import React from "react";
import { X, ExternalLink, Download, Calendar, HardDrive, User, Tag } from "lucide-react";
import { DriveFile } from "../types";
import { formatBytes, formatDate, getFileTypeInfo } from "../lib/driveUtils";

interface FileDetailsModalProps {
  file: DriveFile | null;
  onClose: () => void;
}

export const FileDetailsModal: React.FC<FileDetailsModalProps> = ({ file, onClose }) => {
  if (!file) return null;

  const isFolder = file.mimeType === "application/vnd.google-apps.folder";
  const typeInfo = getFileTypeInfo(file.mimeType);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden pr-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base truncate">
              {file.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Preview Image if available */}
          {file.thumbnailLink && typeInfo.type === "image" && (
            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 max-h-56 flex items-center justify-center">
              <img
                src={file.thumbnailLink}
                alt={file.name}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Key Value Details */}
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">MIME Type</p>
                <p className="text-slate-800 dark:text-slate-200 font-mono text-xs break-all">
                  {file.mimeType}
                </p>
              </div>
            </div>

            {!isFolder && (
              <div className="flex items-start gap-3">
                <HardDrive className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">File Size</p>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Last Modified</p>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {formatDate(file.modifiedTime)}
                </p>
              </div>
            </div>

            {file.owners && file.owners.length > 0 && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Owner</p>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {file.owners[0].displayName || file.owners[0].emailAddress}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col gap-3">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-2.5 rounded-xl">
            💡 <strong>Tip:</strong> Use <strong>Proxy Download</strong> if opening directly in Google Drive shows a 403 error due to browser multi-account sign-in mismatches.
          </p>
          <div className="flex items-center justify-end gap-3">
            {!isFolder && (
              <a
                href={`/api/drive/files/${file.id}/download`}
                download
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" /> Direct Proxy Download
              </a>
            )}

            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" /> Open in Google Drive
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
