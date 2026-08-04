import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Info,
  FileText,
  Table,
  Presentation,
  Image as ImageIcon,
  FileCode,
  File,
  Folder,
  Calendar,
  HardDrive,
  User,
  Tag,
  Loader2,
} from "lucide-react";
import { DriveFile } from "../types";
import { formatBytes, formatDate, getFileTypeInfo } from "../lib/driveUtils";

interface FilePreviewModalProps {
  file: DriveFile | null;
  filesList?: DriveFile[];
  onClose: () => void;
  onNavigateFile?: (file: DriveFile) => void;
  onOpenDetails?: (file: DriveFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  filesList = [],
  onClose,
  onNavigateFile,
  onOpenDetails,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState<boolean>(false);
  const [loadingContent, setLoadingContent] = useState<boolean>(true);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    setZoom(1);
    setLoadingContent(true);
    setTextContent(null);
  }, [file]);

  // Handle ESC key and arrow navigation inside preview modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && onNavigateFile && file && filesList.length > 0) {
        const currentIndex = filesList.findIndex((f) => f.id === file.id);
        if (currentIndex > 0) {
          onNavigateFile(filesList[currentIndex - 1]);
        }
      } else if (e.key === "ArrowRight" && onNavigateFile && file && filesList.length > 0) {
        const currentIndex = filesList.findIndex((f) => f.id === file.id);
        if (currentIndex !== -1 && currentIndex < filesList.length - 1) {
          onNavigateFile(filesList[currentIndex + 1]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [file, filesList, onClose, onNavigateFile]);

  if (!file) return null;

  const isFolder = file.mimeType === "application/vnd.google-apps.folder";
  const typeInfo = getFileTypeInfo(file.mimeType);

  const currentIndex = filesList.findIndex((f) => f.id === file.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < filesList.length - 1;

  const handlePrev = () => {
    if (hasPrev && onNavigateFile) {
      onNavigateFile(filesList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigateFile) {
      onNavigateFile(filesList[currentIndex + 1]);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  const renderFileContent = () => {
    // 1. Folders
    if (isFolder) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 text-slate-300 space-y-4">
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Folder className="w-16 h-16 fill-amber-500/30" />
          </div>
          <h3 className="text-xl font-bold text-white">{file.name}</h3>
          <p className="text-sm text-slate-400 max-w-sm">
            This is a folder. You can navigate into it from the main Drive list view.
          </p>
        </div>
      );
    }

    // 2. Images
    if (typeInfo.type === "image" || file.mimeType.startsWith("image/")) {
      const imageSrc = file.thumbnailLink
        ? file.thumbnailLink.replace(/=s\d+/, "=s1600")
        : `/api/drive/files/${file.id}/download`;

      return (
        <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
          <img
            src={imageSrc}
            alt={file.name}
            style={{ transform: `scale(${zoom})`, transition: "transform 0.2s ease-out" }}
            className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl select-none"
            onLoad={() => setLoadingContent(false)}
            onError={() => setLoadingContent(false)}
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    // 3. Audio files
    if (file.mimeType.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 text-white">
          <div className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <File className="w-16 h-16 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold">{file.name}</h3>
          <audio
            controls
            src={`/api/drive/files/${file.id}/download`}
            className="w-full max-w-md rounded-lg"
            onCanPlay={() => setLoadingContent(false)}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    // 4. Video files
    if (file.mimeType.startsWith("video/")) {
      return (
        <div className="w-full h-full flex items-center justify-center p-4">
          <video
            controls
            src={`/api/drive/files/${file.id}/download`}
            className="max-h-[80vh] max-w-full rounded-xl shadow-2xl"
            onCanPlay={() => setLoadingContent(false)}
          >
            Your browser does not support the video element.
          </video>
        </div>
      );
    }

    // 5. Embedded Google Drive Preview (PDF, Docs, Sheets, Slides, or general files)
    const embedPreviewUrl = `https://drive.google.com/file/d/${file.id}/preview`;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative bg-slate-950/60 rounded-2xl overflow-hidden border border-slate-800 space-y-2 p-2">
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>If you see "403 Forbidden" in preview, open directly or check account sharing permissions.</span>
          </span>
          {file.webViewLink && (
            <a
              href={file.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1 text-[11px]"
            >
              <ExternalLink className="w-3 h-3" /> Open in Drive
            </a>
          )}
        </div>
        <iframe
          src={embedPreviewUrl}
          title={file.name}
          className="w-full flex-1 border-0 min-h-[55vh] rounded-xl bg-white/5"
          onLoad={() => setLoadingContent(false)}
          allow="autoplay"
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
          <h2 className="font-semibold text-white text-sm sm:text-base truncate max-w-xs sm:max-w-md">
            {file.name}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls for Images */}
          {(typeInfo.type === "image" || file.mimeType.startsWith("image/")) && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 border border-slate-700/80 rounded-xl p-1 text-slate-300 text-xs mr-2">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomReset}
                className="px-2 font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isFolder && (
            <a
              href={`/api/drive/files/${file.id}/download`}
              download
              className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download File Proxy"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}

          {file.webViewLink && (
            <a
              href={file.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open in Google Drive"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Drive</span>
            </a>
          )}

          <button
            onClick={() => setShowDetailsSidebar(!showDetailsSidebar)}
            className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              showDetailsSidebar
                ? "bg-blue-600/30 text-blue-400 border border-blue-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
            title="Toggle File Info"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer ml-1"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Navigation Arrow Left */}
        {hasPrev && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full border border-slate-700 shadow-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
            title="Previous File (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Navigation Arrow Right */}
        {hasNext && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full border border-slate-700 shadow-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
            title="Next File (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* File Content Render */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          {renderFileContent()}
        </div>

        {/* File Details Sidebar Overlay */}
        {showDetailsSidebar && (
          <div className="w-80 bg-slate-900/95 border-l border-slate-800 p-6 space-y-6 text-slate-300 overflow-y-auto animate-in slide-in-from-right duration-200 z-10 shrink-0">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white text-base">File Details</h3>
              <button
                onClick={() => setShowDetailsSidebar(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold text-[10px] mb-1">
                  File Name
                </p>
                <p className="font-medium text-white break-all">{file.name}</p>
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold text-[10px] mb-1">
                  Type
                </p>
                <p className="font-mono text-slate-300 break-all">{file.mimeType}</p>
              </div>

              {!isFolder && (
                <div>
                  <p className="text-slate-500 uppercase tracking-wider font-semibold text-[10px] mb-1">
                    Size
                  </p>
                  <p className="font-medium text-white">{formatBytes(file.size)}</p>
                </div>
              )}

              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold text-[10px] mb-1">
                  Last Modified
                </p>
                <p className="font-medium text-white">{formatDate(file.modifiedTime)}</p>
              </div>

              {file.owners && file.owners.length > 0 && (
                <div>
                  <p className="text-slate-500 uppercase tracking-wider font-semibold text-[10px] mb-1">
                    Owner
                  </p>
                  <p className="font-medium text-white">
                    {file.owners[0].displayName || file.owners[0].emailAddress}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="h-10 px-6 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-4">
          <span>
            File {currentIndex >= 0 ? currentIndex + 1 : 1} of {filesList.length || 1}
          </span>
          {!isFolder && <span>• {formatBytes(file.size)}</span>}
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>Use ← → keys to navigate</span>
          <span>•</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
