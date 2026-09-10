import { useState, useEffect, useCallback, useRef } from "react";
import { auth, db } from "./lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Breadcrumb } from "./components/Breadcrumb";
import { FileCard } from "./components/FileCard";
import { FileTableRow } from "./components/FileTableRow";
import { FileDetailsModal } from "./components/FileDetailsModal";
import { FilePreviewModal } from "./components/FilePreviewModal";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { MobileActionSheet } from "./components/MobileActionSheet";
import { ShareModal } from "./components/ShareModal";
import { StorageAnalytics } from "./components/StorageAnalytics";
import { AiAssistantDrawer } from "./components/AiAssistantDrawer";
import { AiSummaryModal } from "./components/AiSummaryModal";
import { NewFolderModal } from "./components/NewFolderModal";
import { UploadModal } from "./components/UploadModal";
import { MoveModal } from "./components/MoveModal";
import { BatchSelectionBar } from "./components/BatchSelectionBar";
import { AuthBanner } from "./components/AuthBanner";
import { InstallModal } from "./components/InstallModal";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { GmailView } from "./components/GmailView";
import { GmailThreadView } from "./components/GmailThreadView";
import { ComposeEmailModal } from "./components/ComposeEmailModal";
import {
  DriveFile,
  UserProfile,
  StorageQuota,
  FilterCategory,
  ViewMode,
  BreadcrumbItem,
  Activity,
  ActivityType,
  GmailMessage,
  AppNotification,
} from "./types";
import { Loader2, Folder, HardDrive, AlertCircle, Check, WifiOff, Cloud, Clock, Mail } from "lucide-react";

const DEMO_FILES: DriveFile[] = [
  {
    id: "demo-folder-1",
    name: "Project Documentation & Specs",
    mimeType: "application/vnd.google-apps.folder",
    modifiedTime: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    starred: true,
  },
  {
    id: "demo-folder-2",
    name: "Financial Reports & Invoices",
    mimeType: "application/vnd.google-apps.folder",
    modifiedTime: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: "demo-file-1",
    name: "Q3 Product Roadmap & Strategy.pdf",
    mimeType: "application/pdf",
    size: "4250000",
    modifiedTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    starred: true,
    description: "Complete product roadmap and strategic plan for Q3 deployment.",
    owners: [{ displayName: "Google Drive User", emailAddress: "khokumoni30@gmail.com" }],
    shared: true,
  },
  {
    id: "demo-file-2",
    name: "Quarterly Budget & Revenue.xlsx",
    mimeType: "application/vnd.google-apps.spreadsheet",
    size: "1850000",
    modifiedTime: new Date(Date.now() - 3600000 * 12).toISOString(),
    starred: false,
    owners: [{ displayName: "Finance Team", emailAddress: "finance@company.com" }],
  },
  {
    id: "demo-file-3",
    name: "Architecture & System Diagram.png",
    mimeType: "image/png",
    size: "3400000",
    thumbnailLink: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80",
    modifiedTime: new Date(Date.now() - 3600000 * 36).toISOString(),
    starred: true,
  },
  {
    id: "demo-file-4",
    name: "Team All-Hands Presentation.pptx",
    mimeType: "application/vnd.google-apps.presentation",
    size: "12400000",
    modifiedTime: new Date(Date.now() - 3600000 * 48).toISOString(),
    starred: false,
  },
  {
    id: "demo-file-5",
    name: "Keynote Recording 2026.mp4",
    mimeType: "video/mp4",
    size: "85000000",
    modifiedTime: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: "demo-file-6",
    name: "Voice Note - Product Brainstorming.mp3",
    mimeType: "audio/mp3",
    size: "5200000",
    modifiedTime: new Date(Date.now() - 3600000 * 96).toISOString(),
  }
];

