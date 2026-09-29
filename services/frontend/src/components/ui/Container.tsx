import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The 1320px page column with fluid side padding (§5). */
export function Container({
  children,
  className,
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">) {
  return (
    <Tag className={cn("container-site", className)} {...rest}>
      {children}
    </Tag>
  );
}
