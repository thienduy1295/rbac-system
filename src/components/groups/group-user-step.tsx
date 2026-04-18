"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SerializedUser } from "@/types";
import { searchUsersAction } from "@/actions/user.action";

interface Props {
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  disabled?: boolean;
  excludeUserIds?: string[];
}

export function GroupUserStep({
  selectedUserIds,
  onChange,
  disabled,
  excludeUserIds,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SerializedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);

    const results = await searchUsersAction(query, excludeUserIds);

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleToggleUser = (userId: string) => {
    onChange(
      selectedUserIds.includes(userId)
        ? selectedUserIds.filter((id) => id !== userId)
        : [...selectedUserIds, userId],
    );
  };

  // Merge search results với selected users để luôn hiện selected users
  const displayUsers = searchQuery.trim() ? searchResults : [];

  return (
    <div className="space-y-3">
      {/* Search */}
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
          disabled={disabled}
        />
      </div>

      {/* Selected users count */}
      {selectedUserIds.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Đã chọn {selectedUserIds.length} user</span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="hover:text-foreground transition-colors"
          >
            Bỏ chọn tất cả
          </button>
        </div>
      )}

      {/* Results list */}
      <div className="border border-input rounded-md divide-y divide-border max-h-56 overflow-y-auto">
        {isSearching ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          </div>
        ) : displayUsers.length > 0 ? (
          displayUsers.map((user) => {
            const checked = selectedUserIds.includes(user._id);
            return (
              <label
                key={user._id}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => handleToggleUser(user._id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs capitalize shrink-0"
                >
                  {user.role?.name}
                </Badge>
              </label>
            );
          })
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {searchQuery.trim()
              ? "Không tìm thấy user nào"
              : "Nhập tên hoặc email để tìm user"}
          </div>
        )}
      </div>
    </div>
  );
}
