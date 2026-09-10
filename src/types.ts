export interface DriveOwner {
  displayName?: string;
  emailAddress?: string;
  photoLink?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  starred?: boolean;
  trashed?: boolean;
  description?: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  parents?: string[];
  owners?: DriveOwner[];
  shared?: boolean;
}

export interface UserProfile {
  name?: string;
  email?: string;
  picture?: string;
}

export interface StorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export type FilterCategory =
  | "all"
  | "starred"
  | "documents"
  | "spreadsheets"
  | "images"
  | "folders"
  | "shared"
  | "analytics"
  | "trashed";

export type ViewMode = "grid" | "list";

export type ActivityType =
  | "upload"
  | "delete"
  | "move"
  | "rename"
  | "star"
  | "unstar"
  | "create_folder"
  | "restore";

export interface Activity {
  id: string;
  type: ActivityType;
  fileName: string;
  timestamp: number;
  userId?: string;
  details?: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
  labelIds?: string[];
}

export interface GmailAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
  messageId: string;
}

export interface GmailMessageFull extends GmailMessage {
  body?: string;
  to?: string;
  attachments?: GmailAttachment[];
}

export interface GmailThread {
  id: string;
  historyId: string;
  messages: GmailMessageFull[];
}

export interface FilePermission {
  id: string;
  role: "owner" | "writer" | "commenter" | "reader";
  type: "user" | "group" | "domain" | "anyone";
  emailAddress?: string;
  displayName?: string;
  photoLink?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "gmail" | "drive" | "storage";
  read: boolean;
  timestamp: number;
  link?: string;
}
