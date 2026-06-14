export type ActivityLogUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

export type ActivityLogItem = {
  id: string;
  action: string;
  actionLabel: string;
  entityType: string;
  entityTypeLabel: string;
  entityId: string | null;
  description: string;
  metadata: unknown;
  createdAt: string;
  createdAtLabel: string;
  user: ActivityLogUser | null;
};

export type ActivityFilterOptions = {
  actions: { value: string; label: string }[];
  entityTypes: { value: string; label: string }[];
};
