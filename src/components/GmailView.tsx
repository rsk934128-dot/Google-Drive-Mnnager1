import React from "react";
import { GmailMessage } from "../types";
import { Mail, Star, Clock, User, Reply, Forward, MoreVertical } from "lucide-react";

interface GmailViewProps {
  messages: GmailMessage[];
  loading: boolean;
  onRefresh: () => void;
  onCompose: () => void;
  onSelectMessage: (threadId: string) => void;
}

export const GmailView: React.FC<GmailViewProps> = ({ messages, loading, onRefresh, onCompose, onSelectMessage }) => {
  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading your inbox...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in zoom-in-95 duration-500">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
          <img 
            src="/src/assets/images/gmail_hero_illustration_1789047482471.jpg" 
            alt="Empty Inbox" 
            className="relative w-72 h-auto rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800"
            referrerPolicy="no-referrer"
          />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your inbox is clean</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          No messages found. Take a moment to enjoy the peace or check back later for new updates.
        </p>
        <div className="flex items-center gap-3 mt-8">
          <button 
            onClick={onCompose}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer"
          >
            Compose Email
          </button>
          <button 
            onClick={onRefresh}
            className="px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-semibold border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            Refresh Inbox
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Recent Messages</h3>
        <button
          onClick={onCompose}
          className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Mail className="w-4 h-4" />
          <span>Compose</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            onClick={() => onSelectMessage(msg.threadId)}
            className="group flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative"
          >
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <User className="w-5 h-5" />
              </div>
            </div>
            
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {msg.from?.split("<")[0].trim() || "Unknown"}
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {msg.date ? new Date(msg.date).toLocaleDateString() : ""}
                </span>
              </div>
              
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {msg.subject || "(No Subject)"}
              </h4>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                {msg.snippet}
              </p>
              
              <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500 transition-colors">
                  <Reply className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500 transition-colors">
                  <Forward className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-amber-500 transition-colors">
                  <Star className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button className="shrink-0 p-1.5 text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors self-center">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};
