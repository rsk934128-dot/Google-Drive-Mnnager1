import React from "react";
import { AppNotification } from "../types";
import { Bell, Mail, HardDrive, AlertTriangle, X, Check } from "lucide-react";
import { formatDate } from "../lib/driveUtils";

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
  onClose,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "gmail":
        return <Mail className="w-4 h-4 text-rose-500" />;
      case "drive":
        return <HardDrive className="w-4 h-4 text-blue-500" />;
      case "storage":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClearAll}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 font-medium">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No new notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group ${
                  !notification.read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold text-slate-900 dark:text-slate-100 truncate ${!notification.read ? "" : "opacity-70"}`}>
                        {notification.title}
                      </p>
                      <p className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                        {formatDate(new Date(notification.timestamp).toISOString())}
                      </p>
                    </div>
                    <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 ${!notification.read ? "" : "opacity-70"}`}>
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Real-time notifications enabled
          </p>
        </div>
      )}
    </div>
  );
};
