"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";

import {
  addUserToGroupSchema,
  AddUserToGroupInput,
} from "@/schemas/user.schema";
import {
  addUserToGroupsAction,
  searchUsersAction,
} from "@/actions/user.action";
import { SerializedGroup, SerializedUser } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { GroupTreeCheckbox } from "./group-tree-checkbox";

interface Props {
  groups: SerializedGroup[];
}

export function AddUserDialog({ groups }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SerializedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SerializedUser | null>(null);

  const form = useForm<AddUserToGroupInput>({
    resolver: zodResolver(addUserToGroupSchema),
    defaultValues: { userId: "", groupIds: [] },
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await searchUsersAction(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectUser = (user: SerializedUser) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchQuery("");
    form.setValue("userId", user._id);

    // Pre-fill groupIds với groups user đã có (groups là SerializedGroupRef[])
    const currentGroupIds = user.groups.map((g) => g._id);
    form.setValue("groupIds", currentGroupIds);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    form.setValue("userId", "");
    form.setValue("groupIds", []);
  };

  const onSubmit = (data: AddUserToGroupInput) => {
    startTransition(async () => {
      const result = await addUserToGroupsAction(data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Cập nhật group cho user thành công!");
      form.reset();
      setSelectedUser(null);
      setOpen(false);
    });
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus size={15} />
        Thêm user vào group
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            form.reset();
            setSelectedUser(null);
            setSearchQuery("");
            setSearchResults([]);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm user vào group</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Search user */}
            <Field data-invalid={!!form.formState.errors.userId}>
              <FieldLabel>Tìm user</FieldLabel>

              {selectedUser ? (
                <div className="flex items-center justify-between px-3 py-2 border border-input rounded-md bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearUser}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Tìm theo tên hoặc email..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8"
                    disabled={isPending}
                  />

                  {(searchResults.length > 0 || isSearching) && (
                    <div className="absolute top-full left-0 right-0 mt-1 border border-border rounded-md bg-popover shadow-md z-10 max-h-48 overflow-y-auto">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2
                            size={14}
                            className="animate-spin text-muted-foreground"
                          />
                        </div>
                      ) : (
                        searchResults.map((user) => (
                          <button
                            key={user._id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent transition-colors text-left"
                          >
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {user.role?.name}
                            </Badge>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {form.formState.errors.userId && (
                <FieldError errors={[form.formState.errors.userId]} />
              )}
            </Field>

            {/* Groups */}
            <Controller
              name="groupIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Groups</FieldLabel>
                  <GroupTreeCheckbox
                    groups={groups}
                    selectedGroupIds={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                  />
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
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={isPending || !selectedUser}>
                {isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
