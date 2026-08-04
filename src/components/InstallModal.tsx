import React, { useState, useEffect } from "react";
import {
  Download,
  Smartphone,
  Monitor,
  X,
  CheckCircle2,
  Sparkles,
  Share,
  PlusSquare,
  ArrowRight,
  ShieldCheck,
  Laptop
} from "lucide-react";

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"mobile" | "desktop">("mobile");
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running as standalone (PWA installed)
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(isIosDevice);
    if (isIosDevice) {
      setActiveTab("mobile");
    } else if (!/mobile|android/i.test(ua)) {
      setActiveTab("desktop");
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/app_logo_1785870607984.jpg"
              alt="App Logo"
              className="w-12 h-12 rounded-xl object-cover shadow-md ring-2 ring-blue-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Google Drive AI Manager
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full">
                  App
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                মোবাইল ও কম্পিউটারে অ্যাপটি সহজে ইনস্টল করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Mobile vs Desktop */}
        <div className="px-6 pt-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("mobile")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                activeTab === "mobile"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>মোবাইল ডিভাইস (Android / iOS)</span>
            </button>
            <button
              onClick={() => setActiveTab("desktop")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                activeTab === "desktop"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>কম্পিউটার (Windows / Mac)</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-4">
          {isInstalled ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">
                অ্যাপটি সফলভাবে আপনার ডিভাইসে ইনস্টল করা আছে!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                এখন সরাসরি আপনার হোম স্ক্রিন বা অ্যাপ লিস্ট থেকে ব্যবহার করতে পারবেন।
              </p>
            </div>
          ) : (
            <>
              {/* One Click Direct Install Button if available */}
              {deferredPrompt && (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-blue-900 dark:text-blue-300 text-sm">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span>১-ক্লিক অ্যাপ ইনস্টল প্রস্তুত</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      কোনো ডাউনলোড ছাড়াই সরাসরি অ্যাপ হিসেবে আপনার ডিভাইসে রাখুন।
                    </p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>ইনস্টল করুন</span>
                  </button>
                </div>
              )}

              {/* Mobile Tab Instructions */}
              {activeTab === "mobile" && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {isIOS ? "iOS (iPhone / iPad) এ ইনস্টল নির্দেশিকা:" : "Android ডিভাইসে ইনস্টল নির্দেশিকা:"}
                  </h4>

                  {isIOS ? (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl space-y-2 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          ১
                        </span>
                        <p className="flex items-center gap-1">
                          Safari ব্রাউজারের নিচে <strong>Share (শেয়ার)</strong> বাটন ক্লিক করুন <Share className="w-3.5 h-3.5 inline text-blue-500" />
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          ২
                        </span>
                        <p className="flex items-center gap-1">
                          মেনু থেকে <strong>"Add to Home Screen" (হোম স্ক্রিনে যোগ করুন)</strong> নির্বাচন করুন <PlusSquare className="w-3.5 h-3.5 inline text-blue-500" />
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          ৩
                        </span>
                        <p>উপরে ডান দিকে <strong>"Add"</strong> বাটনে ট্যাপ করলেই অ্যাপ তৈরি হয়ে যাবে!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl space-y-2 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          ১
                        </span>
                        <p>ব্রাউজারের ডানদিকের ৩-ডট মেনুতে (⋮) ক্লিক করুন।</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          ২
                        </span>
                        <p><strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> নির্বাচন করুন।</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          ৩
                        </span>
                        <p>কনফার্ম করতেই আপনার ফোনের হোম স্ক্রিনে অ্যাপের আইকন যুক্ত হবে!</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Desktop Tab Instructions */}
              {activeTab === "desktop" && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    কম্পিউটার (Chrome, Edge, Mac, Windows) এ ইনস্টল নির্দেশিকা:
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl space-y-2 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        ১
                      </span>
                      <p>আপনার ব্রাউজারের অ্যাড্রেস বারের ডান কোণায় <strong>Install Icon (ডাউনলোড বাটন)</strong> দেখুন।</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        ২
                      </span>
                      <p>অথবা ব্রাউজারের ৩-ডট (⋮) মেনু থেকে <strong>"Save and Share" ➔ "Install Google Drive AI Manager"</strong> নির্বাচন করুন।</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        ৩
                      </span>
                      <p>ইনস্টল হয়ে গেলে একটি আলাদা ডেস্কটপ উইন্ডোতে ফুল-স্ক্রিন অ্যাপ হিসেবে চমৎকারভাবে চলবে!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>দ্রুত ও অফলাইন রেডি</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Laptop className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>রেসপনসিভ অল ডিভাইস</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
