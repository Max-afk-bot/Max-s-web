"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import LazySection from "@/components/LazySection";
import {
  Camera,
  Mail,
  MessageCircle,
  Play,
} from "lucide-react";
import {
  defaultContactContent,
  fetchContactContent,
  type ContactContent,
} from "@/lib/contactContent";
import { isValidGmail } from "@/lib/validators";
import {
  defaultSiteSettings,
  fetchSiteSettings,
  type SiteSettings,
} from "@/lib/siteSettings";

const iconMap = {
  discord: MessageCircle,
  instagram: Camera,
  youtube: Play,
  mail: Mail,
};

export default function ContactPage() {
  const [content, setContent] = useState<ContactContent>(
    defaultContactContent
  );
  const [siteSettings, setSiteSettings] =
    useState<SiteSettings>(defaultSiteSettings);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    topic: defaultContactContent.topics[2] ?? "Support",
    message: "",
    company: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    fetchContactContent().then((data) => {
      if (!mounted || !data) return;
      setContent({ ...defaultContactContent, ...data });
      setForm((prev) => ({
        ...prev,
        topic: data.topics?.[0] ?? prev.topic,
      }));
    });
    fetchSiteSettings().then((settings) => {
      if (!mounted) return;
      setSiteSettings(settings);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (status !== "sent") return;
    const timer = window.setTimeout(() => {
      setStatus("idle");
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const topics = useMemo(
    () =>
      content.topics && content.topics.length
        ? content.topics
        : defaultContactContent.topics,
    [content.topics]
  );

  const update = (key: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setError(null);
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    setFieldErrors({});

    const nextErrors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      nextErrors.name = "Enter at least 2 characters.";
    }
    if (!isValidGmail(form.email)) {
      nextErrors.email = "Use a valid Gmail address.";
    }
    if (form.subject && form.subject.trim().length < 3) {
      nextErrors.subject = "Subject should be at least 3 characters.";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      nextErrors.message = "Message should be at least 10 characters.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setFieldErrors(nextErrors);
      setError("Fix the highlighted fields.");
      return;
    }

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
    setFieldErrors({});
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
      title={content.hero_title}
      subtitle={content.hero_subtitle}
    >
      <div className="relative">
        <div className="premium-bg" />
        <div className="ambient-overlay" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {siteSettings.contact.show_form ? (
            <Card className="lg:col-span-2 p-6 card-shine glow vibe-cyber">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{content.form_title}</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {content.form_subtitle}
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
                    minLength={2}
                    maxLength={120}
                    required
                  />
                  {fieldErrors.name ? (
                    <p className="text-xs text-red-400 mt-1">
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Email</p>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    maxLength={200}
                    required
                  />
                  {fieldErrors.email ? (
                    <p className="text-xs text-red-400 mt-1">
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <p className="text-xs text-zinc-500 mb-2">Subject</p>
                  <Input
                    placeholder="What is this about?"
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    minLength={3}
                    maxLength={200}
                  />
                  {fieldErrors.subject ? (
                    <p className="text-xs text-red-400 mt-1">
                      {fieldErrors.subject}
                    </p>
                  ) : null}
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
                  minLength={10}
                  maxLength={3000}
                  required
                />
                {fieldErrors.message ? (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.message}
                  </p>
                ) : null}
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
                  {content.form_note}
                </p>
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending..." : "Send message"}
                </Button>
              </div>

              {status === "sent" ? (
                <p className="text-xs text-emerald-400">
                  Message sent. We will reply soon.
                </p>
              ) : null}
              {status === "error" ? (
                <p className="text-xs text-red-400">{error}</p>
              ) : null}
            </form>
          </Card>
          ) : (
            <Card className="lg:col-span-2 p-6 border-zinc-800 bg-zinc-950/60 text-sm text-zinc-400">
              Contact form is temporarily hidden by admin settings.
            </Card>
          )}

          <LazySection minHeight={200}>
            <div className="space-y-4">
            {siteSettings.contact.show_availability ? (
              <Card className="p-5 card-shine glow vibe-neon">
              <h3 className="text-sm font-semibold">{content.availability_title}</h3>
              <p className="text-xs text-zinc-500 mt-1">
                {content.availability_text}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-zinc-400">
                {(content.availability_stats.length
                  ? content.availability_stats
                  : defaultContactContent.availability_stats
                ).map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3"
                  >
                    {item.label}
                    <div className="text-sm text-zinc-200 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
            </Card>
            ) : null}

            {siteSettings.contact.show_socials ? (
              <Card className="p-5">
                <h3 className="text-sm font-semibold">{content.socials_title}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {content.socials_subtitle}
                </p>

                <div className="mt-4 space-y-2 stagger">
                  {(content.socials.length
                    ? content.socials
                    : defaultContactContent.socials
                  ).map((s) => {
                    const Icon = iconMap[s.icon] ?? MessageCircle;
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
            ) : null}
            </div>
          </LazySection>
        </div>
      </div>
    </PageShell>
  );
}
