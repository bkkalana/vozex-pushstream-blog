import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type Props<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "article";
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function PublicContainer<T extends ElementType = "div">({
  as,
  children,
  className = "",
  size = "default",
  ...props
}: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  const sizeClass = size === "article" ? "ps-container-article" : size === "wide" ? "ps-container-wide" : "ps-container";
  return <Tag className={`${sizeClass} ${className}`.trim()} {...props}>{children}</Tag>;
}
