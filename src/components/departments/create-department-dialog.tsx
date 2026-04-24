"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createDepartmentSchema,
  CreateDepartmentInput,
} from "@/schemas/department.schema";
import { createDepartmentAction } from "@/actions/department.action";
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
  departments: SerializedDepartment[];
  groups: SerializedGroup[];
  users: SerializedUser[];
}

export function CreateDepartmentDialog({ departments, groups, users }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateDepartmentInput>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      name: "",
      description: "",
      parentDepartmentId: undefined,
      managerId: undefined,
      linkedGroupId: undefined,
    },
  });

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const onSubmit = (data: CreateDepartmentInput) => {
    startTransition(async () => {
      const result = await createDepartmentAction(data);

      if (!result.success) {
        if (result.field === "name") {
          form.setError("name", { message: result.message });
        } else {
          toast.error(result.message);
        }
        return;
      }

      toast.success("Tạo phòng ban thành công!");
      handleClose();
    });
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={15} />
        Tạo phòng ban
      </Button>

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo phòng ban mới</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <DepartmentFormFields
              control={form.control}
              departments={departments}
              groups={groups}
              users={users}
              disabled={isPending}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Đang tạo...
                  </>
                ) : (
                  "Tạo phòng ban"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
