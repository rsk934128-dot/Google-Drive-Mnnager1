import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

interface OfflineBannerProps {
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry }) => {
  const isOnline = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showRestored) {
    return null;
  }

  if (showRestored) {
    return (
      <div
        id="network-status-restored-banner"
        aria-live="polite"
        className="bg-emerald-600 text-white text-sm px-4 py-2.5 flex items-center justify-between shadow-md transition-all duration-300 z-50 sticky top-0"
      >
        <div className="flex items-center gap-2.5 mx-auto">
          <Wifi className="w-4 h-4 animate-bounce" />
          <span className="font-medium">
            Internet connection restored. You are back online.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="network-status-offline-banner"
      aria-live="assertive"
      className="bg-amber-600 dark:bg-amber-700 text-white text-sm px-4 py-2.5 flex items-center justify-between shadow-lg transition-all duration-300 z-50 sticky top-0"
    >
      <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-amber-700 dark:bg-amber-800 rounded-full">
            <WifiOff className="w-4 h-4 text-amber-100" />
          </div>
          <div>
            <span className="font-semibold">You are offline.</span>{" "}
            <span className="text-amber-100 hidden sm:inline">
              Check your internet connection. API requests and file operations are paused.
            </span>
          </div>
        </div>

        {onRetry && (
          <button
            id="network-status-retry-button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Check Connection
          </button>
        )}
      </div>
    </div>
  );
};
