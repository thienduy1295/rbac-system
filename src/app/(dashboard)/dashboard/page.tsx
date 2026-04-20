import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getLocale, getDictionary } from "@/i18n";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.dashboard;

  return (
    <div className="space-y-1.5">
      <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
      <p className="text-sm text-muted-foreground">
        {t.greeting}{" "}
        <span className="text-foreground font-medium">{session.email}</span> —{" "}
        {t.role}{" "}
        <span className="text-foreground font-medium">{session.role}</span>
      </p>
    </div>
  );
}
