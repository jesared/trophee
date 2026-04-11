import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type FooterResponse = {
  contactEmail: string | null;
  contactPhone: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
};

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizePhone(value: string | null | undefined) {
  const trimmed = normalizeText(value);
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");
  if (!digits || /^0+$/.test(digits)) {
    return null;
  }

  return trimmed;
}

function normalizeSocialUrl(value: string | null | undefined) {
  const trimmed = normalizeText(value);
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.replace(/^www\./, "");
    const isGenericRoot =
      ["facebook.com", "instagram.com", "youtube.com"].includes(hostname) &&
      (url.pathname === "/" || url.pathname === "");

    return isGenericRoot ? null : url.toString();
  } catch {
    return null;
  }
}

function serializeFooterSettings(data: {
  contactEmail?: string | null;
  contactPhone?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
} | null): FooterResponse {
  return {
    contactEmail: normalizeText(data?.contactEmail),
    contactPhone: normalizePhone(data?.contactPhone),
    facebookUrl: normalizeSocialUrl(data?.facebookUrl),
    instagramUrl: normalizeSocialUrl(data?.instagramUrl),
    youtubeUrl: normalizeSocialUrl(data?.youtubeUrl),
  };
}

export async function GET() {
  try {
    const data = await prisma.footerSettings.findUnique({
      where: { id: "footer" },
    });

    return NextResponse.json(serializeFooterSettings(data));
  } catch {
    return NextResponse.json(serializeFooterSettings(null));
  }
}
