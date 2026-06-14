export const TRASH_ENTITIES = [
  "contents",
  "files",
  "tests",
  "dictionary",
  "media",
] as const;

export type TrashEntity = (typeof TRASH_ENTITIES)[number];

export type TrashListItem = {
  id: string;
  title: string;
  subtitle: string | null;
  deletedAt: string;
  meta: string | null;
};

export const trashEntityLabels: Record<TrashEntity, string> = {
  contents: "İçerikler",
  files: "Dosyalar",
  tests: "Testler",
  dictionary: "Sözlük",
  media: "Medya",
};
