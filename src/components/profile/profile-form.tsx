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
      toast.success("Cập nhật tên thành công!");
    });
  };

  const onChangePassword = (data: ChangePasswordInput) => {
    startPasswordTransition(async () => {
      const result = await changePasswordAction(data);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Đổi mật khẩu thành công!");
      passwordForm.reset();
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Update name */}
      <Card className="p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm">Thông tin cá nhân</h3>
          <p className="text-xs text-muted-foreground">Cập nhật tên hiển thị</p>
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
            <FieldLabel>Tên hiển thị</FieldLabel>
            <Input
              {...nameForm.register("name")}
              placeholder="Nhập tên..."
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
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Change password */}
      <Card className="p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm">Đổi mật khẩu</h3>
          <p className="text-xs text-muted-foreground">
            Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số
          </p>
        </div>

        <Separator />

        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="space-y-4"
        >
          <Field data-invalid={!!passwordForm.formState.errors.currentPassword}>
            <FieldLabel>Mật khẩu hiện tại</FieldLabel>
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
            <FieldLabel>Mật khẩu mới</FieldLabel>
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
            <FieldLabel>Xác nhận mật khẩu mới</FieldLabel>
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
                  Đang lưu...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
