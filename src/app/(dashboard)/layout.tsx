import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { getSession } from "@/lib/auth";
import { findUserById } from "@/repositories/user.repository";
import { getUserPermissions } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions.constants";
import { IRole } from "@/models/Role";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/signin");

  const [user, userPermissions] = await Promise.all([
    findUserById(session.userId),
    getUserPermissions(session.userId),
  ]);

  const canSeeGroups = [
    PERMISSIONS.GROUPS_CREATE,
    PERMISSIONS.GROUPS_READ,
    PERMISSIONS.GROUPS_UPDATE,
  ].some((p) => userPermissions.includes(p));

  const canSeeUsers = userPermissions.includes(PERMISSIONS.USERS_READ);

  const role = user?.role as IRole | undefined;

  return (
    <DashboardShell
      userName={user?.name ?? session.email}
      userRole={role?.name ?? ""}
      canSeeGroups={canSeeGroups}
      canSeeUsers={canSeeUsers}
    >
      {children}
    </DashboardShell>
  );
}
