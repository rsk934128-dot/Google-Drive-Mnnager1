import React, { useState, useRef } from "react";
import { X, Upload, File, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { formatBytes } from "../lib/driveUtils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile: (file: File) => Promise<void>;
  currentFolderName?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadFile,
  currentFolderName = "My Drive",
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setError(null);
    try {
      await onUploadFile(selectedFile);
      setSuccess(true);
      setTimeout(() => {
        setSelectedFile(null);
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                Upload to Drive
              </h2>
              <p className="text-xs text-slate-500">Destination: {currentFolderName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                : "border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/50"
            }`}
          >
            <Upload className="w-8 h-8 text-blue-500 mb-3 animate-bounce" />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Drag & drop your file here, or <span className="text-blue-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports images, documents, spreadsheets & more</p>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="p-3 bg-slate-100 dark:bg-slate-700/60 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <File className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{formatBytes(selectedFile.size)}</p>
                </div>
              </div>

              {!uploading && !success && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>File uploaded successfully to Google Drive!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading || success}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{uploading ? "Uploading..." : "Upload File"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
