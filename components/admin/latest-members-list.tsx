import Link from "next/link";
import { Users } from "lucide-react";

import { formatContentDate } from "@/lib/admin/content-display";
import {
  userRoleLabels,
  userRoleStyles,
  userStatusLabels,
  userStatusStyles,
  type DashboardMember,
} from "@/types/admin";
import { cn } from "@/lib/utils";

type LatestMembersListProps = {
  members: DashboardMember[];
};

export function LatestMembersList({ members }: LatestMembersListProps) {
  return (
    <section
      aria-labelledby="latest-members-heading"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2
            id="latest-members-heading"
            className="text-lg font-semibold text-brand-navy"
          >
            Son Üyeler
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Platforma yeni kayıt olan üyeler
          </p>
        </div>
        <Link
          href="/admin/users"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          Tümü
        </Link>
      </div>

      {members.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Henüz üye bulunmuyor.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {members.map((member) => (
            <li key={member.id}>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6"
              >
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                  {member.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatar}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <Users className="size-4 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-brand-navy">
                    {member.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                      userRoleStyles[member.role]
                    )}
                  >
                    {userRoleLabels[member.role]}
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                      userStatusStyles[member.status]
                    )}
                  >
                    {userStatusLabels[member.status]}
                  </span>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {formatContentDate(member.createdAt)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
