import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const FALLBACK_SETTINGS = {
  contactEmail: "contact@tropheefg.fr",
  contactPhone: "03 00 00 00 00",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "",
};

export async function GET() {
  try {
    const data = await prisma.footerSettings.findUnique({
      where: { id: "footer" },
    });

    return NextResponse.json({
      contactEmail: data?.contactEmail ?? FALLBACK_SETTINGS.contactEmail,
      contactPhone: data?.contactPhone ?? FALLBACK_SETTINGS.contactPhone,
      facebookUrl: data?.facebookUrl ?? FALLBACK_SETTINGS.facebookUrl,
      instagramUrl: data?.instagramUrl ?? FALLBACK_SETTINGS.instagramUrl,
      youtubeUrl: data?.youtubeUrl ?? FALLBACK_SETTINGS.youtubeUrl,
    });
  } catch {
    return NextResponse.json(FALLBACK_SETTINGS);
  }
}
