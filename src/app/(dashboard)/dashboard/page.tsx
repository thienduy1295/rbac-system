import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  return (
    <div className="space-y-1.5">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Xin chào,{" "}
        <span className="text-foreground font-medium">{session.email}</span> —
        role:{" "}
        <span className="text-foreground font-medium">{session.role}</span>
      </p>
    </div>
  );
}
