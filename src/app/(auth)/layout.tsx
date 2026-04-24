import { ShieldCheck } from "lucide-react";
import { getLocale, getDictionary } from "@/i18n";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.branding;

  const stats = [
    { label: "Roles", value: "∞" },
    { label: "Groups", value: t.groupLevels },
    { label: "Permissions", value: t.permissionsLabel },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-[oklch(0.13_0.01_265)] p-12">
        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(oklch(1_0_0) 1px, transparent 1px),
                              linear-gradient(90deg, oklch(1_0_0) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-125 w-125 rounded-full bg-primary opacity-[0.15] blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-0 h-75 w-75 rounded-full bg-primary opacity-[0.08] blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck size={16} className="text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight text-white">
            RBAC System
          </span>
        </div>

        {/* Quote + stats */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <p className="text-2xl font-light leading-snug tracking-tight text-white">
              {t.tagline1}
              <br />
              <span className="text-primary">{t.tagline2}</span>
            </p>
            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              {t.description}
            </p>
          </div>
          <div className="flex gap-8 border-t border-white/10 pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-lg font-semibold text-white">{s.value}</p>
                <p className="mt-0.5 text-xs text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm space-y-8">{children}</div>
      </div>
    </div>
  );
}
