import { SettingsTabs } from "@/components/settings-tabs";
import { getSession } from "@/lib/auth";
import { hasAnyPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions.constants";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/signin");

  const [canSeeGroups, canSeeUsers] = await Promise.all([
    hasAnyPermission(session.userId, [
      PERMISSIONS.GROUPS_CREATE,
      PERMISSIONS.GROUPS_READ,
      PERMISSIONS.GROUPS_UPDATE,
    ]),
    hasAnyPermission(session.userId, [PERMISSIONS.USERS_READ]),
  ]);

  return (
    <div className="flex gap-8">
      {/* Sidebar tabs */}
      <aside className="w-48 shrink-0">
        <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
          Settings
        </p>
        <SettingsTabs canSeeGroups={canSeeGroups} canSeeUsers={canSeeUsers} />
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
