import express from "express";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import { google } from "googleapis";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import firebaseConfig from "./firebase-applet-config.json";

const app = express();
const PORT = 3000;

function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for demo upload
});

// OAuth Client Setup
function getOAuth2Client(req?: express.Request) {
  const clientId =
    process.env.OAUTH_CLIENT_ID ||
    firebaseConfig.oAuthClientId ||
    "49745482001-8p4thdo5neohp1rbc01h59c3gn78f0e2.apps.googleusercontent.com";
  const clientSecret = process.env.OAUTH_CLIENT_SECRET || "";

  let baseUrl = process.env.APP_URL;
  if (!baseUrl && req) {
    const origin = req.headers.origin;
    if (origin && typeof origin === "string" && origin.startsWith("http")) {
      baseUrl = origin;
    } else {
      const host = req.headers.host;
      const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
      if (host) {
        baseUrl = `${proto}://${host}`;
      }
    }
  }
  if (!baseUrl) {
    baseUrl = "https://ais-dev-dt47e2rff3ym3i2246d6zq-693904223054.asia-southeast1.run.app";
  }

  const redirectUri = `${baseUrl.replace(/\/$/, "")}/auth/google/callback`;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Helper to get authenticated Google Drive client from request
async function getDriveClient(req: express.Request, res: express.Response) {
  let accessToken = req.cookies.drive_access_token;
  let refreshToken = req.cookies.drive_refresh_token;

  // Fallback to headers if third-party cookies are blocked in iframe
  const authHeader = req.headers.authorization;
  if (!accessToken && authHeader && authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.substring(7);
  }
  if (!refreshToken && req.headers["x-refresh-token"]) {
    refreshToken = req.headers["x-refresh-token"] as string;
  }

  if (!accessToken && !refreshToken) {
    throw new Error("UNAUTHENTICATED");
  }

  const oauth2Client = getOAuth2Client(req);
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Handle token refresh automatically
  oauth2Client.on("tokens", (tokens) => {
    if (tokens.access_token) {
      const cookieOptions: express.CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };
      res.cookie("drive_access_token", tokens.access_token, cookieOptions);
    }
    if (tokens.refresh_token) {
      const cookieOptions: express.CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      };
      res.cookie("drive_refresh_token", tokens.refresh_token, cookieOptions);
    }
  });

  return google.drive({ version: "v3", auth: oauth2Client });
}

// ==================== AUTH ROUTES ====================

app.get("/auth/google", (req, res) => {
  const oauth2Client = getOAuth2Client(req);
  const scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  res.redirect(url);
});

app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send("No authorization code provided.");
  }

  try {
    const oauth2Client = getOAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(code);

    const cookieOptions: express.CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    if (tokens.access_token) {
      res.cookie("drive_access_token", tokens.access_token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    if (tokens.refresh_token) {
      res.cookie("drive_refresh_token", tokens.refresh_token, cookieOptions);
    }

    // Also pass tokens back in URL hash/query so client JS can save in localStorage in case iframe cookies fail
    const queryParams = new URLSearchParams();
    if (tokens.access_token) queryParams.set("access_token", tokens.access_token);
    if (tokens.refresh_token) queryParams.set("refresh_token", tokens.refresh_token);
    queryParams.set("auth_success", "true");

    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Authentication Successful</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0f172a; color: #f8fafc; text-align: center; padding: 20px; }
            .card { background: #1e293b; border: 1px solid #334155; padding: 32px; border-radius: 20px; max-width: 400px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            .icon { width: 48px; height: 48px; background: #2563eb; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-weight: bold; font-size: 24px; }
            h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; }
            p { margin: 0; font-size: 14px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✓</div>
            <h2>Google Drive Connected!</h2>
            <p>Authentication complete. Returning to Google Drive Manager...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: "oauth_success",
                  accessToken: "${tokens.access_token || ""}",
                  refreshToken: "${tokens.refresh_token || ""}"
                }, "*");
                setTimeout(function() { window.close(); }, 800);
              }
            } catch (e) {}
            setTimeout(function() {
              window.location.href = "/?${queryParams.toString()}";
            }, 1000);
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Error exchanging code for token:", error);
    res.status(500).send(`Authentication error: ${error.message || error}`);
  }
});

