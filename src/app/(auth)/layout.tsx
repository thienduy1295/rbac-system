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
      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px),
                              linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-600 opacity-20 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight">
            RBAC System
          </span>
        </div>

        {/* Quote */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-4">
            <p className="text-2xl font-light text-white leading-snug tracking-tight">
              {t.tagline1}
              <br />
              <span className="text-indigo-400">{t.tagline2}</span>
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              {t.description}
            </p>
          </div>
          <div className="flex gap-8 pt-4 border-t border-zinc-800">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-white font-semibold text-lg">{s.value}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: form (children) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-8">{children}</div>
      </div>
    </div>
  );
}
