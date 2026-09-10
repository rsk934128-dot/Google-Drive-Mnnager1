import React, { useState, useEffect } from "react";
import { GmailThread, GmailMessageFull, GmailAttachment } from "../types";
import { 
  ArrowLeft, 
  User, 
  Send, 
  Loader2, 
  Reply, 
  Paperclip, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Music, 
  Video, 
  Archive, 
  ShieldAlert,
  Download
} from "lucide-react";
import Markdown from "react-markdown";
import { formatBytes, getFileTypeInfo } from "../lib/driveUtils";

interface GmailThreadViewProps {
  threadId: string;
  onBack: () => void;
  onSendReply: (threadId: string, to: string, subject: string, body: string) => Promise<void>;
}

export const GmailThreadView: React.FC<GmailThreadViewProps> = ({ threadId, onBack, onSendReply }) => {
  const [thread, setThread] = useState<GmailThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAttachmentIcon = (mimeType: string) => {
    const info = getFileTypeInfo(mimeType);
    switch (info.type) {
      case "image": return <ImageIcon className="w-4 h-4" />;
      case "doc": return <FileText className="w-4 h-4" />;
      case "pdf": return <FileText className="w-4 h-4" />;
      case "sheet": return <FileText className="w-4 h-4" />;
      case "slide": return <FileText className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "audio": return <Music className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    fetchThread();
  }, [threadId]);

  const fetchThread = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gmail/threads/${threadId}`);
      if (!res.ok) throw new Error("Failed to load conversation");
      const data = await res.json();
      setThread(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !thread) return;

    setIsSending(true);
    try {
      const lastMsg = thread.messages[thread.messages.length - 1];
      const to = lastMsg.from || "";
      const subject = lastMsg.subject?.startsWith("Re:") ? lastMsg.subject : `Re: ${lastMsg.subject}`;
      
      await onSendReply(thread.id, to, subject, replyBody);
      setReplyBody("");
      fetchThread(); // Refresh thread to show new message
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading conversation...</p>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-100 dark:border-rose-800">
        <p className="text-rose-600 font-medium mb-4">{error || "Thread not found"}</p>
        <button onClick={onBack} className="text-sm font-bold text-slate-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
            {thread.messages[0]?.subject || "(No Subject)"}
          </h2>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            {thread.messages.length} {thread.messages.length === 1 ? "Message" : "Messages"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {thread.messages.map((msg, idx) => (
          <div 
            key={msg.id} 
            className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                    {msg.from || "Unknown"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {msg.date ? new Date(msg.date).toLocaleString() : ""}
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-bold px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
                #{idx + 1}
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {msg.body ? (
                   <div dangerouslySetInnerHTML={{ __html: msg.body }} />
                ) : (
                  <p className="italic text-slate-400">{msg.snippet}</p>
                )}
              </div>

              {msg.attachments && msg.attachments.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Attachments ({msg.attachments.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {msg.attachments.map((att) => {
                      const typeInfo = getFileTypeInfo(att.mimeType);
                      return (
                        <div 
                          key={att.attachmentId}
                          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 group/att transition-all hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${typeInfo.color}`}>
                            {getAttachmentIcon(att.mimeType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {att.filename}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formatBytes(att.size)}
                            </p>
                          </div>
                          <div className="opacity-0 group-hover/att:opacity-100 transition-opacity">
                            <Download className="w-4 h-4 text-slate-400 hover:text-blue-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reply Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 mt-8 sticky bottom-4 z-10 animate-in slide-in-from-bottom-4 duration-500">
        <form onSubmit={handleReply} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Reply className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Reply</span>
          </div>
          
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Type your reply here..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none dark:text-slate-100 min-h-[120px]"
            required
          />
          
          <div className="flex items-center justify-between gap-4">
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={isSending || !replyBody.trim()}
              className="flex items-center gap-2 px-8 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Reply</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
