import AdminOnly from "@/components/AdminOnly";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminOnly>
      <div className="space-y-6 animate-pageIn">
        <div>
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Admin</div>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-2">
            Content Control
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Manage Dashboard, About, Gaming, Projects, Contact, Docs, Inbox, and admin settings.
          </p>
        </div>

        <AdminNav />

        {children}
      </div>
    </AdminOnly>
  );
}
