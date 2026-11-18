import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "success" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-navy-800 text-white hover:bg-navy-700 active:bg-navy-900 shadow-sm",
  success: "bg-saving-600 text-white hover:bg-saving-700 active:bg-saving-800 shadow-sm",
  secondary: "bg-navy-50 text-navy-800 hover:bg-navy-100",
  outline: "border border-slate-300 bg-white text-slate-800 hover:border-navy-300 hover:bg-navy-50",
  ghost: "text-slate-700 hover:bg-slate-100",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-14 px-6 text-base gap-2",
};

const BASE =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";

interface StyleProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function buttonClasses({ variant = "primary", size = "md", fullWidth }: StyleProps, extra?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", extra);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps;

export function Button({ variant, size, fullWidth, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, fullWidth }, className)} {...props} />;
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  StyleProps & { href: string; external?: boolean; children: ReactNode };

/** Link com aparência de botão. Links externos abrem em nova aba com rel seguro. */
export function LinkButton({ variant, size, fullWidth, className, href, external, ...props }: LinkButtonProps) {
  const classes = buttonClasses({ variant, size, fullWidth }, className);
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props} />;
  }
  return <Link href={href} className={classes} {...props} />;
}
