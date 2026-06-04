import { createSign } from "node:crypto";

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string | null;
  webViewLink?: string | null;
  webContentLink?: string | null;
  size?: string | null;
};

type ServiceAccountKey = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

const driveReadonlyScope = "https://www.googleapis.com/auth/drive.readonly";
const defaultTokenUri = "https://oauth2.googleapis.com/token";
let tokenCache: TokenCache | null = null;

function isServiceAccountKey(value: unknown): value is ServiceAccountKey {
  if (!value || typeof value !== "object") {
    return false;
  }

  const key = value as Record<string, unknown>;
  return (
    typeof key.client_email === "string" &&
    typeof key.private_key === "string"
  );
}

function parseServiceAccountKey(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed) as unknown;
    }

    const decoded = Buffer.from(trimmed, "base64").toString("utf8");
    return JSON.parse(decoded) as unknown;
  } catch {
    return null;
  }
}

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function createJwtAssertion(key: ServiceAccountKey) {
  const tokenUri = key.token_uri ?? defaultTokenUri;
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const payload = {
    iss: key.client_email,
    scope: driveReadonlyScope,
    aud: tokenUri,
    exp: now + 3600,
    iat: now,
  };

  const unsignedToken = `${encodeBase64Url(
    JSON.stringify(header),
  )}.${encodeBase64Url(JSON.stringify(payload))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  const signature = signer
    .sign(String(key.private_key).replace(/\\n/g, "\n"))
    .toString("base64url");

  return {
    assertion: `${unsignedToken}.${signature}`,
    tokenUri,
  };
}

async function getAccessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "";
  if (!rawKey.trim()) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY manquant.");
  }

  const key = parseServiceAccountKey(rawKey);
  if (!isServiceAccountKey(key)) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY invalide.");
  }

  const { assertion, tokenUri } = createJwtAssertion(key);
  const response = await fetch(tokenUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  const tokenResponse = (await response.json().catch(() => null)) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  } | null;

  if (!response.ok || !tokenResponse?.access_token) {
    throw new Error(
      tokenResponse?.error_description ??
        tokenResponse?.error ??
        "Authentification Google Drive impossible.",
    );
  }

  tokenCache = {
    accessToken: tokenResponse.access_token,
    expiresAt: Date.now() + (tokenResponse.expires_in ?? 3600) * 1000,
  };

  return tokenCache.accessToken;
}

export async function listDriveChildren(
  folderId: string,
  options?: { mimeType?: string; pageSize?: number },
): Promise<DriveFile[]> {
  if (!folderId.trim()) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID manquant.");
  }

  const accessToken = await getAccessToken();
  const mimeFilter = options?.mimeType
    ? ` and mimeType='${options.mimeType}'`
    : "";
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed=false${mimeFilter}`,
    fields:
      "files(id,name,mimeType,modifiedTime,webViewLink,webContentLink,size)",
    orderBy: "modifiedTime desc",
    pageSize: String(options?.pageSize ?? 100),
  });

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 60 },
    },
  );

  const data = (await response.json().catch(() => null)) as {
    files?: DriveFile[];
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Lecture Google Drive impossible.");
  }

  return data?.files ?? [];
}

export async function listDriveFolders(folderId: string) {
  return listDriveChildren(folderId, {
    mimeType: "application/vnd.google-apps.folder",
  });
}
