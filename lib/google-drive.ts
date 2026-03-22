import { google } from "googleapis";

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string | null;
  webViewLink?: string | null;
  webContentLink?: string | null;
  size?: string | null;
};

function parseServiceAccountKey(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed);
    }

    const decoded = Buffer.from(trimmed, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

async function getDriveClient() {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "";
  const key = parseServiceAccountKey(rawKey);

  if (!key || !key.client_email || !key.private_key) {
    throw new Error("Invalid Google service account key");
  }

  const auth = new google.auth.JWT({
    email: key.client_email,
    key: String(key.private_key).replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

export async function listDriveChildren(
  folderId: string,
  options?: { mimeType?: string; pageSize?: number },
): Promise<DriveFile[]> {
  const drive = await getDriveClient();
  const mimeFilter = options?.mimeType
    ? ` and mimeType='${options.mimeType}'`
    : "";

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false${mimeFilter}`,
    fields:
      "files(id,name,mimeType,modifiedTime,webViewLink,webContentLink,size)",
    orderBy: "modifiedTime desc",
    pageSize: options?.pageSize ?? 100,
  });

  return (response.data.files ?? []) as DriveFile[];
}

export async function listDriveFolders(folderId: string) {
  return listDriveChildren(folderId, {
    mimeType: "application/vnd.google-apps.folder",
  });
}
