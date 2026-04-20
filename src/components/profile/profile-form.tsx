"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  updateNameSchema,
  UpdateNameInput,
  changePasswordSchema,
  ChangePasswordInput,
} from "@/schemas/profile.schema";
import { updateNameAction, changePasswordAction } from "@/actions/profile.action";
import { useLocale } from "@/contexts/locale-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

interface Props {
  initialName: string;
  email: string;
}

export function ProfileForm({ initialName, email }: Props) {
  const [isNamePending, startNameTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const { dict } = useLocale();
  const t = dict.profile;

  const nameForm = useForm<UpdateNameInput>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: { name: initialName },
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onUpdateName = (data: UpdateNameInput) => {
    startNameTransition(async () => {
      const result = await updateNameAction(data);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(t.updateNameSuccess);
    });
  };

  const onChangePassword = (data: ChangePasswordInput) => {
    startPasswordTransition(async () => {
      const result = await changePasswordAction(data);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(t.changePasswordSuccess);
      passwordForm.reset();
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Update name */}
      <Card className="p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm">{t.personalInfo}</h3>
          <p className="text-xs text-muted-foreground">{t.personalInfoSubtitle}</p>
        </div>

        <Separator />

        <form
          onSubmit={nameForm.handleSubmit(onUpdateName)}
          className="space-y-4"
        >
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input value={email} disabled className="bg-muted/50" />
          </Field>

          <Field data-invalid={!!nameForm.formState.errors.name}>
            <FieldLabel>{t.displayName}</FieldLabel>
            <Input
              {...nameForm.register("name")}
              placeholder={t.namePlaceholder}
              disabled={isNamePending}
            />
            {nameForm.formState.errors.name && (
              <FieldError errors={[nameForm.formState.errors.name]} />
            )}
          </Field>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isNamePending}>
              {isNamePending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t.saving}
                </>
              ) : (
                t.saveChanges
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Change password */}
      <Card className="p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm">{t.changePassword}</h3>
          <p className="text-xs text-muted-foreground">{t.changePasswordSubtitle}</p>
        </div>

        <Separator />

        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="space-y-4"
        >
          <Field data-invalid={!!passwordForm.formState.errors.currentPassword}>
            <FieldLabel>{t.currentPassword}</FieldLabel>
            <Input
              type="password"
              {...passwordForm.register("currentPassword")}
              placeholder="••••••••"
              disabled={isPasswordPending}
            />
            {passwordForm.formState.errors.currentPassword && (
              <FieldError
                errors={[passwordForm.formState.errors.currentPassword]}
              />
            )}
          </Field>

          <Field data-invalid={!!passwordForm.formState.errors.newPassword}>
            <FieldLabel>{t.newPassword}</FieldLabel>
            <Input
              type="password"
              {...passwordForm.register("newPassword")}
              placeholder="••••••••"
              disabled={isPasswordPending}
            />
            {passwordForm.formState.errors.newPassword && (
              <FieldError errors={[passwordForm.formState.errors.newPassword]} />
            )}
          </Field>

          <Field data-invalid={!!passwordForm.formState.errors.confirmPassword}>
            <FieldLabel>{t.confirmNewPassword}</FieldLabel>
            <Input
              type="password"
              {...passwordForm.register("confirmPassword")}
              placeholder="••••••••"
              disabled={isPasswordPending}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <FieldError
                errors={[passwordForm.formState.errors.confirmPassword]}
              />
            )}
          </Field>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isPasswordPending}>
              {isPasswordPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t.saving}
                </>
              ) : (
                t.changePassword
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
