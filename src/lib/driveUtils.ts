export function formatBytes(bytes?: string | number): string {
  if (!bytes) return "--";
  const num = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "--";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getFileTypeInfo(mimeType: string) {
  if (mimeType === "application/vnd.google-apps.folder") {
    return { type: "folder", label: "Folder", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/50" };
  }
  if (mimeType.includes("google-apps.document") || mimeType.includes("text/plain") || mimeType.includes("word")) {
    return { type: "doc", label: "Document", color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50" };
  }
  if (mimeType.includes("google-apps.spreadsheet") || mimeType.includes("sheet") || mimeType.includes("csv") || mimeType.includes("excel")) {
    return { type: "sheet", label: "Spreadsheet", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50" };
  }
  if (mimeType.includes("google-apps.presentation") || mimeType.includes("powerpoint") || mimeType.includes("presentation")) {
    return { type: "slide", label: "Presentation", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50" };
  }
  if (mimeType.startsWith("image/")) {
    return { type: "image", label: "Image", color: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800/50" };
  }
  if (mimeType === "application/pdf") {
    return { type: "pdf", label: "PDF", color: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/50" };
  }
  if (mimeType.startsWith("video/")) {
    return { type: "video", label: "Video", color: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-800/50" };
  }
  if (mimeType.startsWith("audio/")) {
    return { type: "audio", label: "Audio", color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50" };
  }
  return { type: "file", label: "File", color: "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800" };
}