const DEMO_QUOTA: StorageQuota = {
  limit: "16106127360", // 15 GB
  usage: "4831838208", // 4.5 GB
  usageInDrive: "3221225472",
  usageInDriveTrash: "536870912",
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentFilter, setCurrentFilter] = useState<FilterCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: "My Drive" },
  ]);

  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [shareFile, setShareFile] = useState<DriveFile | null>(null);
  const [activeMobileActionFile, setActiveMobileActionFile] = useState<DriveFile | null>(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Multi-select state
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState<boolean>(false);
  const [batchActionLoading, setBatchActionLoading] = useState<boolean>(false);

  // Phase 3 States: AI Assistant, Summaries, Offline Mode & Multi-Account
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [summaryFile, setSummaryFile] = useState<DriveFile | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appView, setAppView] = useState<"drive" | "gmail">("drive");
  const [gmailMessages, setGmailMessages] = useState<GmailMessage[]>([]);
  const [loadingGmail, setLoadingGmail] = useState<boolean>(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState<boolean>(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // Save user profile to Firestore
        const userDoc = doc(db, "users", user.uid);
        setDoc(userDoc, {
          name: user.displayName,
          email: user.email,
          picture: user.photoURL,
          lastLogin: serverTimestamp(),
        }, { merge: true });

        // Subscribe to activities
        const qAct = query(
          collection(db, "activities", user.uid, "items"),
          orderBy("timestamp", "desc")
        );
        const unsubscribeActivities = onSnapshot(qAct, (snapshot) => {
          const loadedActivities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toMillis() || Date.now(),
          })) as Activity[];
          setActivities(loadedActivities);
        });

        // Subscribe to notifications
        const qNotif = query(
          collection(db, "notifications", user.uid, "items"),
          orderBy("timestamp", "desc")
        );
        const unsubscribeNotifications = onSnapshot(qNotif, (snapshot) => {
          const loadedNotifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toMillis() || Date.now(),
          })) as AppNotification[];
          setNotifications(loadedNotifications);
        });

        return () => {
          unsubscribeActivities();
          unsubscribeNotifications();
        };
      } else {
        setActivities([]);
        setNotifications([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const addNotification = useCallback(async (title: string, message: string, type: AppNotification["type"], link?: string) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(collection(db, "notifications", user.uid, "items"), {
          title,
          message,
          type,
          read: false,
          timestamp: serverTimestamp(),
          link: link || "",
        });
      } catch (e) {
        console.error("Error adding notification:", e);
      }
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, "notifications", user.uid, "items", id), {
          read: true
        }, { merge: true });
      } catch (e) {
        console.error("Error marking notification as read:", e);
      }
    }
  }, []);

  const clearNotifications = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const q = query(collection(db, "notifications", user.uid, "items"));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      } catch (e) {
        console.error("Error clearing notifications:", e);
      }
    }
  }, []);

  const addActivity = useCallback(async (type: ActivityType, fileName: string, details?: string) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(collection(db, "activities", user.uid, "items"), {
          type,
          fileName,
          timestamp: serverTimestamp(),
          details: details || "",
        });
      } catch (e) {
        console.error("Error adding activity to Firestore:", e);
      }
    } else {
      // Fallback to local storage if not logged in (demo mode)
      const newActivity: Activity = {
        id: Math.random().toString(36).substring(7),
        type,
        fileName,
        timestamp: Date.now(),
        details,
      };
      setActivities((prev) => {
        const updated = [newActivity, ...prev].slice(0, 50);
        localStorage.setItem("drive_manager_activities", JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Helper to build headers with token fallback for iframe environments
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {};
    const accessToken = localStorage.getItem("drive_access_token");
    const refreshToken = localStorage.getItem("drive_refresh_token");
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    if (refreshToken) headers["x-refresh-token"] = refreshToken;
    return headers;
  }, []);

  // Check auth status
  const checkAuth = useCallback(async () => {
    setCheckingAuth(true);
    try {
      // Check query params in URL if coming back from OAuth redirect
      const urlParams = new URLSearchParams(window.location.search);
      const accToken = urlParams.get("access_token");
      const refToken = urlParams.get("refresh_token");
      if (accToken) localStorage.setItem("drive_access_token", accToken);
      if (refToken) localStorage.setItem("drive_refresh_token", refToken);

      if (urlParams.get("auth_success") === "true") {
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const res = await fetch("/auth/me", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        setIsDemoMode(false);
        setUser(data.user || null);
        if (data.accessToken) localStorage.setItem("drive_access_token", data.accessToken);
        if (data.refreshToken) localStorage.setItem("drive_refresh_token", data.refreshToken);
      } else {
        // Check if demo mode was previously enabled
        const savedDemo = localStorage.getItem("gdrive_demo_mode");
        if (savedDemo === "true") {
          setIsAuthenticated(true);
          setIsDemoMode(true);
          setUser({ name: "Demo Google User", email: "khokumoni30@gmail.com" });
          setQuota(DEMO_QUOTA);
          setFiles(DEMO_FILES);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (err) {
      console.error("Failed auth check:", err);
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  }, [getAuthHeaders]);

  // Listen for OAuth postMessage from popup window
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "oauth_success") {
        if (e.data.accessToken) localStorage.setItem("drive_access_token", e.data.accessToken);
        if (e.data.refreshToken) localStorage.setItem("drive_refresh_token", e.data.refreshToken);
        localStorage.removeItem("gdrive_demo_mode");
        checkAuth();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checkAuth]);

  // Load Drive About/Quota info
  const loadDriveAbout = useCallback(async () => {
    if (isDemoMode) {
      setQuota(DEMO_QUOTA);
      return;
    }
    try {
      const res = await fetch("/api/drive/about", {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const q = data.storageQuota || null;
        setQuota(q);

        // Storage Warning Notification
        if (q && q.limit && q.usage) {
          const limitNum = parseInt(q.limit, 10);
          const usageNum = parseInt(q.usage, 10);
          if (limitNum > 0 && (usageNum / limitNum) > 0.9) {
            addNotification(
              "Storage Warning",
              `Your Google Drive is almost full (${Math.round((usageNum/limitNum)*100)}%). Please consider clearing some space.`,
              "storage"
            );
          }
        }
        
        if (data.user && !user) {
          setUser({
            name: data.user.displayName,
            email: data.user.emailAddress,
            picture: data.user.photoLink,
          });
        }
      }
    } catch (err) {
      console.warn("Failed to load drive about info:", err);
    }
  }, [getAuthHeaders, isDemoMode, user]);

  // Load Files
  const loadFiles = useCallback(async () => {
    if (!isAuthenticated) return;
    if (isDemoMode) {
      setLoadingFiles(false);
      return;
    }
    setLoadingFiles(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      } else if (currentFilter !== "all") {
        params.set("filter", currentFilter);
      } else {
        params.set("folderId", currentFolderId);
      }

      const res = await fetch(`/api/drive/files?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          throw new Error("Session expired. Please sign in again.");
        }
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch files from Google Drive.");
      }

      const data = await res.json();
      const fetchedFiles = data.files || [];
      setFiles(fetchedFiles);
      try {
        localStorage.setItem("gdrive_cached_files", JSON.stringify(fetchedFiles));
      } catch {}
    } catch (err: any) {
      // Offline fallback: load cached files from LocalStorage if available
      const cached = localStorage.getItem("gdrive_cached_files");
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          setFiles(parsedCache);
          setError("Offline Mode: Displaying cached Google Drive metadata.");
          return;
        } catch {}
      }
      setError(err.message || "An error occurred while loading files.");
    } finally {
      setLoadingFiles(false);
    }
  }, [isAuthenticated, isDemoMode, currentFilter, currentFolderId, searchQuery, getAuthHeaders]);

  const lastMessageIdRef = useRef<string | null>(null);

  const loadGmailMessages = useCallback(async () => {
    if (!isAuthenticated || isDemoMode) return;
    setLoadingGmail(true);
    try {
      const res = await fetch("/api/gmail/messages", {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const messages = data.messages || [];
        setGmailMessages(messages);

        // Notify if there's a new message
        if (messages.length > 0 && lastMessageIdRef.current !== messages[0].id) {
          if (lastMessageIdRef.current !== null) {
            addNotification(
              "New Gmail Message",
              `From: ${messages[0].from?.split("<")[0].trim() || "Unknown"}\nSubject: ${messages[0].subject}`,
              "gmail",
              messages[0].threadId
            );
          }
          lastMessageIdRef.current = messages[0].id;
        }
      }
    } catch (err) {
      console.error("Gmail load error:", err);
    } finally {
      setLoadingGmail(false);
    }
  }, [isAuthenticated, isDemoMode, getAuthHeaders, addNotification]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDriveAbout();
      if (appView === "drive") {
        loadFiles();
      }
    }
  }, [isAuthenticated, appView, loadDriveAbout, loadFiles]);

  useEffect(() => {
    if (isAuthenticated && appView === "gmail") {
      loadGmailMessages();
      const interval = setInterval(loadGmailMessages, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, appView, loadGmailMessages]);

  // Handlers
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      
      const isIframe = window.self !== window.top;
      if (isIframe) {
        const popup = window.open(
          "/auth/google",
          "google_oauth_popup",
          `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
        );
        if (!popup || popup.closed || typeof popup.closed === "undefined") {
          window.open("/auth/google", "_blank");
        }
      } else {
        window.location.href = "/auth/google";
      }
    } catch (error) {
      console.error("Firebase Login Error:", error);
    }
  };

  const handleDemoMode = () => {
    localStorage.setItem("gdrive_demo_mode", "true");
    setIsAuthenticated(true);
    setIsDemoMode(true);
    setUser({ name: "Demo Google User", email: "khokumoni30@gmail.com" });
    setQuota(DEMO_QUOTA);
    setFiles(DEMO_FILES);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await fetch("/auth/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("drive_access_token");
    localStorage.removeItem("drive_refresh_token");
    localStorage.removeItem("gdrive_demo_mode");
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setUser(null);
    setFiles([]);
    setQuota(null);
  };

  const handleFilterSelect = (filter: FilterCategory) => {
    setSelectedFileIds([]);
    setCurrentFilter(filter);
    setSearchQuery("");
    if (filter === "all") {
      setCurrentFolderId("root");
      setBreadcrumbs([{ id: "root", name: "My Drive" }]);
    }
  };

  const handleOpenFolder = (folderId: string, folderName: string) => {
    setSelectedFileIds([]);
    setCurrentFilter("all");
    setSearchQuery("");
    setCurrentFolderId(folderId);
    setBreadcrumbs((prev) => [...prev, { id: folderId, name: folderName }]);
  };

  const handleBreadcrumbNavigate = (folderId: string, index: number) => {
    setSelectedFileIds([]);
    setCurrentFilter("all");
    setSearchQuery("");
    setCurrentFolderId(folderId);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  // Selection handlers
  const handleToggleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedFileIds.length === files.length && files.length > 0) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map((f) => f.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedFileIds([]);
  };

  const handleBatchDelete = useCallback(async () => {
    if (selectedFileIds.length === 0) return;
    const isPermanent = currentFilter === "trashed";
    const confirmMsg = isPermanent
      ? `Are you sure you want to permanently delete ${selectedFileIds.length} item(s)? This cannot be undone.`
      : `Move ${selectedFileIds.length} item(s) to Trash?`;

    if (!window.confirm(confirmMsg)) return;

    setBatchActionLoading(true);
    try {
      const res = await fetch("/api/drive/files/batch-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          fileIds: selectedFileIds,
          permanent: isPermanent,
        }),
      });
      if (res.ok) {
        const deletedFileNames = files
          .filter((f) => selectedFileIds.includes(f.id))
          .map((f) => f.name);
        
        deletedFileNames.forEach(name => {
          addActivity("delete", name, isPermanent ? "Permanently deleted" : "Moved to trash");
        });
        setFiles((prev) => prev.filter((f) => !selectedFileIds.includes(f.id)));
        setSelectedFileIds([]);
        loadDriveAbout();
      }
    } catch (err) {
      console.error("Batch delete error:", err);
    } finally {
      setBatchActionLoading(false);
    }
  }, [selectedFileIds, currentFilter, getAuthHeaders, loadDriveAbout]);

  const handleConfirmBatchMove = async (targetFolderId: string) => {
    if (selectedFileIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      const res = await fetch("/api/drive/files/batch-move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          fileIds: selectedFileIds,
          targetFolderId,
        }),
      });
      if (res.ok) {
        const movedFiles = files.filter((f) => selectedFileIds.includes(f.id));
        movedFiles.forEach(f => {
          addActivity("move", f.name, "Moved to folder");
        });
        setFiles((prev) => prev.filter((f) => !selectedFileIds.includes(f.id)));
        setSelectedFileIds([]);
        loadDriveAbout();
      }
    } catch (err) {
      console.error("Batch move error:", err);
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleBatchRestore = async () => {
    if (selectedFileIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      const res = await fetch("/api/drive/files/batch-restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          fileIds: selectedFileIds,
        }),
      });
      if (res.ok) {
        const restoredFiles = files.filter((f) => selectedFileIds.includes(f.id));
        restoredFiles.forEach(f => {
          addActivity("restore", f.name, "Restored from trash");
        });
        setFiles((prev) => prev.filter((f) => !selectedFileIds.includes(f.id)));
        setSelectedFileIds([]);
        loadDriveAbout();
      }
    } catch (err) {
      console.error("Batch restore error:", err);
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleStar = async (file: DriveFile) => {
    try {
      const res = await fetch(`/api/drive/files/${file.id}/star`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ starred: !file.starred }),
      });
      if (res.ok) {
        addActivity(file.starred ? "unstar" : "star", file.name);
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, starred: !f.starred } : f))
        );
      }
    } catch (err) {
      console.error("Star toggle error:", err);
    }
  };

  // Global Keyboard Shortcuts (Delete, Esc, Ctrl+A / Cmd+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypress when typing in input/textarea/contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ctrl + Shift + K: Open Shortcuts
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
        return;
      }

      // /: Focus Search
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
        return;
      }

      // Escape: clear selection or close open modals
      if (e.key === "Escape") {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (previewFile) {
          setPreviewFile(null);
        } else if (activeMobileActionFile) {
          setActiveMobileActionFile(null);
        } else if (selectedFile) {
          setSelectedFile(null);
        } else if (isMoveModalOpen) {
          setIsMoveModalOpen(false);
        } else if (isNewFolderModalOpen) {
          setIsNewFolderModalOpen(false);
        } else if (isUploadModalOpen) {
          setIsUploadModalOpen(false);
        } else if (selectedFileIds.length > 0) {
          setSelectedFileIds([]);
        }
      }

      // N: New Folder
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsNewFolderModalOpen(true);
      }

      // U: Upload
      if (e.key.toLowerCase() === "u") {
        e.preventDefault();
        setIsUploadModalOpen(true);
      }

      // Shift + A: AI Assistant
      if (e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsAiAssistantOpen(true);
      }

      // V: Toggle View Mode
      if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
      }

      // S: Star selected
      if (e.key.toLowerCase() === "s" && selectedFileIds.length === 1) {
        e.preventDefault();
        const fileToStar = files.find((f) => f.id === selectedFileIds[0]);
        if (fileToStar) handleStar(fileToStar);
      }

      // M: Move selected
      if (e.key.toLowerCase() === "m" && selectedFileIds.length > 0) {
        e.preventDefault();
        setIsMoveModalOpen(true);
      }

      // Navigation Shortcuts: G + D (Drive), G + S (Starred), G + R (Shared), G + T (Trash)
      if (e.key.toLowerCase() === "g") {
        setLastKeyPressed("g");
        setLastKeyTime(Date.now());
      }

      if (lastKeyPressed === "g" && Date.now() - lastKeyTime < 1000) {
        const key = e.key.toLowerCase();
        if (key === "d") {
          e.preventDefault();
          setCurrentFilter("all");
          setLastKeyPressed(null);
        } else if (key === "s") {
          e.preventDefault();
          setCurrentFilter("starred");
          setLastKeyPressed(null);
        } else if (key === "r") {
          e.preventDefault();
          setCurrentFilter("shared");
          setLastKeyPressed(null);
        } else if (key === "t") {
          e.preventDefault();
          setCurrentFilter("trashed");
          setLastKeyPressed(null);
        }
      }

      // Delete or Backspace: Batch delete selected files
      if ((e.key === "Delete" || e.key === "Backspace") && selectedFileIds.length > 0) {
        e.preventDefault();
        handleBatchDelete();
      }

      // Ctrl+A / Cmd+A: Select all files in current view
      if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
        if (files.length > 0) {
          e.preventDefault();
          setSelectedFileIds(files.map((f) => f.id));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedFileIds,
    files,
    selectedFile,
    isMoveModalOpen,
    isNewFolderModalOpen,
    isUploadModalOpen,
    isShortcutsModalOpen,
    isAiAssistantOpen,
    isMobileMenuOpen,
    previewFile,
    lastKeyPressed,
    lastKeyTime,
    handleBatchDelete,
    handleStar,
  ]);

  const handleRename = async (file: DriveFile) => {
    const newName = window.prompt("Enter new file name:", file.name);
    if (!newName || newName.trim() === file.name) return;

    try {
      const res = await fetch(`/api/drive/files/${file.id}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        addActivity("rename", file.name, `Renamed to: ${newName.trim()}`);
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, name: newName.trim() } : f))
        );
      }
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  const handleDelete = async (file: DriveFile) => {
    const isPermanent = currentFilter === "trashed" || file.trashed;
    const confirmMsg = isPermanent
      ? `Are you sure you want to permanently delete "${file.name}"? This cannot be undone.`
      : `Move "${file.name}" to Trash?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(
        `/api/drive/files/${file.id}${isPermanent ? "?permanent=true" : ""}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      if (res.ok) {
        addActivity("delete", file.name, isPermanent ? "Permanently deleted" : "Moved to trash");
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
        loadDriveAbout();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleRestore = async (file: DriveFile) => {
    try {
      const res = await fetch(`/api/drive/files/${file.id}/restore`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        addActivity("restore", file.name, "Restored from trash");
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
        loadDriveAbout();
      }
    } catch (err) {
      console.error("Restore error:", err);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    const res = await fetch("/api/drive/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        name: folderName,
        parentId: currentFolderId,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create folder");
    }

    addActivity("create_folder", folderName);
    loadFiles();
  };

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("parentId", currentFolderId);

    const res = await fetch("/api/drive/files/upload", {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to upload file");
    }

    addActivity("upload", file.name);
    loadFiles();
    loadDriveAbout();
  };

  const handleCreateFoldersAndMove = async (
    suggestedFolders: string[],
    categorization: any[]
  ) => {
    try {
      setBatchActionLoading(true);
      for (const folderName of suggestedFolders) {
        await handleCreateFolder(folderName);
      }
      loadFiles();
    } catch (err) {
      console.error("Auto-organize error:", err);
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleSendEmail = async (to: string, subject: string, body: string) => {
    const res = await fetch("/api/gmail/messages/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ to, subject, body }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to send email");
    }

    addActivity("move", `Sent email to ${to}`); // Reusing activity type for simplicity
    loadGmailMessages();
  };

  const handleSwitchAccount = (account: any) => {
    setUser({
      name: account.name,
      email: account.email,
      picture: account.avatar,
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-medium">Loading Google Drive Manager...</p>
      </div>
    );
  }

  const currentFolderObj = breadcrumbs[breadcrumbs.length - 1];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar
        currentFilter={currentFilter}
        onSelectFilter={handleFilterSelect}
        onOpenNewFolderModal={() => setIsNewFolderModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        quota={quota}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        activities={activities}
        viewMode={appView}
        onViewChange={(v) => {
          setAppView(v);
          setActiveThreadId(null);
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Offline Banner Indicator */}
        {isOffline && (
          <div className="bg-amber-500 text-slate-950 text-xs font-bold px-4 py-1.5 flex items-center justify-center gap-2 shadow-xs z-30">
            <WifiOff className="w-4 h-4" />
            <span>You are currently offline. Showing cached Google Drive files and metadata.</span>
          </div>
        )}

        {/* Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isRefreshing={appView === "drive" ? loadingFiles : loadingGmail}
          user={user}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          onSwitchAccount={handleSwitchAccount}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onRefresh={() => {
            loadDriveAbout();
            if (appView === "drive") loadFiles();
            else loadGmailMessages();
          }}
          notifications={notifications}
          onMarkNotificationAsRead={markNotificationAsRead}
          onClearNotifications={clearNotifications}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6 space-y-6">
          {!isAuthenticated ? (
            <AuthBanner
              onLogin={handleLogin}
              onDemoMode={handleDemoMode}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
            />
          ) : (
            <>
              {/* Path & Title Bar */}
              <div className="flex items-center justify-between gap-4">
                {appView === "gmail" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Gmail Inbox
                      </h2>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Workspace Email</p>
                    </div>
                  </div>
                ) : searchQuery ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg">
                      Search Results
                    </span>
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                      "{searchQuery}"
                    </h2>
                  </div>
                ) : currentFilter !== "all" ? (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">
                      {currentFilter} Files
                    </h2>
                  </div>
                ) : (
                  <Breadcrumb
                    items={breadcrumbs}
                    onNavigate={handleBreadcrumbNavigate}
                  />
                )}

                <div className="text-xs text-slate-400 font-medium">
                  {appView === "drive" 
                    ? `${files.length} ${files.length === 1 ? "item" : "items"}`
                    : `${gmailMessages.length} emails`}
                </div>
              </div>

              {appView === "drive" ? (
                <>
                  {/* Batch Action Toolbar */}
                  <BatchSelectionBar
                    selectedCount={selectedFileIds.length}
                    totalCount={files.length}
                    allSelected={selectedFileIds.length === files.length && files.length > 0}
                    onToggleSelectAll={handleToggleSelectAll}
                    onClearSelection={handleClearSelection}
                    onBatchDelete={handleBatchDelete}
                    onOpenBatchMove={() => setIsMoveModalOpen(true)}
                    onBatchRestore={handleBatchRestore}
                    isTrashed={currentFilter === "trashed"}
                    actionLoading={batchActionLoading}
                  />

                  {/* Error State */}
                  {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="flex-1">{error}</span>
                      <button
                        onClick={loadFiles}
                        className="px-3 py-1 bg-rose-100 dark:bg-rose-900 hover:bg-rose-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Main Views: Analytics or File Listing */}
                  {currentFilter === "analytics" ? (
                    <StorageAnalytics
                      files={files}
                      quota={quota}
                      onOpenTrash={() => setCurrentFilter("trashed")}
                    />
                  ) : loadingFiles ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <p className="text-xs font-medium">Fetching files from Google Drive...</p>
                    </div>
                  ) : files.length === 0 ? (
                    /* Empty State with Illustration */
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in zoom-in-95 duration-500">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                        <img 
                          src="/src/assets/images/drive_hero_illustration_1789047466923.jpg" 
                          alt="Empty Drive" 
                          className="relative w-72 h-auto rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No files found</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Your drive looks a bit lonely. Start by uploading some files or creating a new folder to stay organized.
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-8">
                        <button 
                          onClick={() => setIsUploadModalOpen(true)}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
                        >
                          Upload File
                        </button>
                        <button 
                          onClick={() => setIsNewFolderModalOpen(true)}
                          className="px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-semibold border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
                        >
                          New Folder
                        </button>
                      </div>
                    </div>
                  ) : viewMode === "grid" ? (
                    /* Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {files.map((file) => (
                        <FileCard
                          key={file.id}
                          file={file}
                          onOpenFolder={handleOpenFolder}
                          onSelectFile={(f) => setPreviewFile(f)}
                          onStar={handleStar}
                          onRename={handleRename}
                          onDelete={handleDelete}
                          onRestore={handleRestore}
                          onShare={(f) => setShareFile(f)}
                          onSummarize={(f) => setSummaryFile(f)}
                          onOpenMobileActions={(f) => setActiveMobileActionFile(f)}
                          isTrashed={currentFilter === "trashed" || file.trashed}
                          isSelected={selectedFileIds.includes(file.id)}
                          onToggleSelect={handleToggleSelectFile}
                          hasSelection={selectedFileIds.length > 0}
                        />
                      ))}
                    </div>
                  ) : (
                    /* List View Table */
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                              <th className="py-3 pl-4 pr-1 w-10">
                                <div
                                  onClick={handleToggleSelectAll}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                    selectedFileIds.length === files.length && files.length > 0
                                      ? "bg-blue-600 border-blue-600 text-white"
                                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                  }`}
                                  title={
                                    selectedFileIds.length === files.length
                                      ? "Deselect all"
                                      : "Select all"
                                  }
                                >
                                  {selectedFileIds.length === files.length && files.length > 0 && (
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  )}
                                </div>
                              </th>
                              <th className="py-3 px-3">Name</th>
                              <th className="py-3 px-4 hidden lg:table-cell">Type</th>
                              <th className="py-3 px-4 hidden md:table-cell">Last Modified</th>
                              <th className="py-3 px-4 hidden sm:table-cell">Size</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {files.map((file) => (
                              <FileTableRow
                                key={file.id}
                                file={file}
                                onOpenFolder={handleOpenFolder}
                                onSelectFile={(f) => setPreviewFile(f)}
                                onStar={handleStar}
                                onRename={handleRename}
                                onDelete={handleDelete}
                                onRestore={handleRestore}
                                onShare={(f) => setShareFile(f)}
                                onSummarize={(f) => setSummaryFile(f)}
                                onOpenMobileActions={(f) => setActiveMobileActionFile(f)}
                                isTrashed={currentFilter === "trashed" || file.trashed}
                                isSelected={selectedFileIds.includes(file.id)}
                                onToggleSelect={handleToggleSelectFile}
                                hasSelection={selectedFileIds.length > 0}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {activeThreadId ? (
                    <GmailThreadView 
                      threadId={activeThreadId}
                      onBack={() => setActiveThreadId(null)}
                      onSendReply={handleSendEmail}
                    />
                  ) : (
                    <GmailView 
                      messages={gmailMessages} 
                      loading={loadingGmail} 
                      onRefresh={loadGmailMessages} 
                      onCompose={() => setIsComposeModalOpen(true)}
                      onSelectMessage={(tid) => setActiveThreadId(tid)}
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          currentFilter={currentFilter}
          onFilterSelect={handleFilterSelect}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* In-App File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        filesList={files}
        onClose={() => setPreviewFile(null)}
        onNavigateFile={(f) => setPreviewFile(f)}
        onOpenDetails={(f) => {
          setPreviewFile(null);
          setSelectedFile(f);
        }}
      />

      {/* Mobile Action Sheet Modal */}
      <MobileActionSheet
        file={activeMobileActionFile}
        onClose={() => setActiveMobileActionFile(null)}
        onPreview={(f) => setPreviewFile(f)}
        onStar={handleStar}
        onRename={handleRename}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onDetails={(f) => setSelectedFile(f)}
        onShare={(f) => setShareFile(f)}
        onSummarize={(f) => setSummaryFile(f)}
        isTrashed={currentFilter === "trashed"}
      />

      {/* Gemini AI Summary Modal */}
      <AiSummaryModal
        file={summaryFile}
        isOpen={summaryFile !== null}
        onClose={() => setSummaryFile(null)}
      />

      {/* Gemini AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        files={files}
        onCreateFoldersAndMove={handleCreateFoldersAndMove}
      />

      {/* Share Modal */}
      <ShareModal
        file={shareFile}
        isOpen={shareFile !== null}
        onClose={() => setShareFile(null)}
        onShareSuccess={(fileName, email) => {
          addNotification(
            "File Shared",
            `Successfully shared "${fileName}" with ${email}.`,
            "drive"
          );
        }}
      />

      {/* Modals */}
      <FileDetailsModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
      />

      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadFile={handleUploadFile}
        currentFolderName={currentFolderObj?.name || "My Drive"}
      />

      <MoveModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        selectedFileIds={selectedFileIds}
        files={files}
        onConfirmMove={handleConfirmBatchMove}
        getAuthHeaders={getAuthHeaders}
      />

      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <ComposeEmailModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        onSend={handleSendEmail}
      />
    </div>
  );
}
