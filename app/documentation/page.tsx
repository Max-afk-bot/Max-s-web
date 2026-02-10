import Card from "@/components/Card";
import Link from "next/link";

const docsNav = [
  { id: "conditions-use-sale", label: "Conditions of Use & Sale" },
  { id: "privacy-notice", label: "Privacy Notice" },
  { id: "interest-based-ads", label: "Interest-Based Ads" },
  { id: "cookies-notice", label: "Cookies Notice" },
  { id: "user-responsibility", label: "User Responsibility" },
  { id: "service-availability", label: "Service Availability" },
  { id: "content-copyright", label: "Content & Copyright" },
  { id: "contact-notices", label: "Contact & Notices" },
  { id: "policy-updates", label: "Policy Updates" },
];

export default function DocumentationPage() {
  return (
    <div className="space-y-6 animate-pageIn">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 doc-hero">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-semibold mt-2">Documentation</h1>
        <p className="text-sm text-zinc-400 mt-3 max-w-3xl">
          Terms, privacy, ad preferences, and platform notices for this website.
          These sections explain how the platform works and how data is handled.
        </p>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {docsNav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="chip chip-mini hover:bg-zinc-800/60 transition"
            >
              {item.label}
            </a>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <Card id="conditions-use-sale" className="p-6 scroll-mt-28">
          <h2 className="text-lg font-semibold">1. Conditions of Use & Sale</h2>
          <p className="text-sm text-zinc-300 mt-3">
            By using this platform, you agree to use it for lawful and fair activity.
            Unauthorized access, abuse, fraud, scraping attacks, or actions that harm
            users or infrastructure are prohibited.
          </p>
          <p className="text-sm text-zinc-300 mt-3">
            Features, visuals, and pricing (if introduced later) may change over time.
            We may update, pause, or remove features to improve security, reliability,
            and product quality.
          </p>
        </Card>

        <Card id="privacy-notice" className="p-6 scroll-mt-28">
          <h2 className="text-lg font-semibold">2. Privacy Notice</h2>
          <p className="text-sm text-zinc-300 mt-3">
            We store user account and profile data in Supabase to run core features:
            authentication, onboarding, profile settings, and contact workflows.
            Data is stored for platform operation and personalization only.
          </p>
          <p className="text-sm text-zinc-300 mt-3">
            We do not sell personal data, and we do not use user data for unrelated
            advertising systems. User data is not repurposed for external marketing.
          </p>
          <p className="text-sm text-zinc-300 mt-3">
            Information currently stored can include account identity from sign-in
            provider, profile details entered in onboarding/settings, and contact form
            messages submitted by users.
          </p>
          <p className="text-sm text-zinc-300 mt-3">
            Data is retained to keep your account and app features working. If you need
            manual data removal or account closure, submit a request from the contact
            page.
          </p>
        </Card>

        <Card id="interest-based-ads" className="p-6 scroll-mt-28">
          <h2 className="text-lg font-semibold">3. Interest-Based Ads</h2>
          <p className="text-sm text-zinc-300 mt-3">
            This platform currently does not run third-party ad networks. If ad systems
            are enabled later, this section will be updated with opt-out controls and
            data usage details.
          </p>
        </Card>

        <Card id="cookies-notice" className="p-6 scroll-mt-28">
          <h2 className="text-lg font-semibold">4. Cookies Notice</h2>
          <p className="text-sm text-zinc-300 mt-3">
            Cookies and local storage may be used for session persistence, auth state,
            and UI preferences. You may clear cookies in your browser at any time, but
            some features may stop working correctly until you sign in again.
          </p>
          <p className="text-sm text-zinc-300 mt-3">
            These storage mechanisms are used for platform functionality, not for
            third-party behavioral ad targeting.
          </p>
        </Card>

        <Card id="user-responsibility" className="p-6 scroll-mt-28">
          <h2 className="text-lg font-semibold">5. User Responsibility</h2>
          <p className="text-sm text-zinc-300 mt-3">
            Users are responsible for account activity and for keeping credentials
            private. You must not submit harmful code, spam, or illegal content.
          </p>
          <p className="text-sm text-zinc-300 mt-3">
            You are responsible for the accuracy of profile information you provide.
            Do not upload or submit information you are not authorized to share.
          </p>
        </Card>

        <Card id="service-availability" className="p-6 scroll-mt-28">
          <h2 className="text-lg font-semibold">6. Service Availability</h2>
          <p className="text-sm text-zinc-300 mt-3">
            We aim for stable uptime, but features can be interrupted by maintenance,
            upgrades, or infrastructure incidents. Availability is not guaranteed.
          </p>
          <p className="text-sm text-zinc-300 mt-3">
            Security protections such as rate limiting and access checks may temporarily
            block requests that look abusive or unsafe.
          </p>
        </Card>

        <Card id="content-copyright" className="p-6 scroll-mt-28">
          <h2 className="text-lg font-semibold">7. Content & Copyright</h2>
          <p className="text-sm text-zinc-300 mt-3">
            Site design, code, and brand assets are protected. Do not copy, redistribute,
            or claim ownership of platform content without permission.
          </p>
        </Card>

        <Card id="contact-notices" className="p-6 scroll-mt-28">
          <h2 className="text-lg font-semibold">8. Contact & Notices</h2>
          <p className="text-sm text-zinc-300 mt-3">
            For legal notices, policy questions, or data concerns, use the{" "}
            <Link href="/contact" className="underline text-zinc-100">
              Contact page
            </Link>
            . Messages are reviewed through the admin inbox.
          </p>
          <p className="text-sm text-zinc-300 mt-3">
            If you want profile corrections, data updates, or account-related requests,
            contact us through the same page and include your account email.
          </p>
        </Card>

        <Card id="policy-updates" className="p-6 scroll-mt-28">
          <h2 className="text-lg font-semibold">9. Policy Updates</h2>
          <p className="text-sm text-zinc-300 mt-3">
            Documentation may change as features evolve. Continued use of this site
            after updates means you accept revised terms.
          </p>
          <p className="text-sm text-zinc-300 mt-3">
            Last policy alignment: February 10, 2026.
          </p>
        </Card>
      </div>
    </div>
  );
}
