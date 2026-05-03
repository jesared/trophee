const MEDIA_FOLDERS = [
  { label: "Logos", value: "logos" },
  { label: "Affiches", value: "affiches" },
  { label: "Photos", value: "photos" },
  { label: "Autres", value: "autres" },
] as const;

type MediaFolderValue = (typeof MEDIA_FOLDERS)[number]["value"];

type CloudinaryResource = {
  asset_id: string;
  public_id: string;
  secure_url?: string;
  bytes?: number;
  created_at?: string;
  format?: string;
};

const CLOUDINARY_API_BASE = "https://api.cloudinary.com/v1_1";
const cloudinaryRootFolder = process.env.CLOUDINARY_MEDIA_FOLDER?.trim() ?? "";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_ENV_MISSING");
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}

function getCloudinaryAuthHeader() {
  const { apiKey, apiSecret } = getCloudinaryConfig();
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
}

function buildApiUrl(pathname: string, params?: URLSearchParams) {
  const { cloudName } = getCloudinaryConfig();
  const search = params?.toString();
  return `${CLOUDINARY_API_BASE}/${cloudName}${pathname}${search ? `?${search}` : ""}`;
}

function sanitizePublicIdSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeMediaFolderPath(folder: MediaFolderValue) {
  return cloudinaryRootFolder ? `${cloudinaryRootFolder}/${folder}` : folder;
}

function ensureAllowedPublicId(value: string) {
  return MEDIA_FOLDERS.some((folder) => {
    const expectedPrefix = `${normalizeMediaFolderPath(folder.value)}/`;
    return value.startsWith(expectedPrefix);
  });
}

async function readCloudinaryResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | (T & { error?: { message?: string } })
    | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? data.error?.message
        : null;
    throw new Error(message || "CLOUDINARY_REQUEST_FAILED");
  }

  return (data ?? {}) as T;
}

async function listFolderWithPrefix(folder: MediaFolderValue) {
  const params = new URLSearchParams({
    prefix: `${normalizeMediaFolderPath(folder)}/`,
    max_results: "200",
    fields: "public_id,secure_url,bytes,created_at,format",
  });

  const response = await fetch(buildApiUrl("/resources/image/upload", params), {
    headers: {
      Authorization: getCloudinaryAuthHeader(),
    },
    cache: "no-store",
  });

  return readCloudinaryResponse<{
    resources?: CloudinaryResource[];
  }>(response);
}

export async function listCloudinaryFolder(folder: MediaFolderValue) {
  const data = await listFolderWithPrefix(folder);
  return data.resources ?? [];
}

export async function uploadCloudinaryImage(
  file: File,
  folder: MediaFolderValue,
) {
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const safeName = sanitizePublicIdSegment(baseName) || "image";
  const publicId = `${normalizeMediaFolderPath(folder)}/${Date.now()}-${safeName}`;

  const formData = new FormData();
  formData.set("file", file);
  formData.set("public_id", publicId);
  formData.set("overwrite", "false");
  formData.set("resource_type", "image");

  const response = await fetch(buildApiUrl("/image/upload"), {
    method: "POST",
    headers: {
      Authorization: getCloudinaryAuthHeader(),
    },
    body: formData,
  });

  return readCloudinaryResponse<CloudinaryResource>(response);
}

export async function deleteCloudinaryResources(publicIds: string[]) {
  if (publicIds.length === 0) {
    return;
  }

  if (!publicIds.every(ensureAllowedPublicId)) {
    throw new Error("CLOUDINARY_INVALID_PUBLIC_ID");
  }

  const response = await fetch(buildApiUrl("/resources/image/upload"), {
    method: "DELETE",
    headers: {
      Authorization: getCloudinaryAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public_ids: publicIds,
    }),
  });

  await readCloudinaryResponse(response);
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function isMediaFolderValue(value: string): value is MediaFolderValue {
  return MEDIA_FOLDERS.some((folder) => folder.value === value);
}

export function getMediaFolders() {
  return [...MEDIA_FOLDERS];
}