app.get("/auth/me", async (req, res) => {
  try {
    let accessToken = req.cookies.drive_access_token;
    let refreshToken = req.cookies.drive_refresh_token;

    const authHeader = req.headers.authorization;
    if (!accessToken && authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.substring(7);
    }
    if (!refreshToken && req.headers["x-refresh-token"]) {
      refreshToken = req.headers["x-refresh-token"] as string;
    }

    if (!accessToken && !refreshToken) {
      return res.json({ authenticated: false });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    return res.json({
      authenticated: true,
      user: {
        name: userInfo.data.name,
        email: userInfo.data.email,
        picture: userInfo.data.picture,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.warn("Auth check failed:", error?.message);
    return res.json({ authenticated: false });
  }
});

app.post("/auth/logout", (req, res) => {
  res.clearCookie("drive_access_token", { sameSite: "none", secure: true });
  res.clearCookie("drive_refresh_token", { sameSite: "none", secure: true });
  res.json({ success: true });
});

// ==================== DRIVE API ROUTES ====================

// 1. Get Storage Quota & User Info
app.get("/api/drive/about", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const about = await drive.about.get({
      fields: "storageQuota, user",
    });
    res.json(about.data);
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    res.status(500).json({ error: error.message || "Failed to fetch drive info" });
  }
});

// 2. List Files & Search
app.get("/api/drive/files", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const { folderId = "root", q = "", pageToken, filter = "all" } = req.query;

    let queryConditions: string[] = ["trashed = false"];

    if (filter === "starred") {
      queryConditions.push("starred = true");
    } else if (filter === "trashed") {
      queryConditions = ["trashed = true"];
    } else if (filter === "documents") {
      queryConditions.push("mimeType contains 'document' or mimeType contains 'text'");
    } else if (filter === "spreadsheets") {
      queryConditions.push("mimeType contains 'spreadsheet' or mimeType contains 'sheet'");
    } else if (filter === "images") {
      queryConditions.push("mimeType contains 'image/'");
    } else if (filter === "folders") {
      queryConditions.push("mimeType = 'application/vnd.google-apps.folder'");
    } else if (q && typeof q === "string" && q.trim()) {
      // Free text search across file names
      const searchEscaped = q.trim().replace(/'/g, "\\'");
      queryConditions.push(`name contains '${searchEscaped}'`);
    } else if (folderId) {
      // Normal directory navigation
      queryConditions.push(`'${folderId}' in parents`);
    }

    const queryStr = queryConditions.join(" and ");

    const response = await drive.files.list({
      q: queryStr,
      pageSize: 50,
      pageToken: (pageToken as string) || undefined,
      fields: "nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, starred, trashed, iconLink, thumbnailLink, webViewLink, webContentLink, parents, owners, shared)",
      orderBy: "folder, name",
    });

    res.json({
      files: response.data.files || [],
      nextPageToken: response.data.nextPageToken,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    console.error("Drive list error:", error);
    res.status(500).json({ error: error.message || "Failed to list files" });
  }
});

// 3. Create New Folder
app.post("/api/drive/folders", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const { name, parentId = "root" } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const folderMetadata = {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    };

    const response = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id, name, mimeType, modifiedTime, parents",
    });

    res.json(response.data);
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    res.status(500).json({ error: error.message || "Failed to create folder" });
  }
});

// 4. Upload File
app.post("/api/drive/files/upload", upload.single("file"), async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const file = req.file;
    const parentId = req.body.parentId || "root";

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const stream = require("stream");
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);

    const fileMetadata = {
      name: file.originalname,
      parents: [parentId],
    };

    const media = {
      mimeType: file.mimetype,
      body: bufferStream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, mimeType, size, modifiedTime, webViewLink",
    });

    res.json(response.data);
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload file" });
  }
});

// 5. Star / Unstar File
app.patch("/api/drive/files/:fileId/star", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const { fileId } = req.params;
    const { starred } = req.body;

    const response = await drive.files.update({
      fileId,
      requestBody: { starred: Boolean(starred) },
      fields: "id, name, starred",
    });

    res.json(response.data);
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    res.status(500).json({ error: error.message || "Failed to update star state" });
  }
});

// 6. Rename File / Folder
app.patch("/api/drive/files/:fileId/rename", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const { fileId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "New name is required" });
    }

    const response = await drive.files.update({
      fileId,
      requestBody: { name: name.trim() },
      fields: "id, name, mimeType, modifiedTime",
    });

    res.json(response.data);
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    res.status(500).json({ error: error.message || "Failed to rename file" });
  }
});

// 7. Move to Trash / Delete File
app.delete("/api/drive/files/:fileId", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const { fileId } = req.params;
    const { permanent = false } = req.query;

    if (permanent === "true") {
      await drive.files.delete({ fileId });
      res.json({ success: true, fileId, deletedPermanently: true });
    } else {
      const response = await drive.files.update({
        fileId,
        requestBody: { trashed: true },
        fields: "id, name, trashed",
      });
      res.json(response.data);
    }
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    res.status(500).json({ error: error.message || "Failed to delete file" });
  }
});

