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

export interface FilePermission {
  id: string;
  role: "owner" | "writer" | "commenter" | "reader";
  type: "user" | "group" | "domain" | "anyone";
  emailAddress?: string;
  displayName?: string;
  photoLink?: string;
}
