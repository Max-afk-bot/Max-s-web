import { supabase } from "@/lib/supabaseClient";

export type ProfileDraft = {
  username: string;
  name: string;
  gender: string;
  age: string;
  skills: string;
  game: string;
  gaming_years: string;
  play_style: string;
  favorite_genres: string;
  platforms: string;
  hobby: string;
  role: string;
  bio: string;
};

export type Profile = ProfileDraft & {
  id: string;
  onboarding_done: boolean;
  created_at?: string;
  updated_at?: string;
};

export const defaultProfileDraft: ProfileDraft = {
  username: "max_dev",
  name: "Max",
  gender: "Prefer not to say",
  age: "",
  skills: "Next.js, UI design",
  game: "Minecraft",
  gaming_years: "",
  play_style: "",
  favorite_genres: "",
  platforms: "",
  hobby: "",
  role: "Student",
  bio: "Building a modern dashboard website.",
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }
  return data ?? null;
}

export async function upsertProfile(
  userId: string,
  draft: ProfileDraft,
  onboardingDone: boolean
): Promise<{ profile: Profile | null; error: string | null }> {
  try {
    const payload = {
      id: userId,
      ...draft,
      onboarding_done: onboardingDone,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      const raw = error as unknown as Record<string, unknown>;
      const keys = Object.getOwnPropertyNames(error as object);
      const message =
        (raw?.message as string | undefined) ||
        (raw?.details as string | undefined) ||
        (raw?.hint as string | undefined) ||
        (raw?.code as string | undefined) ||
        String(error);
      const json = JSON.stringify(error, keys);

      return {
        profile: null,
        error: message || json || "Supabase error",
      };
    }
    return { profile: data ?? null, error: null };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected upsert error";
    return { profile: null, error: message };
  }
}
