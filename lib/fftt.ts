import { createHash, createHmac } from "crypto";

type FfttAuth = {
  id: string;
  tm: string;
  tmc: string;
  serie?: string;
};

type FfttRequestParams = Record<string, string | number | undefined>;

const FFTT_BASE_URL = process.env.FFTT_BASE_URL ?? "";
const FFTT_APP_ID = process.env.FFTT_APP_ID ?? "";
const FFTT_APP_PASSWORD = process.env.FFTT_APP_PASSWORD ?? "";
const FFTT_LICENCE_ENDPOINT =
  process.env.FFTT_LICENCE_ENDPOINT ?? "xml_licence_b.php";
const FFTT_LICENCE_PARAM = process.env.FFTT_LICENCE_PARAM ?? "licence";
const FFTT_CLUB_DETAIL_ENDPOINT =
  process.env.FFTT_CLUB_DETAIL_ENDPOINT ?? "xml_club_detail.php";
const FFTT_CLUB_DETAIL_PARAM =
  process.env.FFTT_CLUB_DETAIL_PARAM ?? "club";

export function isFfttEnabled() {
  return Boolean(FFTT_BASE_URL && FFTT_APP_ID && FFTT_APP_PASSWORD);
}

function ensureConfig() {
  if (!FFTT_BASE_URL || !FFTT_APP_ID || !FFTT_APP_PASSWORD) {
    throw new Error(
      "FFTT config manquante (FFTT_BASE_URL/FFTT_APP_ID/FFTT_APP_PASSWORD).",
    );
  }
}

function pad(value: number, size: number) {
  return String(value).padStart(size, "0");
}

export function getFfttTimestamp(date = new Date()) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1, 2),
    pad(date.getDate(), 2),
    pad(date.getHours(), 2),
    pad(date.getMinutes(), 2),
    pad(date.getSeconds(), 2),
    pad(date.getMilliseconds(), 3),
  ].join("");
}

export function getFfttTmc(timestamp: string, password: string) {
  const ccle = createHash("md5").update(password, "utf8").digest("hex");
  return createHmac("sha1", ccle).update(timestamp, "utf8").digest("hex");
}

export function buildFfttAuth(serie?: string): FfttAuth {
  const tm = getFfttTimestamp();
  const tmc = getFfttTmc(tm, FFTT_APP_PASSWORD);
  return {
    id: FFTT_APP_ID,
    tm,
    tmc,
    ...(serie ? { serie } : {}),
  };
}

function buildUrl(script: string, params: FfttRequestParams, auth: FfttAuth) {
  const base = FFTT_BASE_URL.endsWith("/")
    ? FFTT_BASE_URL
    : `${FFTT_BASE_URL}/`;
  const url = new URL(script, base);
  const search = new URLSearchParams();

  Object.entries({ ...params, ...auth }).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    search.set(key, String(value));
  });

  url.search = search.toString();
  return url.toString();
}

export async function callFftt(
  script: string,
  params: FfttRequestParams,
  serie?: string,
) {
  ensureConfig();
  const auth = buildFfttAuth(serie);
  const url = buildUrl(script, params, auth);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`FFTT error ${response.status}: ${message}`);
  }
  return response.text();
}

export async function initFfttSerie() {
  // Selon la doc, le serie est généré via xml_initialisation.php.
  // Certains comptes FFTT n'exigent pas de serie pour cette route.
  return callFftt("xml_initialisation.php", {}, undefined);
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractTag(xml: string, tag: string) {
  const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i").exec(xml);
  return match ? decodeXmlEntities(match[1].trim()) : null;
}

export function parseFfttSerie(xml: string) {
  return (
    extractTag(xml, "serie") ??
    extractTag(xml, "numserie") ??
    extractTag(xml, "serial")
  );
}

export type FfttLicenceInfo = {
  firstName?: string;
  lastName?: string;
  club?: string;
  clubId?: string;
  points?: number;
  licence?: string;
};

export async function fetchFfttLicence(licence: string, serie?: string) {
  const xml = await callFftt(
    FFTT_LICENCE_ENDPOINT,
    { [FFTT_LICENCE_PARAM]: licence },
    serie,
  );

  const pointsRaw =
    extractTag(xml, "points") ??
    extractTag(xml, "point") ??
    extractTag(xml, "pts");

  const points = pointsRaw ? Number(pointsRaw.replace(",", ".")) : undefined;

  return {
    licence: extractTag(xml, "licence") ?? licence,
    firstName:
      extractTag(xml, "prenom") ?? extractTag(xml, "firstname") ?? undefined,
    lastName:
      extractTag(xml, "nom") ?? extractTag(xml, "lastname") ?? undefined,
    club: extractTag(xml, "nomclub") ?? extractTag(xml, "club") ?? undefined,
    clubId:
      extractTag(xml, "numclub") ?? extractTag(xml, "clubid") ?? undefined,
    points: Number.isFinite(points) ? Math.round(points as number) : undefined,
  } satisfies FfttLicenceInfo;
}

export type FfttClubDetail = {
  id: string;
  number?: string;
  hallName?: string;
  hallAddress?: string;
  hallZip?: string;
  hallCity?: string;
  contactName?: string;
  contactFirstName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export async function fetchFfttClubDetail(
  clubId: string,
  serie?: string,
): Promise<FfttClubDetail> {
  const xml = await callFftt(
    FFTT_CLUB_DETAIL_ENDPOINT,
    { [FFTT_CLUB_DETAIL_PARAM]: clubId },
    serie,
  );

  return {
    id: extractTag(xml, "idclub") ?? clubId,
    number: extractTag(xml, "numero") ?? undefined,
    hallName: extractTag(xml, "nomsalle") ?? undefined,
    hallAddress: [
      extractTag(xml, "adressesalle1"),
      extractTag(xml, "adressesalle2"),
      extractTag(xml, "adressesalle3"),
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || undefined,
    hallZip: extractTag(xml, "codepsalle") ?? undefined,
    hallCity: extractTag(xml, "villesalle") ?? undefined,
    contactName: extractTag(xml, "nomcor") ?? undefined,
    contactFirstName: extractTag(xml, "prenomcor") ?? undefined,
    contactEmail: extractTag(xml, "mailcor") ?? undefined,
    contactPhone: extractTag(xml, "telcor") ?? undefined,
  };
}
