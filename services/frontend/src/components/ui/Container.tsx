import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The 1320px page column with fluid side padding (§5). */
export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <Tag className={cn("container-site", className)}>{children}</Tag>;
}
