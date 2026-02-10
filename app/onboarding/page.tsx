"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { supabase } from "@/lib/supabaseClient";
import {
  defaultProfileDraft,
  fetchProfile,
  type ProfileDraft,
  upsertProfile,
} from "@/lib/profile";
import {
  AtSign,
  Calendar,
  Clock,
  Gamepad2,
  Heart,
  Layers,
  Monitor,
  Sparkles,
  Target,
  User,
  Users,
} from "lucide-react";

type StepKey =
  | "username"
  | "name"
  | "gender"
  | "age"
  | "skills"
  | "game"
  | "gaming_years"
  | "play_style"
  | "favorite_genres"
  | "platforms"
  | "hobby";

type Step = {
  key: StepKey;
  title: string;
  hint: string;
  placeholder: string;
  optional?: boolean;
  type?: "text" | "password" | "number";
};

const steps: Step[] = [
  {
    key: "username",
    title: "Pick your username",
    hint: "This is how you’ll appear in your dashboard.",
    placeholder: "e.g. max_dev",
  },
  {
    key: "name",
    title: "Your display name",
    hint: "Real name or nickname — your choice.",
    placeholder: "e.g. Max",
  },
  {
    key: "gender",
    title: "Gender",
    hint: "Optional, used only for personalization.",
    placeholder: "e.g. Male / Female / Prefer not to say",
    optional: true,
  },
  {
    key: "age",
    title: "Age",
    hint: "Optional, helps tailor your dashboard.",
    placeholder: "e.g. 16",
    optional: true,
    type: "number",
  },
  {
    key: "skills",
    title: "Top skills",
    hint: "Your strongest skills right now.",
    placeholder: "e.g. Next.js, UI design, C++",
  },
  {
    key: "game",
    title: "Games you play",
    hint: "Add multiple games you enjoy.",
    placeholder: "Type a game name",
  },
  {
    key: "gaming_years",
    title: "Years of gaming",
    hint: "How long have you been gaming?",
    placeholder: "Select years",
    optional: true,
  },
  {
    key: "play_style",
    title: "Play style",
    hint: "Your usual gaming style.",
    placeholder: "Select a style",
    optional: true,
  },
  {
    key: "favorite_genres",
    title: "Favorite genres",
    hint: "Pick a few genres you like.",
    placeholder: "e.g. RPG, FPS",
    optional: true,
  },
  {
    key: "platforms",
    title: "Platforms",
    hint: "Where do you play most?",
    placeholder: "e.g. PC, Mobile",
    optional: true,
  },
  {
    key: "hobby",
    title: "Hobby (non‑gaming)",
    hint: "One hobby outside gaming.",
    placeholder: "e.g. Music, Drawing",
    optional: true,
  },
];

const emptyProfile: ProfileDraft = {
  ...defaultProfileDraft,
  username: "",
  name: "",
  gender: "",
  age: "",
  skills: "",
  game: "",
  gaming_years: "",
  play_style: "",
  favorite_genres: "",
  platforms: "",
  hobby: "",
};

