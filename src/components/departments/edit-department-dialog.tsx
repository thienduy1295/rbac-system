"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  editDepartmentSchema,
  EditDepartmentInput,
} from "@/schemas/department.schema";
import { editDepartmentAction } from "@/actions/department.action";
import { SerializedDepartment, SerializedGroup, SerializedUser } from "@/types";
import { DepartmentFormFields } from "@/components/departments/department-form-fields";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  department: SerializedDepartment;
  departments: SerializedDepartment[];
  groups: SerializedGroup[];
  users: SerializedUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDepartmentDialog({
  department,
  departments,
  groups,
  users,
  open,
  onOpenChange,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<EditDepartmentInput>({
    resolver: zodResolver(editDepartmentSchema),
    defaultValues: {
      name: department.name,
      description: department.description ?? "",
      parentDepartmentId:
        typeof department.parentDepartment === "object"
          ? department.parentDepartment?._id
          : department.parentDepartment,
      managerId:
        typeof department.manager === "object"
          ? department.manager?._id
          : department.manager,
      linkedGroupId:
        typeof department.linkedGroup === "object"
          ? department.linkedGroup?._id
          : department.linkedGroup,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: department.name,
      description: department.description ?? "",
      parentDepartmentId:
        typeof department.parentDepartment === "object"
          ? department.parentDepartment?._id
          : department.parentDepartment,
      managerId:
        typeof department.manager === "object"
          ? department.manager?._id
          : department.manager,
      linkedGroupId:
        typeof department.linkedGroup === "object"
          ? department.linkedGroup?._id
          : department.linkedGroup,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, department._id]);

  const onSubmit = (data: EditDepartmentInput) => {
    startTransition(async () => {
      const result = await editDepartmentAction(department._id, data);

      if (!result.success) {
        if (result.field === "name") {
          form.setError("name", { message: result.message });
        } else {
          toast.error(result.message);
        }
        return;
      }

      toast.success("Cập nhật phòng ban thành công!");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phòng ban</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <DepartmentFormFields
            control={form.control}
            departments={departments}
            groups={groups}
            users={users}
            excludeDepartmentId={department._id}
            disabled={isPending}
          />

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
