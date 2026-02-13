import { supabase } from "@/lib/supabaseClient";

export type ContactSocial = {
  label: string;
  href: string;
  handle: string;
  icon: "discord" | "instagram" | "youtube" | "mail";
};

export type ContactStat = {
  label: string;
  value: string;
};

export type ContactContent = {
  hero_title: string;
  hero_subtitle: string;
  form_title: string;
  form_subtitle: string;
  form_note: string;
  availability_title: string;
  availability_text: string;
  availability_stats: ContactStat[];
  socials_title: string;
  socials_subtitle: string;
  socials: ContactSocial[];
  topics: string[];
};

export const defaultContactContent: ContactContent = {
  hero_title: "Contact",
  hero_subtitle: "Reach out directly or connect on social platforms.",
  form_title: "Send a message",
  form_subtitle: "I usually reply within 24 to 48 hours.",
  form_note: "Your message is stored securely.",
  availability_title: "Availability",
  availability_text: "Best time to reach me is 11:00 to 20:00 local time.",
  availability_stats: [
    { label: "Response", value: "24 to 48h" },
    { label: "Channel", value: "Email or DM" },
  ],
  socials_title: "Social links",
  socials_subtitle: "Find me on these platforms.",
  socials: [
    {
      label: "Discord",
      href: "https://discord.gg/RpgKb4FG",
      handle: "Join server",
      icon: "discord",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/abcd1939efj/",
      handle: "@abcd1939efj",
      icon: "instagram",
    },
    {
      label: "YouTube",
      href: "https://youtube.com/@max_lifeyt?si=_yq83jCglUPXeFwi",
      handle: "@max_lifeyt",
      icon: "youtube",
    },
  ],
  topics: ["Partnership", "Collab", "Support", "Feedback", "Press", "Other"],
};

export async function fetchContactContent(): Promise<ContactContent | null> {
  const { data, error } = await supabase
    .from("contact_content")
    .select("content")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data?.content) return null;
  return data.content as ContactContent;
}

export async function upsertContactContent(content: ContactContent) {
  return supabase
    .from("contact_content")
    .upsert({ id: "default", content })
    .select()
    .single();
}
