"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth.action";
import { useLocale } from "@/contexts/locale-context";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const { dict } = useLocale();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(async () => await signOutAction())}
      className="text-muted-foreground hover:text-white hover:bg-destructive gap-1.5"
    >
      {isPending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <LogOut size={14} />
      )}
      <span className="text-sm">{dict.nav.logout}</span>
    </Button>
  );
}
