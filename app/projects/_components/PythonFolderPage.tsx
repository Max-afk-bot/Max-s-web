import fs from "fs";
import path from "path";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

type Props = {
  title: string;
  subtitle: string;
  folderSlug: string;
  zipName: string;
};

function readFiles(folderSlug: string) {
  const base = path.join(process.cwd(), "public", "python", folderSlug);
  try {
    const entries = fs.readdirSync(base, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => !name.startsWith("."))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export default function PythonFolderPage({
  title,
  subtitle,
  folderSlug,
  zipName,
}: Props) {
  const files = readFiles(folderSlug);
  const downloadHref = `/downloads/${zipName}`;

  return (
    <PageShell title={title} subtitle={subtitle}>
      <div className="space-y-6">
        <Card className="p-5 border-zinc-800 bg-zinc-950/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Folder Download</p>
              <p className="text-xs text-zinc-500 mt-1">
                Download the full pack as a single zip file.
              </p>
            </div>
            <a
              href={downloadHref}
              className="rounded-xl border border-zinc-800 px-4 py-2 text-sm hover:bg-zinc-900/40 transition"
            >
              Download All
            </a>
          </div>
          <p className="text-[11px] text-zinc-500 mt-3">
            File list updates when folder contents change.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Files</h2>
            <span className="text-xs text-zinc-500">{files.length} files</span>
          </div>

          {files.length === 0 ? (
            <p className="text-sm text-zinc-400 mt-4">
              No files found. Upload files into `public/python/{folderSlug}`.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {files.map((file) => (
                <a
                  key={file}
                  href={`/python/${folderSlug}/${file}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/20 px-3 py-2 hover:bg-zinc-900/40 transition"
                  target="_blank"
                  rel="noreferrer"
                >
                  {file}
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
