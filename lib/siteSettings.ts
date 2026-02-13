export type SiteSettings = {
  maintenance: {
    enabled: boolean;
    message: string;
  };
  nav: {
    show_about: boolean;
    show_gaming: boolean;
    show_projects: boolean;
    show_contact: boolean;
    show_social: boolean;
    show_documentation: boolean;
  };
  dashboard: {
    show_intro: boolean;
    show_stats: boolean;
    show_quick_links: boolean;
    show_sections: boolean;
    show_profile_hint: boolean;
  };
  about: {
    show_programming: boolean;
    show_gaming: boolean;
    show_skill_stack: boolean;
    show_focus: boolean;
    show_principles: boolean;
  };
  projects: {
    show_completed: boolean;
    show_active: boolean;
    show_pipeline: boolean;
    show_timeline: boolean;
    show_milestones: boolean;
    show_gallery: boolean;
  };
  contact: {
    show_form: boolean;
    show_socials: boolean;
    show_availability: boolean;
  };
  footer: {
    show_docs: boolean;
  };
};

export const defaultSiteSettings: SiteSettings = {
  maintenance: {
    enabled: false,
    message: "We are tuning the site right now. Please check back soon.",
  },
  nav: {
    show_about: true,
    show_gaming: true,
    show_projects: true,
    show_contact: true,
    show_social: true,
    show_documentation: true,
  },
  dashboard: {
    show_intro: true,
    show_stats: true,
    show_quick_links: true,
    show_sections: true,
    show_profile_hint: true,
  },
  about: {
    show_programming: true,
    show_gaming: true,
    show_skill_stack: true,
    show_focus: true,
    show_principles: true,
  },
  projects: {
    show_completed: true,
    show_active: true,
    show_pipeline: true,
    show_timeline: true,
    show_milestones: true,
    show_gallery: true,
  },
  contact: {
    show_form: true,
    show_socials: true,
    show_availability: true,
  },
  footer: {
    show_docs: true,
  },
};

function ensureBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function ensureText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function normalizeSiteSettings(
  raw?: Partial<SiteSettings> | null
): SiteSettings {
  const input = raw ?? {};
  return {
    maintenance: {
      enabled: ensureBoolean(
        input.maintenance?.enabled,
        defaultSiteSettings.maintenance.enabled
      ),
      message: ensureText(
        input.maintenance?.message,
        defaultSiteSettings.maintenance.message
      ),
    },
    nav: {
      show_about: ensureBoolean(
        input.nav?.show_about,
        defaultSiteSettings.nav.show_about
      ),
      show_gaming: ensureBoolean(
        input.nav?.show_gaming,
        defaultSiteSettings.nav.show_gaming
      ),
      show_projects: ensureBoolean(
        input.nav?.show_projects,
        defaultSiteSettings.nav.show_projects
      ),
      show_contact: ensureBoolean(
        input.nav?.show_contact,
        defaultSiteSettings.nav.show_contact
      ),
      show_social: ensureBoolean(
        input.nav?.show_social,
        defaultSiteSettings.nav.show_social
      ),
      show_documentation: ensureBoolean(
        input.nav?.show_documentation,
        defaultSiteSettings.nav.show_documentation
      ),
    },
    dashboard: {
      show_intro: ensureBoolean(
        input.dashboard?.show_intro,
        defaultSiteSettings.dashboard.show_intro
      ),
      show_stats: ensureBoolean(
        input.dashboard?.show_stats,
        defaultSiteSettings.dashboard.show_stats
      ),
      show_quick_links: ensureBoolean(
        input.dashboard?.show_quick_links,
        defaultSiteSettings.dashboard.show_quick_links
      ),
      show_sections: ensureBoolean(
        input.dashboard?.show_sections,
        defaultSiteSettings.dashboard.show_sections
      ),
      show_profile_hint: ensureBoolean(
        input.dashboard?.show_profile_hint,
        defaultSiteSettings.dashboard.show_profile_hint
      ),
    },
    about: {
      show_programming: ensureBoolean(
        input.about?.show_programming,
        defaultSiteSettings.about.show_programming
      ),
      show_gaming: ensureBoolean(
        input.about?.show_gaming,
        defaultSiteSettings.about.show_gaming
      ),
      show_skill_stack: ensureBoolean(
        input.about?.show_skill_stack,
        defaultSiteSettings.about.show_skill_stack
      ),
      show_focus: ensureBoolean(
        input.about?.show_focus,
        defaultSiteSettings.about.show_focus
      ),
      show_principles: ensureBoolean(
        input.about?.show_principles,
        defaultSiteSettings.about.show_principles
      ),
    },
    projects: {
      show_completed: ensureBoolean(
        input.projects?.show_completed,
        defaultSiteSettings.projects.show_completed
      ),
      show_active: ensureBoolean(
        input.projects?.show_active,
        defaultSiteSettings.projects.show_active
      ),
      show_pipeline: ensureBoolean(
        input.projects?.show_pipeline,
        defaultSiteSettings.projects.show_pipeline
      ),
      show_timeline: ensureBoolean(
        input.projects?.show_timeline,
        defaultSiteSettings.projects.show_timeline
      ),
      show_milestones: ensureBoolean(
        input.projects?.show_milestones,
        defaultSiteSettings.projects.show_milestones
      ),
      show_gallery: ensureBoolean(
        input.projects?.show_gallery,
        defaultSiteSettings.projects.show_gallery
      ),
    },
    contact: {
      show_form: ensureBoolean(
        input.contact?.show_form,
        defaultSiteSettings.contact.show_form
      ),
      show_socials: ensureBoolean(
        input.contact?.show_socials,
        defaultSiteSettings.contact.show_socials
      ),
      show_availability: ensureBoolean(
        input.contact?.show_availability,
        defaultSiteSettings.contact.show_availability
      ),
    },
    footer: {
      show_docs: ensureBoolean(
        input.footer?.show_docs,
        defaultSiteSettings.footer.show_docs
      ),
    },
  };
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch("/api/site-settings", { cache: "no-store" });
    if (!res.ok) return defaultSiteSettings;
    const body = (await res.json().catch(() => ({}))) as {
      settings?: Partial<SiteSettings>;
    };
    return normalizeSiteSettings(body.settings);
  } catch {
    return defaultSiteSettings;
  }
}
