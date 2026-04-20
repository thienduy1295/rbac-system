"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/contexts/locale-context";
import { setLocaleAction } from "@/i18n/locale-action";

export function LanguageSwitcher() {
  const { locale } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = locale === "vi" ? "en" : "vi";
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="text-xs font-medium px-2 h-7 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
    >
      {locale === "vi" ? "EN" : "VI"}
    </button>
  );
}
