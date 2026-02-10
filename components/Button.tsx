import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ghost" | "secondary";
};

export default function Button({
  variant = "secondary",
  className = "",
  ...props
}: Props) {
  const base =
    "px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60";
  const styles =
    variant === "ghost"
      ? "hover:bg-zinc-900"
      : "border border-zinc-800 hover:bg-zinc-900";

  return <button {...props} className={`${base} ${styles} ${className}`} />;
}
