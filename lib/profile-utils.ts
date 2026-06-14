const MAX_LIST_ITEMS = 12;
const MAX_ITEM_LENGTH = 80;

export function sanitizeStringList(
  value: unknown,
  maxItems = MAX_LIST_ITEMS
): string[] | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return [];

  const items = [
    ...new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .map((item) => item.slice(0, MAX_ITEM_LENGTH))
    ),
  ].slice(0, maxItems);

  return items;
}

export function validateStringList(
  items: string[],
  label: string
): string | null {
  if (items.length > MAX_LIST_ITEMS) {
    return `${label} en fazla ${MAX_LIST_ITEMS} madde olabilir.`;
  }

  const tooLong = items.find((item) => item.length > MAX_ITEM_LENGTH);
  if (tooLong) {
    return `${label} maddeleri en fazla ${MAX_ITEM_LENGTH} karakter olabilir.`;
  }

  return null;
}
