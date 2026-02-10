"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/components/Card";
import Button from "@/components/Button";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  topic: string | null;
  message: string;
  created_at: string;
};

export default function AdminInboxPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async (): Promise<{
    messages: ContactMessage[];
    error: string | null;
  }> => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      return { messages: [], error: "No session found." };
    }

    const res = await fetch("/api/admin/contact-messages", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { messages: [], error: body?.error || "Failed to load messages." };
    }

    const body = (await res.json()) as { messages?: ContactMessage[] };
    return { messages: body.messages ?? [], error: null };
  };

  const loadMessages = async () => {
    setLoading(true);
    const next = await fetchMessages();
    setError(next.error);
    setMessages(next.messages);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = await fetchMessages();
      if (cancelled) return;
      setError(next.error);
      setMessages(next.messages);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Contact Inbox</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Messages submitted from the Contact page.
          </p>
        </div>
        <Button variant="ghost" onClick={loadMessages} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      {loading ? (
        <Card className="p-6 text-sm text-zinc-400">Loading messages...</Card>
      ) : null}

      {!loading && messages.length === 0 ? (
        <Card className="p-6 text-sm text-zinc-400">No messages yet.</Card>
      ) : null}

      <div className="space-y-4">
        {messages.map((m) => (
          <Card key={m.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold">{m.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">{m.email}</p>
              </div>
              <p className="text-xs text-zinc-500">
                {new Date(m.created_at).toLocaleString()}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {m.topic ? <span className="chip chip-mini">{m.topic}</span> : null}
              {m.subject ? (
                <span className="chip chip-mini">{m.subject}</span>
              ) : null}
            </div>

            <p className="text-sm text-zinc-300 mt-4 whitespace-pre-wrap">
              {m.message}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
