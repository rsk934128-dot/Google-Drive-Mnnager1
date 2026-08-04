import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  HardDrive,
  PieChart as PieChartIcon,
  FileText,
  Table,
  Image as ImageIcon,
  Video,
  FileCode,
  Folder,
  File,
  Trash2,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { DriveFile, StorageQuota } from "../types";
import { formatBytes, getFileTypeInfo } from "../lib/driveUtils";

interface StorageAnalyticsProps {
  files: DriveFile[];
  quota: StorageQuota | null;
  onSelectFilter?: (filter: any) => void;
  onOpenTrash?: () => void;
}

export const StorageAnalytics: React.FC<StorageAnalyticsProps> = ({
  files,
  quota,
  onSelectFilter,
  onOpenTrash,
}) => {
  // Compute storage consumption by file categories
  const categories = React.useMemo(() => {
    let imagesSize = 0, imagesCount = 0;
    let docsSize = 0, docsCount = 0;
    let sheetsSize = 0, sheetsCount = 0;
    let pdfsSize = 0, pdfsCount = 0;
    let mediaSize = 0, mediaCount = 0;
    let othersSize = 0, othersCount = 0;

    files.forEach((file) => {
      if (file.trashed) return;
      const size = file.size ? parseInt(file.size, 10) : 0;
      const mime = file.mimeType.toLowerCase();

      if (mime.startsWith("image/")) {
        imagesSize += size;
        imagesCount++;
      } else if (
        mime.includes("word") ||
        mime.includes("document") ||
        mime.includes("text")
      ) {
        docsSize += size;
        docsCount++;
      } else if (mime.includes("sheet") || mime.includes("excel") || mime.includes("csv")) {
        sheetsSize += size;
        sheetsCount++;
      } else if (mime.includes("pdf")) {
        pdfsSize += size;
        pdfsCount++;
      } else if (mime.startsWith("video/") || mime.startsWith("audio/")) {
        mediaSize += size;
        mediaCount++;
      } else if (mime !== "application/vnd.google-apps.folder") {
        othersSize += size;
        othersCount++;
      }
    });

    return [
      { name: "Images", size: imagesSize, count: imagesCount, color: "#a855f7", icon: ImageIcon },
      { name: "Documents", size: docsSize, count: docsCount, color: "#6366f1", icon: FileText },
      { name: "Spreadsheets", size: sheetsSize, count: sheetsCount, color: "#10b981", icon: Table },
      { name: "PDF Files", size: pdfsSize, count: pdfsCount, color: "#f43f5e", icon: FileCode },
      { name: "Media (Audio/Video)", size: mediaSize, count: mediaCount, color: "#f59e0b", icon: Video },
      { name: "Other Files", size: othersSize, count: othersCount, color: "#64748b", icon: File },
    ];
  }, [files]);

  const pieData = categories.map((cat) => ({
    name: cat.name,
    value: cat.size || 1024 * 1024 * 2, // fallback for chart display
    count: cat.count,
    formattedSize: formatBytes(cat.size),
    color: cat.color,
  }));

  const barData = categories.map((cat) => ({
    name: cat.name.split(" ")[0],
    Files: cat.count,
  }));

  const totalCalculatedSize = categories.reduce((acc, c) => acc + c.size, 0);
  const totalFilesCount = files.filter((f) => !f.trashed).length;

  const usageNum = quota?.usage ? parseInt(quota.usage, 10) : totalCalculatedSize;
  const limitNum = quota?.limit ? parseInt(quota.limit, 10) : 15 * 1024 * 1024 * 1024; // 15GB default
  const percentUsed = Math.min(Math.round((usageNum / limitNum) * 100), 100);

  // Top 5 largest non-trashed files
  const largestFiles = [...files]
    .filter((f) => !f.trashed && f.mimeType !== "application/vnd.google-apps.folder")
    .sort((a, b) => (parseInt(b.size || "0", 10)) - (parseInt(a.size || "0", 10)))
    .slice(0, 5);

  return (
    <div id="storage-analytics-view" className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider">
            <PieChartIcon className="w-4 h-4" />
            <span>Drive Storage Insights</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Storage Analytics & Distribution</h2>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
            Monitor file allocation across types, locate large files, and optimize your Google Drive storage limits in real-time.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-auto min-w-[260px] space-y-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <span>Quota Used</span>
            <span className="font-bold text-amber-300">{percentUsed}%</span>
          </div>

          <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-blue-100 font-mono">
            <span>{formatBytes(usageNum)}</span>
            <span>of {formatBytes(limitNum)}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Storage Allocation by Type
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {totalFilesCount} Total Files
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${item.payload.formattedSize} (${item.payload.count} files)`,
                    item.payload.name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Categories Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="truncate">
                  <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {formatBytes(cat.size)} • {cat.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                File Count Frequency
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Distribution
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="Files" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Storage Optimization Box */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="font-semibold">Storage Optimization Tip:</span>{" "}
                <span>Review trashed or duplicate media files to free up quota.</span>
              </div>
            </div>

            {onOpenTrash && (
              <button
                onClick={onOpenTrash}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer transition-colors"
              >
                Empty Trash
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Space Consumers Widget */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            Largest Files in Drive
          </h3>
          <span className="text-xs text-slate-400">Sorted by file size</span>
        </div>

        {largestFiles.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">No files uploaded yet.</div>
        ) : (
          <div className="space-y-2">
            {largestFiles.map((file, idx) => {
              const typeInfo = getFileTypeInfo(file.mimeType);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="font-mono text-xs font-bold text-slate-400 w-5">
                      #{idx + 1}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    {formatBytes(file.size)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