// 7b. Batch Delete / Move to Trash
app.post("/api/drive/files/batch-delete", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const { fileIds = [], permanent = false } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: "fileIds array is required" });
    }

    const results = await Promise.allSettled(
      fileIds.map(async (id: string) => {
        if (permanent) {
          await drive.files.delete({ fileId: id });
          return { id, deletedPermanently: true };
        } else {
          const resp = await drive.files.update({
            fileId: id,
            requestBody: { trashed: true },
            fields: "id, trashed",
          });
          return resp.data;
        }
      })
    );

    res.json({ success: true, count: results.filter((r) => r.status === "fulfilled").length });
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    res.status(500).json({ error: error.message || "Failed to batch delete files" });
  }
});

// 7c. Batch Move Files to Target Folder
app.post("/api/drive/files/batch-move", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const { fileIds = [], targetFolderId } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0 || !targetFolderId) {
      return res.status(400).json({ error: "fileIds array and targetFolderId are required" });
    }

    const results = await Promise.allSettled(
      fileIds.map(async (id: string) => {
        // Retrieve existing parents first
        const file = await drive.files.get({
          fileId: id,
          fields: "parents",
        });
        const previousParents = (file.data.parents || []).join(",");

        const resp = await drive.files.update({
          fileId: id,
          addParents: targetFolderId,
          removeParents: previousParents,
          fields: "id, parents",
        });
        return resp.data;
      })
    );

    res.json({ success: true, count: results.filter((r) => r.status === "fulfilled").length });
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    res.status(500).json({ error: error.message || "Failed to batch move files" });
  }
});

// 7d. Batch Restore Files from Trash
app.post("/api/drive/files/batch-restore", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const { fileIds = [] } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: "fileIds array is required" });
    }

    const results = await Promise.allSettled(
      fileIds.map(async (id: string) => {
        const resp = await drive.files.update({
          fileId: id,
          requestBody: { trashed: false },
          fields: "id, trashed",
        });
        return resp.data;
      })
    );

    res.json({ success: true, count: results.filter((r) => r.status === "fulfilled").length });
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    res.status(500).json({ error: error.message || "Failed to batch restore files" });
  }
});

// 8. Restore File from Trash
app.post("/api/drive/files/:fileId/restore", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const { fileId } = req.params;

    const response = await drive.files.update({
      fileId,
      requestBody: { trashed: false },
      fields: "id, name, trashed",
    });

    res.json(response.data);
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    res.status(500).json({ error: error.message || "Failed to restore file" });
  }
});

// 9. Get Single File Details / Metadata
app.get("/api/drive/files/:fileId", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const { fileId } = req.params;

    const response = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, size, modifiedTime, createdTime, starred, trashed, description, webViewLink, webContentLink, iconLink, thumbnailLink, parents, owners, shared, permissions",
    });

    res.json(response.data);
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    res.status(500).json({ error: error.message || "Failed to fetch file details" });
  }
});

// 10. Direct Download / View Proxy (Bypasses Google multi-account 403 browser mismatches)
app.get("/api/drive/files/:fileId/download", async (req, res) => {
  try {
    const drive = await getDriveClient(req, res);
    const { fileId } = req.params;

    const fileMeta = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, size",
    });

    const mime = fileMeta.data.mimeType || "";
    const isWorkspaceDoc = mime.startsWith("application/vnd.google-apps.");

    if (isWorkspaceDoc) {
      let exportMime = "application/pdf";
      let ext = ".pdf";
      if (mime.includes("document")) {
        exportMime = "application/pdf";
        ext = ".pdf";
      } else if (mime.includes("spreadsheet")) {
        exportMime = "application/pdf";
        ext = ".pdf";
      } else if (mime.includes("presentation")) {
        exportMime = "application/pdf";
        ext = ".pdf";
      }

      const response = await drive.files.export(
        { fileId, mimeType: exportMime },
        { responseType: "stream" }
      );

      res.setHeader("Content-Type", exportMime);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(fileMeta.data.name || "document")}${ext}"`
      );
      response.data.pipe(res);
    } else {
      const response = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
      );

      if (mime) {
        res.setHeader("Content-Type", mime);
      }
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(fileMeta.data.name || "file")}"`
      );
      response.data.pipe(res);
    }
  } catch (error: any) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    console.error("Download proxy error:", error);
    res.status(500).json({ error: error.message || "Failed to download file" });
  }
});

// ==================== GEMINI AI ROUTES ====================

