"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SerializedPermission } from "@/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Props {
  grouped: Record<string, SerializedPermission[]>;
}

function ResourceGroup({
  resource,
  perms,
}: {
  resource: string;
  perms: SerializedPermission[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border border-border rounded-lg overflow-hidden"
    >
      {/* Header */}
      <CollapsibleTrigger className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted/50 hover:bg-muted transition-colors">
        <ShieldCheck size={14} className="text-muted-foreground shrink-0" />
        <span className="text-sm font-medium capitalize">{resource}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {perms.length}
        </Badge>
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </CollapsibleTrigger>

      {/* Content */}
      <CollapsibleContent className="divide-y divide-border">
        {perms.map((p) => (
          <div
            key={p._id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{p.name}</p>
              {p.description && (
                <p className="text-xs text-muted-foreground">{p.description}</p>
              )}
            </div>
            <Badge variant="outline" className="text-xs capitalize">
              {p.action}
            </Badge>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function PermissionList({ grouped }: Props) {
  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([resource, perms]) => (
        <ResourceGroup key={resource} resource={resource} perms={perms} />
      ))}
    </div>
  );
}
