export const OPEN_ADMIN_TOUR_CREATE_DIALOG_EVENT =
  "admin:tour:create-dialog:open";

export function openAdminTourCreateDialog() {
  window.dispatchEvent(new CustomEvent(OPEN_ADMIN_TOUR_CREATE_DIALOG_EVENT));
}
