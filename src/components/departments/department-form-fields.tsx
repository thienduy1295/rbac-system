"use client";

import { Control, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SerializedDepartment, SerializedGroup, SerializedUser } from "@/types";
import { CreateDepartmentInput } from "@/schemas/department.schema";

interface Props {
  control: Control<CreateDepartmentInput>;
  departments: SerializedDepartment[];
  groups: SerializedGroup[];
  users: SerializedUser[];
  excludeDepartmentId?: string; // loại trừ dept đang edit khỏi list parent
  disabled?: boolean;
}

export function DepartmentFormFields({
  control,
  departments,
  groups,
  users,
  excludeDepartmentId,
  disabled,
}: Props) {
  const availableDepts = departments.filter(
    (d) => d._id !== excludeDepartmentId,
  );

  return (
    <>
      {/* Name */}
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Tên phòng ban</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="vd: Engineering"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={control}
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
              placeholder="Mô tả ngắn về phòng ban"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Parent Department */}
      <Controller
        name="parentDepartmentId"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>
              Phòng ban cha{" "}
              <span className="text-muted-foreground font-normal">
                (tuỳ chọn)
              </span>
            </FieldLabel>
            <Select
              value={field.value ?? ""}
              onValueChange={(val) => field.onChange(val || undefined)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Không có (phòng ban gốc)">
                  {availableDepts.find((d) => d._id === field.value)?.name ??
                    "Không có (phòng ban gốc)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Không có (phòng ban gốc)</SelectItem>
                {availableDepts.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      {/* Manager */}
      <Controller
        name="managerId"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>
              Manager{" "}
              <span className="text-muted-foreground font-normal">
                (tuỳ chọn)
              </span>
            </FieldLabel>
            <Select
              value={field.value ?? ""}
              onValueChange={(val) => field.onChange(val || undefined)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn manager...">
                  {users.find((u) => u._id === field.value)?.name ??
                    "Chưa có manager"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Chưa có manager</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {user.email}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      {/* Linked Group */}
      <Controller
        name="linkedGroupId"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>
              Link RBAC Group{" "}
              <span className="text-muted-foreground font-normal">
                (tuỳ chọn)
              </span>
            </FieldLabel>
            <Select
              value={field.value ?? ""}
              onValueChange={(val) => field.onChange(val || undefined)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn group...">
                  {groups.find((g) => g._id === field.value)?.name ??
                    "Không link group"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Không link group</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group._id} value={group._id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />
    </>
  );
}
