import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { NavTabs } from "@/components/nav-tabs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 flex items-center h-12">
          {/* Logo — chiếm 1/3 bên trái */}
          <div className="flex-1">
            <Link href="/dashboard" className="flex items-center gap-2 w-fit">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <ShieldCheck size={14} className="text-primary-foreground" />
              </div>
              <span className="font-semibold tracking-tight text-sm">
                RBAC System
              </span>
            </Link>
          </div>

          {/* Nav — căn giữa */}
          <NavTabs />

          {/* Logout — chiếm 1/3 bên phải, căn phải */}
          <div className="flex-1 flex justify-end items-center gap-2">
            <div className="w-px h-4 bg-border" />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
