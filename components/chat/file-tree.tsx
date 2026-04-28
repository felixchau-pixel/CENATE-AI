"use client";

import { memo, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileCode2, FileJson, FileText, Folder } from "lucide-react";
import type { ProjectFile } from "@/lib/project-manifest";
import { cn } from "@/lib/utils";

type FileTreeProps = {
  files: ProjectFile[];
  selectedPath: string;
  onSelect: (path: string) => void;
};

type TreeNode = {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
  file?: ProjectFile;
};

function buildTree(files: ProjectFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join("/");

      let existing = current.find((n) => n.name === name);

      if (!existing) {
        existing = {
          name,
          path,
          isDir: !isLast,
          children: [],
          file: isLast ? file : undefined,
        };
        current.push(existing);
      }

      if (!isLast) {
        current = existing.children;
      }
    }
  }

  // Sort: directories first, then alphabetical
  function sortNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes
      .sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
      })
      .map((n) => ({
        ...n,
        children: sortNodes(n.children),
      }));
  }

  return sortNodes(root);
}

function getFileIcon(name: string) {
  if (name.endsWith(".json")) return <FileJson className="h-4 w-4 shrink-0 text-yellow-500" />;
  if (name.endsWith(".tsx") || name.endsWith(".ts"))
    return <FileCode2 className="h-4 w-4 shrink-0 text-blue-400" />;
  if (name.endsWith(".css")) return <FileCode2 className="h-4 w-4 shrink-0 text-purple-400" />;
  if (name.endsWith(".html")) return <FileCode2 className="h-4 w-4 shrink-0 text-orange-400" />;
  if (name.endsWith(".js")) return <FileCode2 className="h-4 w-4 shrink-0 text-yellow-400" />;
  return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

function TreeNodeItem({
  node,
  depth,
  selectedPath,
  onSelect,
  defaultOpen,
}: {
  node: TreeNode;
  depth: number;
  selectedPath: string;
  onSelect: (path: string) => void;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? depth < 2);

  if (node.isDir) {
    return (
      <div>
        <button
          type="button"
          className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          )}
          <Folder className="h-4 w-4 shrink-0 text-blue-400/70" />
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen && (
          <div>
            {node.children.map((child) => (
              <TreeNodeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedPath === node.path;

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[13px] transition-colors",
        isSelected
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      onClick={() => onSelect(node.path)}
    >
      <span className="w-3.5 shrink-0" />
      {getFileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  );
}

function PureFileTree({ files, selectedPath, onSelect }: FileTreeProps) {
  const tree = useMemo(() => buildTree(files), [files]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border/50 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Files
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {tree.map((node) => (
          <TreeNodeItem
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedPath}
            onSelect={onSelect}
            defaultOpen={true}
          />
        ))}
      </div>
    </div>
  );
}

export const FileTree = memo(PureFileTree);
