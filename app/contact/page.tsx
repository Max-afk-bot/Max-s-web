"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import {
  Camera,
  Mail,
  MessageCircle,
  Play,
} from "lucide-react";

const socials = [
  {
    label: "Discord",
    href: "https://discord.gg/RpgKb4FG",
    handle: "Join server",
    icon: MessageCircle,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/abcd1939efj/",
    handle: "@abcd1939efj",
    icon: Camera,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@max_lifeyt?si=_yq83jCglUPXeFwi",
    handle: "@max_lifeyt",
    icon: Play,
  },
];

const topics = [
  "Partnership",
  "Collab",
  "Support",
  "Feedback",
  "Press",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    topic: "Support",
    message: "",
    company: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    let res: Response;
    try {
      res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus("error");
      setError(data?.error || "Failed to send message.");
      return;
    }

    setStatus("sent");
    setForm({
      name: "",
      email: "",
      subject: "",
      topic: "Support",
      message: "",
      company: "",
    });
  };

  return (
    <PageShell
      title="Contact"
      subtitle="Reach out directly or connect on social platforms."
    >
      <div className="relative">
        <div className="premium-bg" />
        <div className="ambient-overlay" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <Card className="lg:col-span-2 p-6 card-shine glow vibe-cyber">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Send a message</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  I usually reply within 24 to 48 hours.
                </p>
              </div>
              <div className="text-xs text-zinc-500 flex items-center gap-2">
                <Mail size={14} /> Contact form
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Name</p>
                  <Input
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Email</p>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <p className="text-xs text-zinc-500 mb-2">Subject</p>
                  <Input
                    placeholder="What is this about?"
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Topic</p>
                  <select
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-zinc-700 select-input"
                    value={form.topic}
                    onChange={(e) => update("topic", e.target.value)}
                  >
                    {topics.map((t) => (
                      <option key={t} value={t} className="bg-zinc-900">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-2">Message</p>
                <textarea
                  className="w-full min-h-[160px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
                  placeholder="Write your message..."
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  required
                />
              </div>

              <input
                className="hidden"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-zinc-500">
                  Your message is stored securely.
                </p>
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending..." : "Send message"}
                </Button>
              </div>

              {status === "sent" ? (
                <p className="text-xs text-emerald-400">Message sent.</p>
              ) : null}
              {status === "error" ? (
                <p className="text-xs text-red-400">{error}</p>
              ) : null}
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="p-5 card-shine glow vibe-neon">
              <h3 className="text-sm font-semibold">Availability</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Best time to reach me is 11:00 to 20:00 local time.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-zinc-400">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                  Response
                  <div className="text-sm text-zinc-200 mt-1">24 to 48h</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                  Channel
                  <div className="text-sm text-zinc-200 mt-1">Email or DM</div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold">Social links</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Find me on these platforms.
              </p>

              <div className="mt-4 space-y-2 stagger">
                {socials.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/20 p-3 hover:bg-zinc-900/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/40 grid place-items-center">
                          <Icon size={16} className="opacity-80 icon-pop" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{s.label}</div>
                          <div className="text-xs text-zinc-500">
                            {s.handle}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500">Open</span>
                    </a>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