// 11. AI File Summarizer & Insights
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { fileName, fileType, description, textSnippet } = req.body;
    const ai = getGeminiAI();

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not set
      return res.json({
        summary: `"${fileName}" is a ${fileType || "file"} stored in your Google Drive.`,
        keyTakeaways: [
          "File indexed and analyzed for Google Drive management.",
          "Contains essential document information and metadata.",
          "Ready for categorization and sharing."
        ],
        suggestedTags: ["Document", "Drive", "Indexed"],
        category: "General Document"
      });
    }

    const prompt = `Analyze the following file from a user's Google Drive and generate a helpful summary in JSON format.
File Name: ${fileName || "Untitled"}
File Type / MIME: ${fileType || "Unknown"}
Description: ${description || "None"}
Text/Context Snippet: ${textSnippet || "No body preview available"}

Provide JSON output with:
1. "summary": A concise 2-3 sentence executive summary explaining what this file is about.
2. "keyTakeaways": An array of 3 bullet points with key insights.
3. "suggestedTags": An array of 3-5 short relevant tag strings.
4. "category": A 1-2 word high-level category (e.g. "Financial", "Project Spec", "Design Asset", "Personal Note", "Spreadsheet", "Media").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            category: { type: Type.STRING },
          },
          required: ["summary", "keyTakeaways", "suggestedTags", "category"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("AI summarize error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI summary" });
  }
});

// 12. AI Smart Drive Organizer
app.post("/api/ai/organize", async (req, res) => {
  try {
    const { files = [] } = req.body;
    const ai = getGeminiAI();

    if (!files.length) {
      return res.status(400).json({ error: "Files array is required" });
    }

    if (!ai) {
      // Intelligent fallback heuristics
      const fallbackCategorization = files.map((f: any) => {
        let folder = "General Files";
        const name = (f.name || "").toLowerCase();
        const mime = (f.mimeType || "").toLowerCase();

        if (mime.startsWith("image/")) folder = "Images & Graphics";
        else if (mime.includes("pdf")) folder = "PDF Reports";
        else if (mime.includes("spreadsheet") || mime.includes("excel") || name.includes("budget") || name.includes("sheet")) folder = "Finance & Sheets";
        else if (mime.includes("document") || mime.includes("word") || name.includes("doc")) folder = "Documents & Notes";
        else if (mime.startsWith("video/") || mime.startsWith("audio/")) folder = "Media Assets";

        return {
          fileId: f.id,
          fileName: f.name,
          recommendedFolder: folder,
          reason: "Categorized based on file extension and mime type.",
        };
      });

      return res.json({
        categorization: fallbackCategorization,
        suggestedNewFolders: ["Images & Graphics", "PDF Reports", "Finance & Sheets", "Documents & Notes", "Media Assets"],
      });
    }

    const filesSummary = files
      .map((f: any) => `- ID: ${f.id} | Name: ${f.name} | Type: ${f.mimeType}`)
      .join("\n");

    const prompt = `You are a smart Google Drive Organization Assistant. Analyze the following list of files and suggest logical folder names to group them efficiently into clean, well-structured Drive folders.

Files:
${filesSummary}

Provide a JSON object containing:
1. "categorization": An array of objects, where each object has:
   - "fileId": string (matches input ID)
   - "fileName": string
   - "recommendedFolder": string (e.g. "Invoices & Receipts", "Project Documentation", "Media & Assets", "Personal", "Code & Dev")
   - "reason": string (short explanation)
2. "suggestedNewFolders": An array of unique folder names recommended to be created in Google Drive.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categorization: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fileId: { type: Type.STRING },
                  fileName: { type: Type.STRING },
                  recommendedFolder: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["fileId", "fileName", "recommendedFolder", "reason"],
              },
            },
            suggestedNewFolders: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["categorization", "suggestedNewFolders"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("AI organize error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze drive organization" });
  }
});

// 13. AI Drive Assistant Chat
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, filesContext = [] } = req.body;
    const ai = getGeminiAI();

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!ai) {
      return res.json({
        reply: `Hello! I am your AI Drive Assistant. I can help you search, summarize, and clean up your files. (Query received: "${message}")`,
      });
    }

    const contextSnippet = filesContext.length
      ? `User's current visible Drive files:\n` +
        filesContext
          .slice(0, 15)
          .map((f: any) => `- ${f.name} (${f.mimeType}, ${f.size || "folder"})`)
          .join("\n")
      : "No file context attached.";

    const prompt = `You are the Google Drive Manager AI Assistant. Answer the user's prompt helpfully, concisely, and accurately in the same language as the prompt (supports Bengali and English).

Context:
${contextSnippet}

User Question:
${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a friendly, expert Google Drive AI Assistant embedded inside Google Drive Manager. Help users organize files, find items, manage storage, and understand documents.",
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: error.message || "Failed to execute AI chat" });
  }
});

// ==================== VITE SERVER & APP START ====================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
