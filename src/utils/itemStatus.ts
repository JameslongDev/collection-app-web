export const ITEM_STATUS_LABELS = {
  have: "มีแล้ว",
  want: "อยากได้",
  searching: "กำลังหา",
  reserved: "จองแล้ว",
  for_sale: "ขายต่อ",
} as const;

export type ItemStatus = keyof typeof ITEM_STATUS_LABELS;

export function getItemStatusLabel(status: string): string {
  return ITEM_STATUS_LABELS[status as ItemStatus] ?? status;
}

export function getItemStatusClassName(status: string): string {
  switch (status) {
    case "have":
      return "bg-emerald-50 text-emerald-700";

    case "want":
      return "bg-violet-50 text-violet-700";

    case "searching":
      return "bg-amber-50 text-amber-700";

    case "reserved":
      return "bg-blue-50 text-blue-700";

    case "for_sale":
      return "bg-rose-50 text-rose-700";

    default:
      return "bg-gray-50 text-gray-600";
  }
}
