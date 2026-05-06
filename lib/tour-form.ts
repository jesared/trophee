export type TourFormValues = {
  seasonId: string;
  name: string;
  dateValue: string;
  clubId: string;
  venue: string;
  city: string;
  address: string;
  coverUrl: string;
  rulesUrl: string;
};

export function normalizeMediaUrl(value: string) {
  if (!value) return value;
  const signedMarker = "/storage/v1/object/sign/";
  const publicMarker = "/storage/v1/object/public/";
  if (value.includes(signedMarker)) {
    const [base] = value.split("?");
    return base.replace(signedMarker, publicMarker);
  }
  return value;
}

export function readTourFormData(formData: FormData): TourFormValues {
  return {
    seasonId: String(formData.get("seasonId") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    dateValue: String(formData.get("date") ?? "").trim(),
    clubId: String(formData.get("clubId") ?? "").trim(),
    venue: String(formData.get("venue") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    coverUrl: normalizeMediaUrl(
      String(formData.get("coverUrl") ?? "").trim(),
    ),
    rulesUrl: normalizeMediaUrl(
      String(formData.get("rulesUrl") ?? "").trim(),
    ),
  };
}

export function validateTourFormData(values: TourFormValues) {
  if (
    !values.seasonId ||
    !values.name ||
    !values.dateValue ||
    !values.venue ||
    !values.clubId
  ) {
    return {
      ok: false as const,
      message: "Saison, club, nom, date et salle obligatoires.",
    };
  }

  const date = new Date(values.dateValue);

  if (Number.isNaN(date.getTime())) {
    return { ok: false as const, message: "Date invalide." };
  }

  return {
    ok: true as const,
    data: {
      seasonId: values.seasonId,
      name: values.name,
      date,
      clubId: values.clubId,
      venue: values.venue || null,
      city: values.city || null,
      address: values.address || null,
      coverUrl: values.coverUrl || null,
      rulesUrl: values.rulesUrl || null,
    },
  };
}
