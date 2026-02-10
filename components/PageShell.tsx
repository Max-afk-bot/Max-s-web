import Link from "next/link";
import Card from "@/components/Card";

export default function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Link href="/" className="hover:text-zinc-300 transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-400">{title}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold mt-2">{title}</h1>

          {subtitle ? (
            <p className="text-zinc-400 text-sm mt-2 max-w-2xl">{subtitle}</p>
          ) : null}
        </div>

        {/* Small status pill */}
        <div className="shrink-0">
          <div className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-300">
            UI mode
            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[rgb(var(--accent))] opacity-80" />
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="p-6">
        {children ? (
          children
        ) : (
          <p className="text-sm text-zinc-400">Content will be added later.</p>
        )}
      </Card>
    </div>
  );
}
