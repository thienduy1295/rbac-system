import { redirect } from "next/navigation";
import { Users, FolderKey, Building2, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getLocale, getDictionary } from "@/i18n";
import { getUserPermissions } from "@/lib/permissions";
import { countUsers } from "@/repositories/user.repository";
import { countGroups } from "@/repositories/group.repository";
import { countDepartments } from "@/repositories/department.repository";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.dashboard;

  const [userCount, groupCount, deptCount, permissions] = await Promise.all([
    countUsers(),
    countGroups(),
    countDepartments(),
    getUserPermissions(session.userId),
  ]);

  const stats = [
    {
      label: dict.settings.tabs.users,
      value: userCount,
      icon: Users,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: dict.settings.tabs.groups,
      value: groupCount,
      icon: FolderKey,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: dict.nav.departments,
      value: deptCount,
      icon: Building2,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    {
      label: dict.settings.tabs.permissions,
      value: permissions.length,
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.greeting}{" "}
          <span className="font-medium text-foreground">{session.email}</span>{" "}
          — {t.role}{" "}
          <span className="font-medium text-foreground capitalize">
            {session.role}
          </span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-border/60">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {label}
                </p>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}
                >
                  <Icon size={16} className={color} />
                </div>
              </div>
              <p className="text-2xl font-bold tabular-nums">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
