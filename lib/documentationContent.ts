import { supabase } from "@/lib/supabaseClient";

export type DocumentationSection = {
  id: string;
  title: string;
  body: string;
};

export type DocumentationLink = {
  label: string;
  href: string;
};

export type DocumentationContent = {
  hero_kicker: string;
  hero_title: string;
  hero_subtitle: string;
  sections: DocumentationSection[];
  footer_links: DocumentationLink[];
  updated_label: string;
};

export const defaultDocumentationContent: DocumentationContent = {
  hero_kicker: "Legal",
  hero_title: "Documentation",
  hero_subtitle:
    "Terms, privacy, ad preferences, and platform notices for this website. These sections explain how the platform works and how data is handled.",
  sections: [
    {
      id: "conditions-use-sale",
      title: "1. Conditions of Use & Sale",
      body:
        "By using this platform, you agree to use it for lawful and fair activity. Unauthorized access, abuse, fraud, scraping attacks, or actions that harm users or infrastructure are prohibited.\n\nFeatures, visuals, and pricing (if introduced later) may change over time. We may update, pause, or remove features to improve security, reliability, and product quality.",
    },
    {
      id: "privacy-notice",
      title: "2. Privacy Notice",
      body:
        "We store user account and profile data in Supabase to run core features: authentication, onboarding, profile settings, and contact workflows. Data is stored for platform operation and personalization only.\n\nWe do not sell personal data, and we do not use user data for unrelated advertising systems. User data is not repurposed for external marketing.\n\nInformation currently stored can include account identity from sign-in provider, profile details entered in onboarding/settings, and contact form messages submitted by users.\n\nData is retained to keep your account and app features working. If you need manual data removal or account closure, submit a request from the contact page.",
    },
    {
      id: "interest-based-ads",
      title: "3. Interest-Based Ads",
      body:
        "This platform currently does not run third-party ad networks. If ad systems are enabled later, this section will be updated with opt-out controls and data usage details.",
    },
    {
      id: "cookies-notice",
      title: "4. Cookies Notice",
      body:
        "Cookies and local storage may be used for session persistence, auth state, and UI preferences. You may clear cookies in your browser at any time, but some features may stop working correctly until you sign in again.\n\nThese storage mechanisms are used for platform functionality, not for third-party behavioral ad targeting.",
    },
    {
      id: "user-responsibility",
      title: "5. User Responsibility",
      body:
        "Users are responsible for account activity and for keeping credentials private. You must not submit harmful code, spam, or illegal content.\n\nYou are responsible for the accuracy of profile information you provide. Do not upload or submit information you are not authorized to share.",
    },
    {
      id: "service-availability",
      title: "6. Service Availability",
      body:
        "We aim for stable uptime, but features can be interrupted by maintenance, upgrades, or infrastructure incidents. Availability is not guaranteed.\n\nSecurity protections such as rate limiting and access checks may temporarily block requests that look abusive or unsafe.",
    },
    {
      id: "content-copyright",
      title: "7. Content & Copyright",
      body:
        "Site design, code, and brand assets are protected. Do not copy, redistribute, or claim ownership of platform content without permission.",
    },
    {
      id: "contact-notices",
      title: "8. Contact & Notices",
      body:
        "For legal notices, policy questions, or data concerns, use the Contact page. Messages are reviewed through the admin inbox.\n\nIf you want profile corrections, data updates, or account-related requests, contact us through the same page and include your account email.",
    },
    {
      id: "policy-updates",
      title: "9. Policy Updates",
      body:
        "Documentation may change as features evolve. Continued use of this site after updates means you accept revised terms.\n\nLast policy alignment: February 10, 2026.",
    },
  ],
  footer_links: [
    { label: "Conditions of Use & Sale", href: "/documentation#conditions-use-sale" },
    { label: "Privacy Notice", href: "/documentation#privacy-notice" },
    { label: "Interest-Based Ads", href: "/documentation#interest-based-ads" },
    { label: "Cookies Notice", href: "/documentation#cookies-notice" },
    { label: "Contact & Notices", href: "/documentation#contact-notices" },
  ],
  updated_label: "Last updated: February 10, 2026.",
};

export async function fetchDocumentationContent(): Promise<DocumentationContent | null> {
  const { data, error } = await supabase
    .from("documentation_content")
    .select("content")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data?.content) return null;
  return data.content as DocumentationContent;
}

export async function upsertDocumentationContent(content: DocumentationContent) {
  return supabase
    .from("documentation_content")
    .upsert({ id: "default", content })
    .select()
    .single();
}
