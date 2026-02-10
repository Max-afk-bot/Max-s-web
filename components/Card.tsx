import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 transition
      hover:border-zinc-700 hover:shadow-[0_0_0_1px_rgba(var(--accent),0.20)]
      ${className}`}
    >
      {children}
    </div>
  );
}
