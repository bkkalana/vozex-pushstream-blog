import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  arrow?: boolean;
  external?: boolean;
};

function BaseLink({ href, children, className = "", arrow = false, external = false, variant }: ButtonProps & { variant: "primary" | "secondary" }) {
  return (
    <Link
      href={href}
      className={`ps-button ps-button-${variant} ${className}`.trim()}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <span>{children}</span>
      {arrow ? <ArrowRight size={17} aria-hidden="true" /> : null}
    </Link>
  );
}

export function PrimaryButton(props: ButtonProps) { return <BaseLink {...props} variant="primary" />; }
export function SecondaryButton(props: ButtonProps) { return <BaseLink {...props} variant="secondary" />; }
