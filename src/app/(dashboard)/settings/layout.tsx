import { SettingsTabs } from "@/components/settings-tabs";
import { getSession } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions.constants";
import { redirect } from "next/navigation";
import { getLocale, getDictionary } from "@/i18n";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/signin");

  const [userPermissions, locale] = await Promise.all([
    getUserPermissions(session.userId),
    getLocale(),
  ]);
  const dict = await getDictionary(locale);

  const canSeeGroups = [
    PERMISSIONS.GROUPS_CREATE,
    PERMISSIONS.GROUPS_READ,
    PERMISSIONS.GROUPS_UPDATE,
  ].some((p) => userPermissions.includes(p));
  const canSeeUsers = userPermissions.includes(PERMISSIONS.USERS_READ);

  return (
    <div className="flex gap-8">
      <aside className="w-48 shrink-0">
        <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
          {dict.settings.heading}
        </p>
        <SettingsTabs canSeeGroups={canSeeGroups} canSeeUsers={canSeeUsers} />
      </aside>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
