import React, { useState } from "react";
import {
  X,
  Sparkles,
  Send,
  FolderPlus,
  Bot,
  User,
  Zap,
  ArrowRight,
  CheckCircle2,
  Folder,
  Loader2,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { DriveFile } from "../types";

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  files: DriveFile[];
  onCreateFoldersAndMove?: (folders: string[], categorization: any[]) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  files,
  onCreateFoldersAndMove,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your Gemini Drive AI Assistant. Ask me to organize your files, answer document questions, or optimize your storage!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  // Smart Organization State
  const [isOrganizing, setIsOrganizing] = useState<boolean>(false);
  const [organizeResult, setOrganizeResult] = useState<{
    categorization: any[];
    suggestedNewFolders: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          filesContext: files.map((f) => ({
            name: f.name,
            mimeType: f.mimeType,
            size: f.size,
          })),
        }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.reply || "I analyzed your request. Let me know if you need more help!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: "Sorry, I ran into an error processing your request. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleRunSmartOrganizer = async () => {
    setIsOrganizing(true);
    setOrganizeResult(null);

    try {
      const res = await fetch("/api/ai/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: files.map((f) => ({
            id: f.id,
            name: f.name,
            mimeType: f.mimeType,
          })),
        }),
      });

      const data = await res.json();
      setOrganizeResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleApplyOrganization = () => {
    if (!organizeResult || !onCreateFoldersAndMove) return;
    onCreateFoldersAndMove(
      organizeResult.suggestedNewFolders,
      organizeResult.categorization
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        id="ai-assistant-drawer"
        className="w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col justify-between animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-blue-900/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
                Gemini AI Drive Assistant
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Smart file organizer & document query bot
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Smart Folder Suggestion */}
        <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 border-b border-purple-100 dark:border-purple-900/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 dark:text-purple-200">
            <Lightbulb className="w-4 h-4 text-purple-600 shrink-0" />
            <span>AI Smart Organizer</span>
          </div>
          <button
            onClick={handleRunSmartOrganizer}
            disabled={isOrganizing || files.length === 0}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            {isOrganizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Suggest Folders</span>
              </>
            )}
          </button>
        </div>

        {/* Smart Folder Suggestion Result Card */}
        {organizeResult && (
          <div className="m-3 p-3.5 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-purple-500" />
                Suggested Folders ({organizeResult.suggestedNewFolders.length})
              </span>
              <button
                onClick={() => setOrganizeResult(null)}
                className="text-[10px] text-slate-400 hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {organizeResult.suggestedNewFolders.map((folder, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium flex items-center gap-1"
                >
                  <Folder className="w-3 h-3 text-purple-500" />
                  {folder}
                </span>
              ))}
            </div>

            <button
              onClick={handleApplyOrganization}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Auto-Organize Files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-purple-600 text-white shadow-xs"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-100 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-600/60 rounded-tl-none"
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1 text-right ${
                    msg.sender === "user" ? "text-blue-100" : "text-slate-400 dark:text-slate-400"
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic py-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              <span>Gemini is thinking...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask Gemini about your files..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 py-2 px-3.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
