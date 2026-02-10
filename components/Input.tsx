import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export default function Input({ className = "", ...props }: Props) {
  return (
    <input
      {...props}
      className={[
        "w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm",
        "outline-none placeholder:text-zinc-500 focus:border-zinc-700",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        className,
      ].join(" ")}
    />
  );
}
