"use client";

import { SerializedGroup } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/locale-context";

interface Props {
  groups: SerializedGroup[];
  selectedGroupIds: string[];
  onChange: (groupIds: string[]) => void;
  disabled?: boolean;
}

interface TreeNode extends SerializedGroup {
  children: TreeNode[];
}

function buildTree(groups: SerializedGroup[]): TreeNode[] {
  const map: Record<string, TreeNode> = {};
  const roots: TreeNode[] = [];

  for (const group of groups) {
    map[group._id] = { ...group, children: [] };
  }

  for (const group of groups) {
    const parentId = group.parentGroup?._id;
    if (parentId && map[parentId]) {
      map[parentId].children.push(map[group._id]);
    } else {
      roots.push(map[group._id]);
    }
  }

  return roots;
}

function TreeNodeItem({
  node,
  depth,
  selectedGroupIds,
  onChange,
  disabled,
  subGroupsLabel,
}: {
  node: TreeNode;
  depth: number;
  selectedGroupIds: string[];
  onChange: (groupIds: string[]) => void;
  disabled?: boolean;
  subGroupsLabel: string;
}) {
  const checked = selectedGroupIds.includes(node._id);

  const allChildrenChecked = (n: TreeNode): boolean => {
    if (n.children.length === 0) return selectedGroupIds.includes(n._id);
    return n.children.every((c) => allChildrenChecked(c));
  };

  const someChildrenChecked = (n: TreeNode): boolean => {
    if (selectedGroupIds.includes(n._id)) return true;
    return n.children.some((c) => someChildrenChecked(c));
  };

  const isIndeterminate = !checked && someChildrenChecked(node);

  const getAllIds = (n: TreeNode): string[] => {
    return [n._id, ...n.children.flatMap(getAllIds)];
  };

  const handleChange = (val: boolean) => {
    const ids = getAllIds(node);
    if (val) {
      onChange(Array.from(new Set([...selectedGroupIds, ...ids])));
    } else {
      onChange(selectedGroupIds.filter((id) => !ids.includes(id)));
    }
  };

  return (
    <div>
      <label
        className={cn(
          "flex items-center gap-3 py-2 pr-3 hover:bg-accent cursor-pointer transition-colors",
          depth === 0 ? "px-3 bg-muted/50" : "",
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        <Checkbox
          checked={checked}
          data-state={isIndeterminate ? "indeterminate" : undefined}
          disabled={disabled}
          onCheckedChange={handleChange}
        />
        <div className="flex flex-col">
          <span className={cn("text-sm", depth === 0 && "font-medium")}>
            {node.name}
          </span>
          {node.description && (
            <span className="text-xs text-muted-foreground">
              {node.description}
            </span>
          )}
        </div>
        {node.children.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {node.children.length} {subGroupsLabel}
          </span>
        )}
      </label>

      {node.children.map((child) => (
        <TreeNodeItem
          key={child._id}
          node={child}
          depth={depth + 1}
          selectedGroupIds={selectedGroupIds}
          onChange={onChange}
          disabled={disabled}
          subGroupsLabel={subGroupsLabel}
        />
      ))}
    </div>
  );
}

export function GroupTreeCheckbox({
  groups,
  selectedGroupIds,
  onChange,
  disabled,
}: Props) {
  const { dict } = useLocale();
  const t = dict.groupTree;
  const tree = buildTree(groups);

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {t.noGroups}
      </p>
    );
  }

  return (
    <div className="border border-input rounded-md divide-y divide-border max-h-52 overflow-y-auto">
      {tree.map((node) => (
        <TreeNodeItem
          key={node._id}
          node={node}
          depth={0}
          selectedGroupIds={selectedGroupIds}
          onChange={onChange}
          disabled={disabled}
          subGroupsLabel={t.subGroups}
        />
      ))}
    </div>
  );
}
