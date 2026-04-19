"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { createGroupSchema, CreateGroupInput } from "@/schemas/group.schema";
import { createGroupAction } from "@/actions/group.action";
import { SerializedGroup, SerializedPermission } from "@/types";
import { GroupUserStep } from "@/components/groups/group-user-step";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props {
  permissions: SerializedPermission[];
  userGroups: SerializedGroup[];
  isSuperAdmin: boolean;
  onSuccess?: () => void;
}

export function CreateGroupDialog({
  permissions,
  userGroups,
  isSuperAdmin,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
      userIds: [],
      parentGroupId: isSuperAdmin ? undefined : userGroups[0]?._id, // ← default là group đầu tiên
    },
  });

  const groupedPermissions = permissions.reduce(
    (acc, p) => {
      if (!acc[p.resource]) acc[p.resource] = [];
      acc[p.resource].push(p);
      return acc;
    },
    {} as Record<string, SerializedPermission[]>,
  );

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    form.reset();
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const name = form.getValues("name");
    const permissionIds = form.getValues("permissionIds");
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

  const onSubmit = (data: CreateGroupInput) => {
    startTransition(async () => {
      const result = await createGroupAction(data);

      if (!result.success) {
        if (result.field === "name") {
          form.setError("name", { message: result.message });
          setStep(1); // quay lại step 1 nếu lỗi tên
        } else {
          toast.error(result.message);
        }
        return;
      }

      toast.success("Tạo group thành công!");
      onSuccess?.();
      handleClose();
    });
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={15} />
        Tạo group
      </Button>

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {step === 1 ? "Tạo group mới" : "Thêm users vào group"}
              </DialogTitle>
              {/* Step indicator */}
              <div className="flex items-center gap-1.5 mr-6">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? "bg-primary" : "bg-muted-foreground/30"}`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? "bg-primary" : "bg-muted-foreground/30"}`}
                />
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* ── Step 1: Info + Permissions ── */}
            {step === 1 && (
              <>
                {!isSuperAdmin && userGroups.length > 0 && (
                  <Controller
                    name="parentGroupId"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Tạo dưới group</FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn group cha...">
                              {userGroups.find((g) => g._id === field.value)
                                ?.name ?? "Chọn group cha..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {userGroups.map((group) => (
                              <SelectItem key={group._id} value={group._id}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                )}

                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Tên group</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="vd: Marketing Team"
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
                        placeholder="Mô tả ngắn về group này"
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

            {/* ── Step 2: Add Users ── */}
            {step === 2 && (
              <Controller
                name="userIds"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>
                      Thêm users{" "}
                      <span className="text-muted-foreground font-normal">
                        (tuỳ chọn)
                      </span>
                    </FieldLabel>
                    <GroupUserStep
                      selectedUserIds={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  </Field>
                )}
              />
            )}

            <DialogFooter>
              {step === 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isPending}
                  >
                    Huỷ
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isPending}
                  >
                    Tiếp theo
                    <ChevronRight size={15} />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isPending}
                  >
                    <ChevronLeft size={15} />
                    Quay lại
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      "Tạo group"
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
