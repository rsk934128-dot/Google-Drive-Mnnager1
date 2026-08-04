import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  FileText,
  Tag,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Zap,
} from "lucide-react";
import { DriveFile } from "../types";

interface AiSummaryModalProps {
  file: DriveFile | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SummaryData {
  summary: string;
  keyTakeaways: string[];
  suggestedTags: string[];
  category: string;
}

export const AiSummaryModal: React.FC<AiSummaryModalProps> = ({
  file,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.mimeType,
          description: file.description,
          textSnippet: `File ID ${file.id} created/modified at ${file.modifiedTime || "recently"}.`,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch summary");
      const data = await res.json();
      setSummaryData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate AI summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && file) {
      fetchSummary();
    } else {
      setSummaryData(null);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const handleCopySummary = () => {
    if (!summaryData) return;
    const text = `AI Summary for ${file.name}:\n${summaryData.summary}\n\nKey Takeaways:\n${summaryData.keyTakeaways.map((t) => `• ${t}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        id="ai-summary-modal"
        className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Gemini AI Summary
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                Analyzing "{file.name}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-2xl">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Generating smart AI summary...
            </p>
            <p className="text-[11px] text-slate-400">Extracting key insights and categories</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchSummary}
              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        ) : summaryData ? (
          <div className="space-y-5">
            {/* Category Tag & Executive Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Executive Summary
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  📁 {summaryData.category}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {summaryData.summary}
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Key Takeaways
              </span>
              <ul className="space-y-2">
                {summaryData.keyTakeaways.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-500" />
                AI Suggested Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {summaryData.suggestedTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 rounded-lg text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/80 pt-4">
          <button
            onClick={handleCopySummary}
            disabled={!summaryData}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
