import React from "react";
import {
  Folder,
  Star,
  FileText,
  Table,
  Image as ImageIcon,
  FolderPlus,
  Upload,
  Trash2,
  HardDrive,
  Cloud,
  LogOut,
  LogIn,
  Users,
  PieChart,
  Download,
  X,
  Keyboard,
  Clock,
  History,
  FileUp,
  Trash,
  ArrowRightLeft,
  Undo,
  Mail,
} from "lucide-react";
import { FilterCategory, StorageQuota, UserProfile, Activity } from "../types";
import { formatBytes } from "../lib/driveUtils";

interface SidebarProps {
  currentFilter: FilterCategory;
  onSelectFilter: (filter: FilterCategory) => void;
  onOpenNewFolderModal: () => void;
  onOpenUploadModal: () => void;
  quota: StorageQuota | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenInstallModal?: () => void;
  onOpenShortcuts?: () => void;
  activities?: Activity[];
  viewMode?: "drive" | "gmail";
  onViewChange?: (view: "drive" | "gmail") => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onSelectFilter,
  onOpenNewFolderModal,
  onOpenUploadModal,
  quota,
  user,
  isAuthenticated,
  onLogin,
  onLogout,
  onOpenInstallModal,
  onOpenShortcuts,
  activities = [],
  viewMode = "drive",
  onViewChange,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: { id: FilterCategory; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "My Drive", icon: <Folder className="w-4 h-4" /> },
    { id: "starred", label: "Starred", icon: <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" /> },
    { id: "shared", label: "Shared with me", icon: <Users className="w-4 h-4 text-sky-500" /> },
    { id: "documents", label: "Documents", icon: <FileText className="w-4 h-4 text-indigo-500" /> },
    { id: "spreadsheets", label: "Spreadsheets", icon: <Table className="w-4 h-4 text-emerald-500" /> },
    { id: "images", label: "Images", icon: <ImageIcon className="w-4 h-4 text-purple-500" /> },
    { id: "analytics", label: "Storage Analytics", icon: <PieChart className="w-4 h-4 text-rose-500" /> },
    { id: "trashed", label: "Trash", icon: <Trash2 className="w-4 h-4 text-slate-500" /> },
  ];

  const usageNum = quota?.usage ? parseInt(quota.usage, 10) : 0;
  const limitNum = quota?.limit ? parseInt(quota.limit, 10) : 0;
  const percentUsed = limitNum > 0 ? Math.min(Math.round((usageNum / limitNum) * 100), 100) : 0;

  const handleFilterClick = (filter: FilterCategory) => {
    onSelectFilter(filter);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarInner = (
    <div className="flex flex-col justify-between h-full w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 select-none overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Logo / Brand Header */}
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="Google Drive AI Manager Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-md border border-slate-200/50 dark:border-slate-700/50"
            />
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-tight">
                Drive Manager
              </h1>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Google Drive AI</p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        {isAuthenticated && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenUploadModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm cursor-pointer min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>

            <button
              onClick={() => {
                onOpenNewFolderModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-xs transition-colors shadow-xs cursor-pointer min-h-[44px]"
            >
              <FolderPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Folder</span>
            </button>
          </div>
        )}

        {/* Workspace Switcher */}
        <nav className="space-y-1">
          <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          <button
            onClick={() => onViewChange?.("drive")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer min-h-[40px] ${
              viewMode === "drive"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Google Drive</span>
          </button>
          <button
            onClick={() => onViewChange?.("gmail")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer min-h-[40px] ${
              viewMode === "gmail"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Gmail</span>
          </button>
        </nav>

        {/* Navigation Categories */}
        <nav className="space-y-1">
          <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {viewMode === "drive" ? "Files & Folders" : "Gmail Labels"}
          </div>
          {viewMode === "drive" ? (
            navItems.map((item) => {
              const isActive = currentFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleFilterClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer min-h-[44px] ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })
          ) : (
            <>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-semibold cursor-pointer min-h-[44px]">
                <Mail className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span>Inbox</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 cursor-pointer min-h-[44px]">
                <Star className="w-5 h-5 text-slate-400" />
                <span>Starred</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 cursor-pointer min-h-[44px]">
                <Clock className="w-5 h-5 text-slate-400" />
                <span>Snoozed</span>
              </button>
            </>
          )}
        </nav>

        {/* Recent Activity Panel */}
        {isAuthenticated && activities.length > 0 && (
          <div className="space-y-3 px-1">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <History className="w-3.5 h-3.5" />
                Recent Activity
              </div>
            </div>
            <div className="space-y-1">
              {activities.slice(0, 5).map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group cursor-default"
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                    activity.type === 'upload' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                    activity.type === 'delete' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' :
                    activity.type === 'move' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' :
                    activity.type === 'restore' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800'
                  }`}>
                    {activity.type === 'upload' && <FileUp className="w-3 h-3" />}
                    {activity.type === 'delete' && <Trash className="w-3 h-3" />}
                    {activity.type === 'move' && <ArrowRightLeft className="w-3 h-3" />}
                    {activity.type === 'restore' && <Undo className="w-3 h-3" />}
                    {(activity.type === 'rename' || activity.type === 'star' || activity.type === 'unstar' || activity.type === 'create_folder') && <Clock className="w-3 h-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate leading-tight">
                      {activity.fileName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1).replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer: User & Storage Status */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
        {/* Install App Promo Card */}
        {onOpenInstallModal && (
          <button
            onClick={() => {
              onOpenInstallModal();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full p-2.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20 dark:border-blue-400/20 rounded-xl flex items-center justify-between text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-xs group-hover:scale-105 transition-transform">
                <Download className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  অ্যাপ ইনস্টল করুন
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  মোবাইল ও পিসির জন্য
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
              Free
            </span>
          </button>
        )}

        {/* Storage Bar */}
        {isAuthenticated && quota && (
          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-blue-500" /> Storage
              </span>
              <span>{percentUsed}%</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  percentUsed > 90 ? "bg-rose-500" : percentUsed > 75 ? "bg-amber-500" : "bg-blue-600"
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {formatBytes(usageNum)} of {formatBytes(limitNum)} used
            </div>
          </div>
        )}

        {/* Account Info / Login Button */}
        <div className="space-y-1">
          {onOpenShortcuts && (
            <button
              onClick={() => {
                onOpenShortcuts();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer group"
            >
              <Keyboard className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-medium">Keyboard Shortcuts</span>
              <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                Ctrl+Shift+K
              </span>
            </button>
          )}

          {isAuthenticated ? (
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0">
                  {user?.name?.[0] || "U"}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || "Connected User"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              onLogin();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-sm transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>
        )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex shrink-0 h-full">
        {sidebarInner}
      </aside>

      {/* Mobile Drawer Slide-Over */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarInner}
          </div>
        </div>
      )}
    </>
  );
};