const stepIcons = {
  username: AtSign,
  name: User,
  gender: Users,
  age: Calendar,
  skills: Sparkles,
  game: Gamepad2,
  gaming_years: Clock,
  play_style: Target,
  favorite_genres: Layers,
  platforms: Monitor,
  hobby: Heart,
} as const;

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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileDraft>(emptyProfile);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const displayProgressRef = useRef(0);
  const [gameQuery, setGameQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [platformQuery, setPlatformQuery] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session) return;
      setUserId(session.user.id);
      fetchProfile(session.user.id).then((profile) => {
        if (profile) setForm((p) => ({ ...p, ...profile }));
      });
    });
  }, []);

  const current = steps[step];
  const total = steps.length;
  const progress = Math.round(((step + 1) / total) * 100);
  const Icon = stepIcons[current.key];

  useEffect(() => {
    const start = displayProgressRef.current;
    const end = progress;
    const duration = 280;
    const startTime = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const val = Math.round(start + (end - start) * t);
      displayProgressRef.current = val;
      setDisplayProgress(val);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  const canContinue = useMemo(() => {
    const value = form[current.key] ?? "";
    if (current.optional) return true;
    return String(value).trim().length > 0;
  }, [current, form]);

  const update = (key: keyof ProfileDraft, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const next = () => {
    setError(null);
    if (current.key === "game" && gameQuery.trim()) {
      addToList("game", gameQuery.trim());
      setGameQuery("");
      setStep((s) => Math.min(total - 1, s + 1));
      return;
    }
    if (current.key === "favorite_genres" && genreQuery.trim()) {
      addToList("favorite_genres", genreQuery.trim());
      setGenreQuery("");
      setStep((s) => Math.min(total - 1, s + 1));
      return;
    }
    if (current.key === "platforms" && platformQuery.trim()) {
      addToList("platforms", platformQuery.trim());
      setPlatformQuery("");
      setStep((s) => Math.min(total - 1, s + 1));
      return;
    }
    if (!canContinue) {
      setError("Please fill this before continuing.");
      return;
    }
    setStep((s) => Math.min(total - 1, s + 1));
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    if (!userId) return;
    setSaving(true);
    const { profile, error } = await upsertProfile(userId, form, true);
    if (error || !profile) {
      setError(error ?? "Could not save your profile. Please try again.");
      setSaving(false);
      return;
    }
    const verified = await fetchProfile(userId);
    if (!verified?.onboarding_done) {
      setError("Profile saved, but onboarding status not updated. Check RLS.");
      setSaving(false);
      return;
    }
    setSaving(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("force_onboarding");
      window.sessionStorage.setItem("suppress_onboarding", "1");
      window.dispatchEvent(new Event("profile-updated"));
      window.dispatchEvent(new Event("onboarding-flags"));
    }
    router.replace("/");
  };

  const splitList = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const addToList = (key: "skills" | "game" | "favorite_genres" | "platforms", value: string) => {
    const list = splitList(String(form[key] || ""));
    if (!list.includes(value)) list.push(value);
    update(key, list.join(", "));
  };

  const removeFromList = (
    key: "skills" | "game" | "favorite_genres" | "platforms",
    value: string
  ) => {
    const list = splitList(String(form[key] || "")).filter((v) => v !== value);
    update(key, list.join(", "));
  };

  const addGameFromQuery = () => {
    const value = gameQuery.trim();
    if (!value) return;
    addToList("game", value);
    setGameQuery("");
  };

  const skillList = useMemo(() => splitList(String(form.skills || "")), [form.skills]);
  const gameList = useMemo(() => splitList(String(form.game || "")), [form.game]);
  const genreList = useMemo(
    () => splitList(String(form.favorite_genres || "")),
    [form.favorite_genres]
  );
  const platformList = useMemo(
    () => splitList(String(form.platforms || "")),
    [form.platforms]
  );

  const filteredGames = useMemo(() => {
    const q = gameQuery.trim().toLowerCase();
    const list = q
      ? gameSuggestions.filter((g) => g.toLowerCase().includes(q))
      : gameSuggestions;
    return list.filter((g) => !gameList.includes(g)).slice(0, 6);
  }, [gameQuery, gameList]);

  const filteredGenres = useMemo(() => {
    const q = genreQuery.trim().toLowerCase();
    const list = q
      ? genreSuggestions.filter((g) => g.toLowerCase().includes(q))
      : genreSuggestions;
    return list.filter((g) => !genreList.includes(g)).slice(0, 6);
  }, [genreQuery, genreList]);

  const filteredPlatforms = useMemo(() => {
    const q = platformQuery.trim().toLowerCase();
    const list = q
      ? platformSuggestions.filter((p) => p.toLowerCase().includes(q))
      : platformSuggestions;
    return list.filter((p) => !platformList.includes(p)).slice(0, 6);
  }, [platformQuery, platformList]);

  return (
    <div className="min-h-[calc(100vh-48px)] grid place-items-center auth-stage">
      <div className="auth-sheen" aria-hidden="true" />
      <div className="auth-beam" aria-hidden="true" />
      <div className="auth-orb auth-orb-a" aria-hidden="true" />
      <div className="auth-orb auth-orb-b" aria-hidden="true" />
      <div className="auth-grid" aria-hidden="true" />
      <div className="filmgrain" aria-hidden="true" />

      <Card className="auth-card w-full max-w-2xl p-6 sm:p-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="step-icon">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Onboarding
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold mt-2">
                {current.title}
              </h1>
              <p className="text-sm text-zinc-400 mt-2">{current.hint}</p>
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            Step {step + 1} / {total}
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 rounded-full bg-zinc-800/80 overflow-hidden">
            <div
              className="h-full bg-[rgb(var(--accent))] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {steps.map((s, i) => (
                <span
                  key={s.key}
                  className={[
                    "h-2 w-2 rounded-full transition",
                    i <= step ? "bg-cyan-400/80" : "bg-zinc-700",
                  ].join(" ")}
                />
              ))}
            </div>
            <div className="text-xs text-zinc-500 tabular-nums">
              {displayProgress}% complete
            </div>
          </div>
        </div>

        <div className="mt-6 onboard-step" key={step}>
          {current.key === "gender" ? (
            <select
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-700 select-input"
              value={form[current.key] ?? ""}
              onChange={(e) => update(current.key, e.target.value)}
            >
              <option value="">Select (optional)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Other">Other</option>
            </select>
          ) : current.key === "gaming_years" ? (
            <select
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-700 select-input"
              value={form[current.key] ?? ""}
              onChange={(e) => update(current.key, e.target.value)}
            >
              <option value="">Select (optional)</option>
              {gamingYearsOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : current.key === "play_style" ? (
            <select
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-700 select-input"
              value={form[current.key] ?? ""}
              onChange={(e) => update(current.key, e.target.value)}
            >
              <option value="">Select (optional)</option>
              {playStyleOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : current.key === "skills" ? (
            <>
              <textarea
                className="w-full min-h-[96px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
                placeholder={current.placeholder}
                value={form[current.key] ?? ""}
                onChange={(e) => update(current.key, e.target.value)}
              />
              {skillList.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skillList.map((s) => (
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
                      skillList.includes(s) ? "chip-active" : "",
                    ].join(" ")}
                    onClick={() => addToList("skills", s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          ) : current.key === "game" ? (
            <>
              <Input
                type="text"
                placeholder={current.placeholder}
                value={gameQuery}
                onChange={(e) => setGameQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addGameFromQuery();
                  }
                }}
              />
              {gameList.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {gameList.map((g) => (
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
            </>
          ) : current.key === "favorite_genres" ? (
            <>
              <Input
                type="text"
                placeholder={current.placeholder}
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
              {genreList.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {genreList.map((g) => (
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
            </>
          ) : current.key === "platforms" ? (
            <>
              <Input
                type="text"
                placeholder={current.placeholder}
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
              {platformList.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {platformList.map((p) => (
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
            </>
          ) : (
            <Input
              type={current.type ?? "text"}
              placeholder={current.placeholder}
              value={form[current.key] ?? ""}
              onChange={(e) => update(current.key, e.target.value)}
            />
          )}
          {current.optional ? (
            <p className="text-[11px] text-zinc-500 mt-2">
              Optional — you can skip this.
            </p>
          ) : null}
          {error ? <p className="text-xs text-red-400 mt-2">{error}</p> : null}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            Back
          </Button>

          {step < total - 1 ? (
            <div className="flex items-center gap-2">
              {current.optional ? (
                <Button variant="ghost" onClick={next}>
                  Skip
                </Button>
              ) : null}
              <Button onClick={next} disabled={!canContinue}>
                Next
              </Button>
            </div>
          ) : (
            <Button onClick={finish} disabled={saving}>
              {saving ? "Saving..." : "Finish"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
