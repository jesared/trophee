export type TourStatus = "DRAFT" | "OPEN" | "CLOSED" | "DONE";

export function getTourStatusLabel(status: TourStatus) {
  switch (status) {
    case "OPEN":
      return "Ouvert";
    case "CLOSED":
      return "Ferme";
    case "DONE":
      return "Termine";
    case "DRAFT":
    default:
      return "Brouillon";
  }
}

export function getAdminTourStatusAction(status: TourStatus) {
  switch (status) {
    case "OPEN":
      return { nextStatus: "CLOSED" as const, label: "Fermer" };
    case "CLOSED":
    case "DRAFT":
      return { nextStatus: "OPEN" as const, label: "Ouvrir" };
    case "DONE":
    default:
      return null;
  }
}
