import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  UserPlus,
  Trash2,
  ChevronDown,
  ShieldCheck,
  Send,
  Users,
} from "lucide-react";
import { DriveFile, FilePermission } from "../types";

interface ShareModalProps {
  file: DriveFile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePermissions?: (fileId: string, permissions: FilePermission[]) => void;
  onShareSuccess?: (fileName: string, email: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  file,
  isOpen,
  onClose,
  onShareSuccess,
}) => {
  const [emailInput, setEmailInput] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"reader" | "commenter" | "writer">("reader");
  const [accessType, setAccessType] = useState<"restricted" | "anyone">("restricted");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Mock initial access list based on file owners or defaults
  const [peopleWithAccess, setPeopleWithAccess] = useState<FilePermission[]>([
    {
      id: "perm-owner",
      role: "owner",
      type: "user",
      emailAddress: file?.owners?.[0]?.emailAddress || "owner@example.com",
      displayName: file?.owners?.[0]?.displayName || "You (Owner)",
    },
    {
      id: "perm-1",
      role: "writer",
      type: "user",
      emailAddress: "colleague@workspace.com",
      displayName: "Workspace Team Member",
    },
  ]);

  if (!isOpen || !file) return null;

  const shareableUrl = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddPeople = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newPerm: FilePermission = {
        id: `perm-${Date.now()}`,
        role: selectedRole,
        type: "user",
        emailAddress: emailInput.trim(),
        displayName: emailInput.trim().split("@")[0],
      };

      setPeopleWithAccess((prev) => [...prev, newPerm]);
      const email = emailInput.trim();
      setEmailInput("");
      setIsSubmitting(false);
      setSuccessMessage(`Access granted to ${email}`);
      if (onShareSuccess && file) {
        onShareSuccess(file.name, email);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 600);
  };

  const handleRemovePeople = (permId: string) => {
    setPeopleWithAccess((prev) => prev.filter((p) => p.id !== permId));
  };

  const handleRoleChange = (permId: string, newRole: "reader" | "commenter" | "writer") => {
    setPeopleWithAccess((prev) =>
      prev.map((p) => (p.id === permId ? { ...p, role: newRole } : p))
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        id="share-file-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Share "{file.name}"
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage access and email permissions
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

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Add People Form */}
        <form onSubmit={handleAddPeople} className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Add People and Groups
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <UserPlus className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Enter email address..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="reader">Viewer</option>
              <option value="commenter">Commenter</option>
              <option value="writer">Editor</option>
            </select>

            <button
              type="submit"
              disabled={isSubmitting || !emailInput.trim()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>

        {/* People with Access List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>People with access</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {peopleWithAccess.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                    {person.displayName?.[0] || person.emailAddress?.[0] || "U"}
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {person.displayName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{person.emailAddress}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {person.role === "owner" ? (
                    <span className="text-[11px] font-semibold text-slate-400 px-2 py-1 bg-slate-200/60 dark:bg-slate-800 rounded-md">
                      Owner
                    </span>
                  ) : (
                    <>
                      <select
                        value={person.role}
                        onChange={(e) => handleRoleChange(person.id, e.target.value as any)}
                        className="py-1 px-2 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="reader">Viewer</option>
                        <option value="commenter">Commenter</option>
                        <option value="writer">Editor</option>
                      </select>

                      <button
                        onClick={() => handleRemovePeople(person.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Remove access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Access Link Settings */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            General Access
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {accessType === "restricted" ? (
                  <Lock className="w-4 h-4 text-amber-500" />
                ) : (
                  <Globe className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {accessType === "restricted" ? "Restricted" : "Anyone with the link"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {accessType === "restricted"
                    ? "Only people added can open with this link"
                    : "Anyone on the Internet with this link can view"}
                </p>
              </div>
            </div>

            <select
              value={accessType}
              onChange={(e) => setAccessType(e.target.value as any)}
              className="py-1 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
            >
              <option value="restricted">Restricted</option>
              <option value="anyone">Anyone with link</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
