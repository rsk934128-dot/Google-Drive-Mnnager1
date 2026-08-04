import React, { useState, useEffect } from "react";
import { Search, LayoutGrid, List, RefreshCw, X, Sparkles, User, Check, Plus, ChevronDown, ShieldCheck, Download, Smartphone, Menu } from "lucide-react";
import { ViewMode, UserProfile } from "../types";

interface AccountOption {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: "Work" | "Personal" | "Student";
}

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  user: UserProfile | null;
  onOpenAiAssistant?: () => void;
  onSwitchAccount?: (account: AccountOption) => void;
  onOpenInstallModal?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  isRefreshing,
  user,
  onOpenAiAssistant,
  onSwitchAccount,
  onOpenInstallModal,
  onOpenMobileMenu,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false);

  const accounts: AccountOption[] = [
    {
      id: "acc-primary",
      name: user?.name || "Primary Google User",
      email: user?.email || "khokumoni30@gmail.com",
      avatar: user?.picture,
      type: "Personal",
    },
    {
      id: "acc-work",
      name: "Workspace Pro Account",
      email: "work.workspace@company.com",
      type: "Work",
    },
    {
      id: "acc-student",
      name: "Academic Research Drive",
      email: "student.research@university.edu",
      type: "Student",
    },
  ];

  const [activeAccountId, setActiveAccountId] = useState<string>("acc-primary");

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchChange(localQuery);
    }
  };

  const handleClear = () => {
    setLocalQuery("");
    onSearchChange("");
  };

  const handleSelectAccount = (acc: AccountOption) => {
    setActiveAccountId(acc.id);
    setShowAccountMenu(false);
    if (onSwitchAccount) {
      onSwitchAccount(acc);
    }
  };

  const activeAcc = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3 sticky top-0 z-20">
      {/* Mobile Menu Button */}
      {onOpenMobileMenu && (
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Search Input */}
      <div className="relative flex-1 max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search files and folders in Google Drive..."
          className="w-full pl-10 pr-9 py-2 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm rounded-xl focus:outline-hidden transition-all"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Install App Button */}
        {onOpenInstallModal && (
          <button
            onClick={onOpenInstallModal}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="অ্যাপ ইনস্টল করুন (মোবাইল/কম্পিউটার)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ইনস্টল করুন</span>
          </button>
        )}

        {/* Gemini AI Trigger Button */}
        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/10 transition-all cursor-pointer animate-in fade-in"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">AI Drive Assistant</span>
          </button>
        )}

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Drive"
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Account Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            {activeAcc.avatar ? (
              <img
                src={activeAcc.avatar}
                alt={activeAcc.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/40"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {activeAcc.name[0]}
              </div>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Account Dropdown Menu */}
          {showAccountMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/80">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Google Accounts
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                  {activeAcc.email}
                </p>
              </div>

              <div className="py-1 space-y-1">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      acc.id === activeAccountId
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        {acc.name[0]}
                      </div>
                      <div className="truncate">
                        <p className="font-medium truncate">{acc.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{acc.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                        {acc.type}
                      </span>
                      {acc.id === activeAccountId && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700/80 pt-1.5 mt-1">
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    alert("Add Google Account option selected. You can sign in to another Google Workspace profile!");
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-400" />
                  <span>Add another Google Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

