"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  updateUserRoleSchema,
  UpdateUserRoleInput,
} from "@/schemas/user.schema";
import { updateUserRoleAction } from "@/actions/user.action";
import { SerializedRole, SerializedUser } from "@/types";
import { useLocale } from "@/contexts/locale-context";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  user: SerializedUser;
  roles: SerializedRole[];
  currentUserHierarchy: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UpdateRoleDialog({
  user,
  roles,
  currentUserHierarchy,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const { dict } = useLocale();
  const t = dict.users;

  const form = useForm<UpdateUserRoleInput>({
    resolver: zodResolver(updateUserRoleSchema),
    defaultValues: { roleId: user.role._id },
  });

  const assignableRoles = roles.filter(
    (r) => r.hierarchy > currentUserHierarchy,
  );

  const onSubmit = (data: UpdateUserRoleInput) => {
    startTransition(async () => {
      const result = await updateUserRoleAction(user._id, data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(t.updateRoleSuccess);
      onSuccess?.();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.updateRole}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="px-3 py-2.5 rounded-md bg-muted/50 border border-border">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>

          <Controller
            name="roleId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t.columns.role}</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectRole}>
                      {assignableRoles.find((r) => r._id === field.value)
                        ?.name ?? t.selectRole}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((role) => (
                      <SelectItem key={role._id} value={role._id}>
                        <span className="capitalize">{role.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({t.hierarchy}: {role.hierarchy})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {dict.common.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {dict.common.saving}
                </>
              ) : (
                dict.common.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
