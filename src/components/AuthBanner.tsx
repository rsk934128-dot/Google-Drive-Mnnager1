import React from "react";
import { LogIn, ShieldCheck, HardDrive, Sparkles, ExternalLink, Play, Download, Smartphone } from "lucide-react";

interface AuthBannerProps {
  onLogin: () => void;
  onDemoMode: () => void;
  onOpenInstallModal?: () => void;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({ onLogin, onDemoMode, onOpenInstallModal }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center max-w-xl mx-auto animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full animate-pulse" />
        <img
          src="/src/assets/images/welcome_illustration_1789047495953.jpg"
          alt="Welcome"
          className="relative w-80 h-auto rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative mb-6">
        <img
          src="/icon-192.png"
          alt="Google Drive AI Logo"
          className="w-20 h-20 rounded-2xl object-cover shadow-2xl ring-4 ring-blue-500/20 dark:ring-blue-400/30 animate-pulse"
        />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
        Connect Your Google Drive
      </h2>

      <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
        Sign in with your Google account to access, view, search, upload, and organize your live Google Drive files.
      </p>

      {/* 403 Guidance Notice */}
      <div className="w-full bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-4 mb-6 text-left space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 dark:text-blue-300">
          <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Iframe / Webview Note (403 Fix)</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
          Google strictly blocks OAuth login inside embedded webviews/iframes (showing "403 Access Denied"). The login button below will open in a new window to guarantee login success, or you can click "Try Demo Mode" to instantly test all app features!
        </p>
      </div>

      <div className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 mb-8 text-left space-y-2.5">
        <div className="flex items-center gap-3 text-xs font-medium text-slate-700 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Direct secure connection via Google OAuth2</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-700 dark:text-slate-200">
          <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
          <span>Gemini AI file summarizer & smart folder organizer</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <button
          onClick={onLogin}
          className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign in with Google (New Window)</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </button>

        <button
          onClick={onDemoMode}
          className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-sm border border-slate-700 shadow-md transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          <span>Explore Demo Mode (Sample Drive)</span>
        </button>
      </div>

      {onOpenInstallModal && (
        <button
          onClick={onOpenInstallModal}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>মোবাইল ও কম্পিউটারে অ্যাপটি ইনস্টল করুন (Install App)</span>
        </button>
      )}
    </div>
  );
};

