"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import {
  defaultProfileDraft,
  fetchProfile,
  upsertProfile,
  type ProfileDraft,
} from "@/lib/profile";
import { normalizeAge } from "@/lib/validators";

const fallbackProfile: ProfileDraft = {
  ...defaultProfileDraft,
};

const gamingYearsOptions = [
  "New (0-1)",
  "1-2 years",
  "3-5 years",
  "6-8 years",
  "9+ years",
];

const playStyleOptions = [
  "Casual",
  "Competitive",
  "Creative",
  "Explorer",
  "Speedrunner",
];

const skillSuggestions = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind",
  "UI Design",
  "C++",
  "Python",
];

const gameSuggestions = [
  "Minecraft",
  "Valorant",
  "BGMI",
  "Fortnite",
  "GTA V",
  "Roblox",
  "Apex",
];

const genreSuggestions = [
  "FPS",
  "RPG",
  "Sandbox",
  "Survival",
  "Strategy",
  "Battle Royale",
  "Sports",
];

const platformSuggestions = [
  "PC",
  "Mobile",
  "Console",
  "Laptop",
  "Tablet",
];

export default function SettingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState<ProfileDraft>(fallbackProfile);
  const [draft, setDraft] = useState<ProfileDraft>(fallbackProfile);
  const [saved, setSaved] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [gameQuery, setGameQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [platformQuery, setPlatformQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const s = data.session ?? null;
      setSession(s);
      if (s) {
        fetchProfile(s.user.id).then((p) => {
          const nextProfile = p ? { ...fallbackProfile, ...p } : fallbackProfile;
          setProfile(nextProfile);
          setDraft(nextProfile);
          setOnboardingDone(p?.onboarding_done ?? false);
        });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) {
        fetchProfile(next.user.id).then((p) => {
          const nextProfile = p ? { ...fallbackProfile, ...p } : fallbackProfile;
          setProfile(nextProfile);
          setDraft(nextProfile);
          setOnboardingDone(p?.onboarding_done ?? false);
        });
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user;
  const provider = user?.app_metadata?.provider ?? "google";

  const updateDraft = (key: keyof ProfileDraft, value: string) => {
    setSaved(false);
    setSaveError(null);
    if (key === "age") {
      setDraft((p) => ({ ...p, age: normalizeAge(value) }));
      return;
    }
    setDraft((p) => ({ ...p, [key]: value }));
  };

  const splitList = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const skillsList = splitList(draft.skills || "");
  const gamesList = splitList(draft.game || "");
  const genresList = splitList(draft.favorite_genres || "");
  const platformsList = splitList(draft.platforms || "");

  const profileSkills = splitList(profile.skills || "");
  const profileGames = splitList(profile.game || "");
  const profileGenres = splitList(profile.favorite_genres || "");
  const profilePlatforms = splitList(profile.platforms || "");

  const addToList = (
    key: "skills" | "game" | "favorite_genres" | "platforms",
    value: string
  ) => {
    const list = splitList(String(draft[key] || ""));
    if (!list.includes(value)) list.push(value);
    updateDraft(key, list.join(", "));
  };

  const removeFromList = (
    key: "skills" | "game" | "favorite_genres" | "platforms",
    value: string
  ) => {
    const list = splitList(String(draft[key] || "")).filter((v) => v !== value);
    updateDraft(key, list.join(", "));
  };

  const filteredGames = (() => {
    const q = gameQuery.trim().toLowerCase();
    const list = q
      ? gameSuggestions.filter((g) => g.toLowerCase().includes(q))
      : gameSuggestions;
    return list.filter((g) => !gamesList.includes(g)).slice(0, 6);
  })();

  const filteredGenres = (() => {
    const q = genreQuery.trim().toLowerCase();
    const list = q
      ? genreSuggestions.filter((g) => g.toLowerCase().includes(q))
      : genreSuggestions;
    return list.filter((g) => !genresList.includes(g)).slice(0, 6);
  })();

  const filteredPlatforms = (() => {
    const q = platformQuery.trim().toLowerCase();
    const list = q
      ? platformSuggestions.filter((p) => p.toLowerCase().includes(q))
      : platformSuggestions;
    return list.filter((p) => !platformsList.includes(p)).slice(0, 6);
  })();

  const saveProfile = async () => {
    if (!user) return;
    const { profile: savedProfile, error } = await upsertProfile(
      user.id,
      draft,
      onboardingDone
    );
    if (error || !savedProfile) {
      setSaved(false);
      setSaveError(error ?? "Could not save changes.");
      return;
    }
    setProfile({ ...fallbackProfile, ...savedProfile });
    setDraft({ ...fallbackProfile, ...savedProfile });
    setSaved(true);
    setSaveError(null);
  };

  const resetOnboarding = async () => {
    if (!user) return;
    const ok = window.confirm(
      "Reset onboarding? You will be sent to the onboarding flow again."
    );
    if (!ok) return;
    const { error } = await upsertProfile(user.id, profile, false);
    if (error) {
      setSaveError(error);
      return;
    }
    setOnboardingDone(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("force_onboarding", "1");
      window.sessionStorage.removeItem("suppress_onboarding");
      window.dispatchEvent(new Event("profile-updated"));
      window.dispatchEvent(new Event("onboarding-flags"));
    }
    router.replace("/onboarding");
  };

  const signOut = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
  };

  return (
    <PageShell
      title="Settings"
      subtitle="Profile, account, and preferences."
    >
      <div className="space-y-6">
        {/* Profile overview */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Profile overview</p>
              <p className="text-xs text-zinc-500 mt-1">
                What you chose during onboarding.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {saved ? (
                <div className="text-xs text-emerald-400">Saved to cloud</div>
              ) : null}
              <Button
                variant="ghost"
                onClick={resetOnboarding}
                disabled={!user}
                className="text-xs"
              >
                Retake onboarding
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Display name</p>
              <p className="text-sm mt-1">{profile.name}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Username</p>
              <p className="text-sm mt-1">@{profile.username}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Gender</p>
              <p className="text-sm mt-1">{profile.gender || "—"}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Age</p>
              <p className="text-sm mt-1">{profile.age || "—"}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profileSkills.length > 0 ? (
                  profileSkills.map((s) => (
                    <span key={s} className="chip chip-mini">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">—</span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Games</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profileGames.length > 0 ? (
                  profileGames.map((g) => (
                    <span key={g} className="chip chip-mini">
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">—</span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Years gaming</p>
              <p className="text-sm mt-1">{profile.gaming_years || "—"}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Play style</p>
              <p className="text-sm mt-1">{profile.play_style || "—"}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Favorite genres</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profileGenres.length > 0 ? (
                  profileGenres.map((g) => (
                    <span key={g} className="chip chip-mini">
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">—</span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Platforms</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profilePlatforms.length > 0 ? (
                  profilePlatforms.map((p) => (
                    <span key={p} className="chip chip-mini">
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">—</span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Hobby</p>
              <p className="text-sm mt-1">{profile.hobby || "—"}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 lg:col-span-3">
              <p className="text-xs text-zinc-500">Bio</p>
              <p className="text-sm mt-1">{profile.bio || "—"}</p>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Profile</p>
              <p className="text-xs text-zinc-500 mt-1">
                Edit most fields here. Account details stay locked.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push("/profile")}>
                Preview profile
              </Button>
              {saveError ? (
                <span className="text-xs text-red-400">{saveError}</span>
              ) : null}
              <Button onClick={saveProfile} disabled={!user}>
                Save changes
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-2">Display name</p>
              <Input
                placeholder="Your name"
                value={draft.name}
                onChange={(e) => updateDraft("name", e.target.value)}
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Username</p>
              <Input
                placeholder="Username"
                value={draft.username}
                disabled
              />
              <p className="text-[11px] text-zinc-500 mt-2">
                Username is locked after onboarding (3-20 letters, numbers, or _).
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Gender</p>
              <select
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-700 select-input"
                value={draft.gender}
                onChange={(e) => updateDraft("gender", e.target.value)}
              >
                <option value="">Select (optional)</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Age</p>
              <Input
                type="number"
                placeholder="Age (optional)"
                value={draft.age}
                onChange={(e) => updateDraft("age", e.target.value)}
                min={1}
                max={120}
              />
              <p className="text-[11px] text-zinc-500 mt-2">Allowed range: 1–120.</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Skills</p>
              <Input
                placeholder="Skills (comma separated)"
                value={draft.skills}
                onChange={(e) => updateDraft("skills", e.target.value)}
              />
              {skillsList.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skillsList.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="chip chip-active"
                      onClick={() => removeFromList("skills", s)}
                    >
                      {s}
                      <span className="chip-x">×</span>
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {skillSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={[
                      "chip",
                      skillsList.includes(s) ? "chip-active" : "",
                    ].join(" ")}
                    onClick={() => addToList("skills", s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Games</p>
              <Input
                placeholder="Type a game and press Enter"
                value={gameQuery}
                onChange={(e) => setGameQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (gameQuery.trim()) {
                      addToList("game", gameQuery.trim());
                      setGameQuery("");
                    }
                  }
                }}
              />
              {gamesList.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {gamesList.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className="chip chip-active"
                      onClick={() => removeFromList("game", g)}
                    >
                      {g}
                      <span className="chip-x">×</span>
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {filteredGames.length > 0 ? (
                  filteredGames.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className="chip"
                      onClick={() => addToList("game", g)}
                    >
                      {g}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">
                    No matches. Press Enter to add.
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Years gaming</p>
              <select
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-700 select-input"
                value={draft.gaming_years}
                onChange={(e) => updateDraft("gaming_years", e.target.value)}
              >
                <option value="">Select (optional)</option>
                {gamingYearsOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Play style</p>
              <select
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-700 select-input"
                value={draft.play_style}
                onChange={(e) => updateDraft("play_style", e.target.value)}
              >
                <option value="">Select (optional)</option>
                {playStyleOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Favorite genres</p>
              <Input
                placeholder="Type a genre and press Enter"
                value={genreQuery}
                onChange={(e) => setGenreQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (genreQuery.trim()) {
                      addToList("favorite_genres", genreQuery.trim());
                      setGenreQuery("");
                    }
                  }
                }}
              />
              {genresList.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {genresList.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className="chip chip-active"
                      onClick={() => removeFromList("favorite_genres", g)}
                    >
                      {g}
                      <span className="chip-x">×</span>
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {filteredGenres.length > 0 ? (
                  filteredGenres.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className="chip"
                      onClick={() => addToList("favorite_genres", g)}
                    >
                      {g}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">
                    No matches. Press Enter to add.
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Platforms</p>
              <Input
                placeholder="Type a platform and press Enter"
                value={platformQuery}
                onChange={(e) => setPlatformQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (platformQuery.trim()) {
                      addToList("platforms", platformQuery.trim());
                      setPlatformQuery("");
                    }
                  }
                }}
              />
              {platformsList.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {platformsList.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="chip chip-active"
                      onClick={() => removeFromList("platforms", p)}
                    >
                      {p}
                      <span className="chip-x">×</span>
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {filteredPlatforms.length > 0 ? (
                  filteredPlatforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="chip"
                      onClick={() => addToList("platforms", p)}
                    >
                      {p}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">
                    No matches. Press Enter to add.
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Hobby</p>
              <Input
                placeholder="Hobby"
                value={draft.hobby}
                onChange={(e) => updateDraft("hobby", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-zinc-500 mb-2">Bio</p>
              <textarea
                className="w-full min-h-[96px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
                value={draft.bio}
                onChange={(e) => updateDraft("bio", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <p className="text-sm font-semibold">Account</p>
          <p className="text-xs text-zinc-500 mt-1">
            Google‑only sign‑in. This does not delete your data.
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Email</p>
              <p className="text-sm mt-1">{user?.email ?? "Loading..."}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Provider</p>
              <p className="text-sm mt-1">{provider}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">User ID</p>
              <p className="text-xs mt-2 text-zinc-300 break-all">
                {user?.id ?? "Loading..."}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Created</p>
              <p className="text-xs mt-2 text-zinc-300">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleString()
                  : "Loading..."}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Signing out won’t delete your account or saved data.
            </p>
            <Button onClick={signOut} disabled={loggingOut}>
              {loggingOut ? "Signing out..." : "Log out"}
            </Button>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <p className="text-sm font-semibold">Preferences</p>
          <p className="text-xs text-zinc-500 mt-1">
            Frontend only for now — backend will persist later.
          </p>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Theme</p>
              <p className="text-sm mt-1">Dark</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Accent</p>
              <p className="text-sm mt-1">Indigo</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 md:col-span-2">
              <p className="text-xs text-zinc-500">Motion</p>
              <p className="text-sm mt-1">Premium (standard)</p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <p className="text-sm font-semibold">Security</p>
          <p className="text-xs text-zinc-500 mt-1">
            Advanced security settings will arrive after backend setup.
          </p>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Two‑factor auth</p>
              <p className="text-sm mt-1">Not enabled</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">Sessions</p>
              <p className="text-sm mt-1">Single device</p>
            </div>
          </div>
        </div>

        {/* Onboarding */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <p className="text-sm font-semibold">Onboarding</p>
          <p className="text-xs text-zinc-500 mt-1">
            Restart the onboarding flow to update your profile from scratch.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              This does not delete your account. It only reopens the setup flow.
            </p>
            <Button variant="ghost" onClick={resetOnboarding} disabled={!user}>
              Reset onboarding
            </Button>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
