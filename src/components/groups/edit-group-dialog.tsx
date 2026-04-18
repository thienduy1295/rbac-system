"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { editGroupSchema, EditGroupInput } from "@/schemas/group.schema";
import { editGroupAction } from "@/actions/group.action";
import { SerializedGroup, SerializedPermission } from "@/types";
import { GroupUserStep } from "@/components/groups/group-user-step";
import { getGroupUsersAction } from "@/actions/group.action";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

interface Props {
  group: SerializedGroup;
  permissions: SerializedPermission[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canUpdate?: boolean;
  canUpdateUsers?: boolean;
}

export function EditGroupDialog({
  group,
  permissions,
  open,
  onOpenChange,
  canUpdate,
  canUpdateUsers,
}: Props) {
  const initialStep = canUpdate ? 1 : 2;
  const [step, setStep] = useState<1 | 2>(initialStep);
  const [isPending, startTransition] = useTransition();
  const [currentUserIds, setCurrentUserIds] = useState<string[]>([]);

  const isTwoStep = canUpdate && canUpdateUsers;
  const isOneStep =
    (canUpdate && !canUpdateUsers) || (!canUpdate && canUpdateUsers);

  const form = useForm<EditGroupInput>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      name: group.name,
      description: group.description ?? "",
      permissionIds: group.permissions.map((p) => p._id),
      userIds: [],
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: group.name,
      description: group.description ?? "",
      permissionIds: group.permissions.map((p) => p._id),
      userIds: [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group]);

  useEffect(() => {
    if (!open) return;
    getGroupUsersAction(group._id).then((users) => {
      const ids = users.map((u) => u._id);
      setCurrentUserIds(ids);
      form.setValue("userIds", ids);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group._id]);

  const groupedPermissions = permissions.reduce(
    (acc, p) => {
      if (!acc[p.resource]) acc[p.resource] = [];
      acc[p.resource].push(p);
      return acc;
    },
    {} as Record<string, SerializedPermission[]>,
  );

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const name = form.getValues("name");
    const permissionIds = form.getValues("permissionIds");

    // Validate thủ công
    let hasError = false;

    if (!name || name.length < 2) {
      form.setError("name", { message: "Tên group phải có ít nhất 2 ký tự" });
      hasError = true;
    } else {
      form.clearErrors("name");
    }

    if (!permissionIds || permissionIds.length === 0) {
      form.setError("permissionIds", {
        message: "Phải chọn ít nhất 1 permission",
      });
      hasError = true;
    } else {
      form.clearErrors("permissionIds");
    }

    if (!hasError) setStep(2);
  };

  const onSubmit = (data: EditGroupInput) => {
    startTransition(async () => {
      const payload = canUpdate
        ? data
        : {
            ...data,
            name: group.name,
            permissionIds: group.permissions.map((p) => p._id),
          };

      const result = await editGroupAction(group._id, payload);

      if (!result.success) {
        if (result.field === "name") {
          form.setError("name", { message: result.message });
          setStep(1);
        } else {
          toast.error(result.message);
        }
        return;
      }

      toast.success("Cập nhật group thành công!");
      onOpenChange(false);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setStep(1);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {step === 1 ? "Chỉnh sửa group" : "Quản lý users"}
            </DialogTitle>

            {canUpdate && canUpdateUsers && (
              <div className="flex items-center gap-1.5 mr-6">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? "bg-primary" : "bg-muted-foreground/30"}`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? "bg-primary" : "bg-muted-foreground/30"}`}
                />
              </div>
            )}
          </div>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          onKeyDown={(e) => {
            // Chặn Enter trigger submit khi đang ở step 1
            if (e.key === "Enter" && step === 1) {
              e.preventDefault();
            }
          }}
        >
          {/* ── Step 1 ── */}
          {canUpdate && step === 1 && (
            <>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Tên group</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Mô tả{" "}
                      <span className="text-muted-foreground font-normal">
                        (tuỳ chọn)
                      </span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="permissionIds"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Permissions</FieldLabel>
                    <div className="border border-input rounded-md divide-y divide-border max-h-52 overflow-y-auto">
                      {Object.entries(groupedPermissions).map(
                        ([resource, perms]) => {
                          const allChecked = perms.every((p) =>
                            field.value.includes(p._id),
                          );
                          const someChecked = perms.some((p) =>
                            field.value.includes(p._id),
                          );
                          return (
                            <div key={resource}>
                              <label className="flex items-center gap-3 px-3 py-2 bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                                <Checkbox
                                  checked={allChecked}
                                  data-state={
                                    someChecked && !allChecked
                                      ? "indeterminate"
                                      : undefined
                                  }
                                  disabled={isPending}
                                  onCheckedChange={(val) => {
                                    const ids = perms.map((p) => p._id);
                                    field.onChange(
                                      val
                                        ? Array.from(
                                            new Set([...field.value, ...ids]),
                                          )
                                        : field.value.filter(
                                            (v) => !ids.includes(v),
                                          ),
                                    );
                                  }}
                                />
                                <span className="text-sm font-medium capitalize">
                                  {resource}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {
                                    perms.filter((p) =>
                                      field.value.includes(p._id),
                                    ).length
                                  }
                                  /{perms.length}
                                </span>
                              </label>
                              {perms.map((permission) => (
                                <label
                                  key={permission._id}
                                  className="flex items-center gap-3 pl-9 pr-3 py-2 hover:bg-accent cursor-pointer transition-colors"
                                >
                                  <Checkbox
                                    checked={field.value.includes(
                                      permission._id,
                                    )}
                                    disabled={isPending}
                                    onCheckedChange={(val) => {
                                      field.onChange(
                                        val
                                          ? [...field.value, permission._id]
                                          : field.value.filter(
                                              (v) => v !== permission._id,
                                            ),
                                      );
                                    }}
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm">
                                      {permission.name}
                                    </span>
                                    {permission.description && (
                                      <span className="text-xs text-muted-foreground">
                                        {permission.description}
                                      </span>
                                    )}
                                  </div>
                                </label>
                              ))}
                            </div>
                          );
                        },
                      )}
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && canUpdateUsers && (
            <Controller
              name="userIds"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Users trong group</FieldLabel>
                  <GroupUserStep
                    selectedUserIds={field.value ?? []}
                    onChange={field.onChange}
                    disabled={isPending}
                    excludeUserIds={currentUserIds}
                  />
                </Field>
              )}
            />
          )}

          <DialogFooter>
            {isTwoStep && step === 1 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Huỷ
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isPending}
                >
                  Tiếp theo <ChevronRight size={15} />
                </Button>
              </>
            )}

            {isTwoStep && step === 2 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isPending}
                >
                  <ChevronLeft size={15} /> Quay lại
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </>
            )}

            {isOneStep && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Huỷ
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
