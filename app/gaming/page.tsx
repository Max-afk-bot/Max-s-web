// Gaming page disabled for now.
// Original implementation is commented below for reference.

// "use client";
// 
// // Temporarily disabled. To restore, use this component as the page export again.
// 
// import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";
// import Card from "@/components/Card";
// import Input from "@/components/Input";
// import Button from "@/components/Button";
// import { supabase } from "@/lib/supabaseClient";
// import {
//   defaultProfileDraft,
//   fetchProfile,
//   type ProfileDraft,
// } from "@/lib/profile";
// import {
//   defaultGamingContent,
//   fetchGamingContent,
//   type GamingContent,
// } from "@/lib/gaming";
// import { isAdminEmail } from "@/lib/admin";
// import { isValidGmail } from "@/lib/validators";
// import {
//   BarChart3,
//   Crown,
//   ExternalLink,
//   Flame,
//   Gamepad2,
//   Lock,
//   Shield,
//   Swords,
//   Users,
// } from "lucide-react";
// 
// type TeamForm = {
//   name: string;
//   email: string;
//   discord: string;
//   role: string;
//   experience: string;
//   message: string;
// };
// 
// const defaultTeamForm: TeamForm = {
//   name: "",
//   email: "",
//   discord: "",
//   role: "",
//   experience: "",
//   message: "",
// };
// 
// function toYoutubeEmbed(url: string) {
//   const raw = url.trim();
//   if (!raw) return "";
//   try {
//     const u = new URL(raw);
//     if (u.hostname.includes("youtu.be")) {
//       const id = u.pathname.replace("/", "");
//       return id ? `https://www.youtube.com/embed/${id}` : "";
//     }
//     if (u.hostname.includes("youtube.com")) {
//       const id = u.searchParams.get("v");
//       return id ? `https://www.youtube.com/embed/${id}` : "";
//     }
//     return "";
//   } catch {
//     return "";
//   }
// }
// 
// function clampMetric(value: number) {
//   if (Number.isNaN(value)) return 0;
//   return Math.max(0, Math.min(100, value));
// }
// 
// type DiscordAccess = {
//   loading: boolean;
//   linked: boolean;
//   inGuild: boolean;
//   hasMemberRole: boolean;
//   hasTeamRole: boolean;
//   roles: string[];
//   discordUsername: string | null;
//   envMissing: boolean;
//   error: string | null;
// };
// 
// type LivePublicReport = {
//   week_label: string;
//   period_start: string;
//   period_end: string;
//   matches_played: number;
//   wins: number;
//   current_streak: number;
//   best_streak: number;
//   notes: string | null;
//   updated_at: string;
// };
// 
// type TeamMetrics = {
//   attack: number;
//   defense: number;
//   loss_rate: number;
//   strategies: number;
//   mid_game_skill_use: number;
// };
// 
// type LiveModeBreakdown = {
//   skywars: number;
//   bedwars: number;
//   hardcore: number;
//   speedrun: number;
//   pvp: number;
//   build: number;
// };
// 
// type LiveHistoryPoint = {
//   week_label: string;
//   period_end: string;
//   matches_played: number;
//   wins: number;
//   win_rate: number;
//   current_streak: number;
// };
// 
// const defaultDiscordAccess: DiscordAccess = {
//   loading: true,
//   linked: false,
//   inGuild: false,
//   hasMemberRole: false,
//   hasTeamRole: false,
//   roles: [],
//   discordUsername: null,
//   envMissing: false,
//   error: null,
// };
// 
// export default function GamingPage() {
//   const searchParams = useSearchParams();
//   const [profile, setProfile] = useState<ProfileDraft>(defaultProfileDraft);
//   const [content, setContent] = useState<GamingContent>(defaultGamingContent);
//   const [discordAccess, setDiscordAccess] =
//     useState<DiscordAccess>(defaultDiscordAccess);
//   const [isAdminViewer, setIsAdminViewer] = useState(false);
//   const [sessionToken, setSessionToken] = useState<string | null>(null);
//   const [discordBusy, setDiscordBusy] = useState(false);
//   const [discordNotice, setDiscordNotice] = useState<string | null>(null);
//   const [livePublic, setLivePublic] = useState<LivePublicReport | null>(null);
//   const [liveTeamMetrics, setLiveTeamMetrics] = useState<TeamMetrics | null>(null);
//   const [liveModes, setLiveModes] = useState<LiveModeBreakdown | null>(null);
//   const [liveHistory, setLiveHistory] = useState<LiveHistoryPoint[]>([]);
//   const [liveError, setLiveError] = useState<string | null>(null);
//   const [teamForm, setTeamForm] = useState<TeamForm>(defaultTeamForm);
//   const [requestState, setRequestState] = useState<
//     "idle" | "sending" | "sent" | "error"
//   >("idle");
//   const [requestError, setRequestError] = useState<string | null>(null);
// 
//   const loadDiscordStatus = useCallback(async (token: string) => {
//     setDiscordAccess((prev) => ({ ...prev, loading: true, error: null }));
//     try {
//       const res = await fetch("/api/discord/status", {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const body = (await res.json().catch(() => ({}))) as {
//         error?: string;
//         linked?: boolean;
//         inGuild?: boolean;
//         hasMemberRole?: boolean;
//         hasTeamRole?: boolean;
//         roles?: string[];
//         discordUsername?: string | null;
//         envMissing?: boolean;
//       };
// 
//       if (!res.ok) {
//         setDiscordAccess({
//           ...defaultDiscordAccess,
//           loading: false,
//           error: body.error || "Failed to verify Discord access.",
//         });
//         return;
//       }
// 
//       setDiscordAccess({
//         loading: false,
//         linked: Boolean(body.linked),
//         inGuild: Boolean(body.inGuild),
//         hasMemberRole: Boolean(body.hasMemberRole),
//         hasTeamRole: Boolean(body.hasTeamRole),
//         roles: Array.isArray(body.roles) ? body.roles : [],
//         discordUsername: body.discordUsername || null,
//         envMissing: Boolean(body.envMissing),
//         error: body.error || null,
//       });
//     } catch {
//       setDiscordAccess({
//         ...defaultDiscordAccess,
//         loading: false,
//         error: "Network error while checking Discord access.",
//       });
//     }
//   }, []);
// 
//   const loadLiveData = useCallback(async (token?: string | null) => {
//     try {
//       const res = await fetch("/api/gaming/live", {
//         method: "GET",
//         headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//       });
//       const body = (await res.json().catch(() => ({}))) as {
//         error?: string;
//         report_public?: LivePublicReport | null;
//         history_public?: LiveHistoryPoint[];
//         mode_breakdown?: LiveModeBreakdown | null;
//         team_metrics?: TeamMetrics | null;
//       };
//       if (!res.ok) {
//         setLiveError(body.error || "Failed to load live gaming data.");
//         setLiveHistory([]);
//         return;
//       }
//       setLivePublic(body.report_public || null);
//       setLiveTeamMetrics(body.team_metrics || null);
//       setLiveModes(body.mode_breakdown || null);
//       setLiveHistory(Array.isArray(body.history_public) ? body.history_public : []);
//       setLiveError(body.error || null);
//     } catch {
//       setLiveError("Network error while loading live gaming data.");
//       setLiveHistory([]);
//     }
//   }, []);
// 
//   useEffect(() => {
//     let mounted = true;
// 
//     supabase.auth.getSession().then(({ data }) => {
//       if (!mounted) return;
//       const session = data.session;
//       if (!session) {
//         setDiscordAccess((prev) => ({ ...prev, loading: false }));
//         loadLiveData(null);
//         return;
//       }
// 
//       setSessionToken(session.access_token);
//       setIsAdminViewer(isAdminEmail(session.user.email));
//       loadDiscordStatus(session.access_token);
//       loadLiveData(session.access_token);
// 
//       fetchProfile(session.user.id).then((p) => {
//         if (!mounted) return;
//         if (p) setProfile({ ...defaultProfileDraft, ...p });
//         setTeamForm((prev) => ({
//           ...prev,
//           name:
//             p?.name ||
//             session.user.user_metadata?.name ||
//             session.user.user_metadata?.full_name ||
//             prev.name,
//           email: session.user.email || prev.email,
//         }));
//       });
//     });
// 
//     fetchGamingContent().then((data) => {
//       if (!mounted || !data) return;
//       setContent({ ...defaultGamingContent, ...data });
//     });
// 
//     return () => {
//       mounted = false;
//     };
//   }, [loadDiscordStatus, loadLiveData]);
// 
//   const discordCallbackNotice = useMemo(() => {
//     const result = searchParams.get("discord");
//     const err = searchParams.get("discord_error");
//     if (err) {
//       return `Discord link failed: ${err.replaceAll("_", " ")}`;
//     }
//     if (!result) return null;
//     const map: Record<string, string> = {
//       linked_not_in_server:
//         "Discord connected. Join the server to unlock member sections.",
//       team_role_granted:
//         "Discord connected. Team role detected. Full gaming intel unlocked.",
//       member_role_granted:
//         "Discord connected. Member access unlocked successfully.",
//       linked_no_role:
//         "Discord connected. Ask admin for member/team role to unlock sections.",
//     };
//     return map[result] || "Discord linked.";
//   }, [searchParams]);
// 
//   useEffect(() => {
//     const result = searchParams.get("discord");
//     const err = searchParams.get("discord_error");
//     if ((!result && !err) || !sessionToken) return;
//     const timer = window.setTimeout(() => {
//       void loadDiscordStatus(sessionToken);
//       void loadLiveData(sessionToken);
//     }, 0);
//     return () => window.clearTimeout(timer);
//   }, [loadDiscordStatus, loadLiveData, searchParams, sessionToken]);
// 
//   const showFullIntel =
//     isAdminViewer || !content.require_discord_gate || discordAccess.hasMemberRole;
//   const canViewTeamIntel =
//     showFullIntel && (isAdminViewer || discordAccess.hasTeamRole || !!liveTeamMetrics);
//   const games = String(profile.game || "")
//     .split(",")
//     .map((x) => x.trim())
//     .filter(Boolean);
//   const metricsFallback = {
//     attack: 0,
//     defense: 0,
//     loss_rate: 0,
//     strategies: 0,
//     mid_game_skill_use: 0,
//   };
//   const resolvedMetrics = liveTeamMetrics || metricsFallback;
//   const modeItems = useMemo(() => {
//     const modes = liveModes;
//     if (!modes) return [];
//     return [
//       { label: "Skywars", value: modes.skywars },
//       { label: "Bedwars", value: modes.bedwars },
//       { label: "Hardcore", value: modes.hardcore },
//       { label: "Speedrun", value: modes.speedrun },
//       { label: "PvP", value: modes.pvp },
//       { label: "Build", value: modes.build },
//     ];
//   }, [liveModes]);
// 
//   const metricItems = useMemo(
//     () => [
//       { label: "Defense", value: clampMetric(resolvedMetrics.defense) },
//       { label: "Loss Rate", value: clampMetric(resolvedMetrics.loss_rate) },
//       { label: "Attack", value: clampMetric(resolvedMetrics.attack) },
//       { label: "Strategies", value: clampMetric(resolvedMetrics.strategies) },
//       {
//         label: "Mid Game Skill Use",
//         value: clampMetric(resolvedMetrics.mid_game_skill_use),
//       },
//     ],
//     [resolvedMetrics]
//   );
// 
//   const pieStyle = useMemo(() => {
//     const values = metricItems.map((x) => x.value);
//     const total = values.reduce((a, b) => a + b, 0);
//     if (total <= 0) {
//       return {
//         background: "conic-gradient(rgba(63,63,70,.9) 0 100%)",
//       };
//     }
//     const colors = [
//       "rgba(251,146,60,.95)",
//       "rgba(249,115,22,.95)",
//       "rgba(239,68,68,.95)",
//       "rgba(217,70,239,.95)",
//       "rgba(56,189,248,.95)",
//     ];
//     let cursor = 0;
//     const slices: string[] = [];
//     for (let i = 0; i < values.length; i++) {
//       const start = cursor;
//       const step = (values[i] / total) * 100;
//       cursor += step;
//       slices.push(`${colors[i % colors.length]} ${start}% ${cursor}%`);
//     }
//     return {
//       background: `conic-gradient(${slices.join(",")})`,
//     };
//   }, [metricItems]);
// 
//   const historyChart = useMemo(() => {
//     if (liveHistory.length === 0) return null;
//     const width = 720;
//     const height = 250;
//     const paddingX = 24;
//     const top = 20;
//     const bottom = 46;
//     const plotHeight = height - top - bottom;
//     const steps = Math.max(1, liveHistory.length - 1);
// 
//     const rates = liveHistory.map((p) => clampMetric(p.win_rate));
//     const minRateRaw = Math.min(...rates);
//     const maxRateRaw = Math.max(...rates);
//     const minRate = Math.max(0, minRateRaw - 6);
//     const maxRate = Math.min(100, maxRateRaw + 6);
//     const range = Math.max(8, maxRate - minRate);
// 
//     const maxMatches = Math.max(...liveHistory.map((p) => p.matches_played), 1);
// 
//     const points = liveHistory.map((p, i) => {
//       const x = paddingX + (i / steps) * (width - paddingX * 2);
//       const y =
//         top +
//         ((maxRate - clampMetric(p.win_rate)) / range) * plotHeight;
//       return { x, y, data: p };
//     });
// 
//     const path = points
//       .map((pt, idx) => `${idx === 0 ? "M" : "L"}${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`)
//       .join(" ");
// 
//     const areaPath =
//       points.length > 0
//         ? `${path} L${points[points.length - 1].x.toFixed(2)} ${(
//             height - bottom
//           ).toFixed(2)} L${points[0].x.toFixed(2)} ${(height - bottom).toFixed(
//             2
//           )} Z`
//         : "";
// 
//     const first = liveHistory[0];
//     const last = liveHistory[liveHistory.length - 1];
//     const delta = clampMetric(last.win_rate) - clampMetric(first.win_rate);
// 
//     return {
//       width,
//       height,
//       top,
//       bottom,
//       points,
//       path,
//       areaPath,
//       minRate,
//       maxRate,
//       range,
//       maxMatches,
//       delta,
//     };
//   }, [liveHistory]);
// 
//   const embedUrl = toYoutubeEmbed(content.clip_url);
// 
//   const refreshDiscordAccess = async () => {
//     const token =
//       sessionToken ||
//       (await supabase.auth.getSession()).data.session?.access_token ||
//       null;
//     if (!token) return;
//     setDiscordBusy(true);
//     await loadDiscordStatus(token);
//     await loadLiveData(token);
//     setDiscordBusy(false);
//   };
// 
//   const connectDiscord = async () => {
//     const token =
//       sessionToken ||
//       (await supabase.auth.getSession()).data.session?.access_token ||
//       null;
//     if (!token) {
//       setDiscordNotice("Sign in first, then connect Discord.");
//       return;
//     }
//     setDiscordBusy(true);
//     try {
//       const res = await fetch("/api/discord/connect", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const body = (await res.json().catch(() => ({}))) as {
//         url?: string;
//         error?: string;
//       };
//       if (!res.ok || !body.url) {
//         setDiscordNotice(body.error || "Failed to start Discord connect.");
//         setDiscordBusy(false);
//         return;
//       }
//       window.location.href = body.url;
//     } catch {
//       setDiscordNotice("Network error while starting Discord connect.");
//       setDiscordBusy(false);
//     }
//   };
// 
//   const submitTeamRequest = async (e: FormEvent) => {
//     e.preventDefault();
//     setRequestError(null);
// 
//     if (!teamForm.name.trim() || !teamForm.email.trim()) {
//       setRequestState("error");
//       setRequestError("Name and email are required.");
//       return;
//     }
//     if (!isValidGmail(teamForm.email)) {
//       setRequestState("error");
//       setRequestError("Please use a Gmail address.");
//       return;
//     }
// 
//     const token =
//       sessionToken ||
//       (await supabase.auth.getSession()).data.session?.access_token ||
//       null;
//     if (!token) {
//       setRequestState("error");
//       setRequestError("Sign in first, then submit a team request.");
//       return;
//     }
// 
//     setRequestState("sending");
// 
//     try {
//       const res = await fetch("/api/team-request", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(teamForm),
//       });
// 
//       if (!res.ok) {
//         const body = await res.json().catch(() => ({}));
//         setRequestState("error");
//         setRequestError(body?.error || "Request failed.");
//         return;
//       }
// 
//       setRequestState("sent");
//       setTeamForm((prev) => ({
//         ...defaultTeamForm,
//         name: prev.name,
//         email: prev.email,
//       }));
//     } catch {
//       setRequestState("error");
//       setRequestError("Network error. Try again.");
//     }
//   };
// 
//   return (
//     <div className="space-y-8 animate-pageIn relative overflow-hidden gaming-stage-plus">
//       <div className="gaming-vortex" aria-hidden="true" />
//       <div className="gaming-noise" aria-hidden="true" />
// 
//       <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-zinc-950/70 p-6 md:p-7">
//         <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
//         <div className="absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
//         <div className="relative flex items-start justify-between gap-4">
//           <div>
//             <div className="inline-flex items-center gap-2 text-xs text-zinc-300 border border-zinc-800 rounded-full px-3 py-1 bg-zinc-900/30">
//               <Gamepad2 size={14} />
//               GAMING INTEL
//               <span className="text-orange-300">WEEKLY</span>
//             </div>
//             <h1 className="text-3xl sm:text-4xl font-semibold mt-4 tracking-tight">
//               {content.hero_title}
//             </h1>
//             <p className="text-sm text-zinc-400 mt-3 max-w-3xl">
//               {content.hero_intro}
//             </p>
//             <p className="text-xs text-zinc-500 mt-3">{content.weekly_note}</p>
//           </div>
// 
//           <div className="hidden md:flex flex-col items-end gap-2">
//             <span className="chip chip-mini">{content.focus_game}</span>
//             <span className="chip chip-mini">Rank {content.rank_label}</span>
//           </div>
//         </div>
//       </div>
// 
//       <Card className="p-6 border-orange-500/20 bg-zinc-950/60">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h2 className="text-lg font-semibold flex items-center gap-2">
//               <Users size={18} className="opacity-80" />
//               {content.community_title}
//             </h2>
//             <p className="text-sm text-zinc-400 mt-2">{content.community_text}</p>
//             <p className="text-xs text-zinc-500 mt-2">
//               Joining Discord and joining team are different steps.
//             </p>
//             {discordAccess.discordUsername ? (
//               <p className="text-xs text-zinc-500 mt-2">
//                 Linked Discord: {discordAccess.discordUsername}
//               </p>
//             ) : null}
//           </div>
//           <div className="flex flex-wrap gap-2">
//             <a
//               href={content.discord_url}
//               target="_blank"
//               rel="noreferrer"
//               className="btn-press magnetic rounded-xl border border-orange-500/35 bg-orange-500/15 px-4 py-2 text-sm hover:bg-orange-500/25 transition inline-flex items-center gap-2"
//             >
//               Join Discord
//               <ExternalLink size={14} />
//             </a>
//             <Button
//               variant="ghost"
//               onClick={discordAccess.linked ? refreshDiscordAccess : connectDiscord}
//               disabled={discordBusy}
//             >
//               {discordBusy
//                 ? "Checking..."
//                 : discordAccess.linked
//                 ? "Refresh Access"
//                 : "Connect Discord"}
//             </Button>
//           </div>
//         </div>
//         {discordNotice || discordCallbackNotice ? (
//           <p className="text-xs text-zinc-400 mt-3">
//             {discordNotice || discordCallbackNotice}
//           </p>
//         ) : null}
//         {discordAccess.error ? (
//           <p className="text-xs text-red-400 mt-2">{discordAccess.error}</p>
//         ) : null}
//         {discordAccess.envMissing ? (
//           <p className="text-xs text-red-400 mt-2">
//             Discord backend env is missing. Ask admin to configure Discord vars.
//           </p>
//         ) : null}
//         {liveError ? <p className="text-xs text-red-400 mt-2">{liveError}</p> : null}
//       </Card>
// 
//       {!showFullIntel ? (
//         <Card className="p-7 border-red-500/30 bg-red-950/15">
//           <div className="flex items-start gap-3">
//             <Lock className="mt-0.5 opacity-90" size={20} />
//             <div>
//               <h3 className="text-lg font-semibold">{content.gate_title}</h3>
//               <p className="text-sm text-zinc-300 mt-2">{content.gate_text}</p>
//               {discordAccess.loading ? (
//                 <p className="text-xs text-zinc-500 mt-3">Checking Discord access...</p>
//               ) : null}
//               {!discordAccess.loading && discordAccess.linked && !discordAccess.inGuild ? (
//                 <p className="text-xs text-zinc-500 mt-3">
//                   Your Discord is linked, but this account is not in the server yet.
//                 </p>
//               ) : null}
//               {!discordAccess.loading &&
//               discordAccess.linked &&
//               discordAccess.inGuild &&
//               !discordAccess.hasMemberRole ? (
//                 <p className="text-xs text-zinc-500 mt-3">
//                   You are in Discord server, but member role is not assigned yet.
//                 </p>
//               ) : null}
//               <p className="text-xs text-zinc-500 mt-3">
//                 Public preview: {content.focus_game} • {content.primary_platform} •{" "}
//                 {content.years_experience}.
//               </p>
//             </div>
//           </div>
//         </Card>
//       ) : null}
// 
//       {showFullIntel ? (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
//             <Card className="p-5 border-zinc-800 bg-zinc-950/60 card-shine">
//               <div className="text-xs text-zinc-500">Focus Game</div>
//               <div className="text-sm font-medium mt-2">{content.focus_game}</div>
//             </Card>
//             <Card className="p-5 border-zinc-800 bg-zinc-950/60 card-shine">
//               <div className="text-xs text-zinc-500">Rank</div>
//               <div className="text-sm font-medium mt-2">{content.rank_label}</div>
//             </Card>
//             <Card className="p-5 border-zinc-800 bg-zinc-950/60 card-shine">
//               <div className="text-xs text-zinc-500">Platform</div>
//               <div className="text-sm font-medium mt-2">{content.primary_platform}</div>
//             </Card>
//             <Card className="p-5 border-zinc-800 bg-zinc-950/60 card-shine">
//               <div className="text-xs text-zinc-500">Experience</div>
//               <div className="text-sm font-medium mt-2">{content.years_experience}</div>
//               {livePublic ? (
//                 <div className="text-xs text-zinc-500 mt-2">
//                   {livePublic.matches_played} matches • {livePublic.wins} wins
//                 </div>
//               ) : null}
//             </Card>
//           </div>
// 
//           <Card className="p-6 border-zinc-800 bg-zinc-950/60 overflow-hidden">
//             <div className="flex flex-wrap items-start justify-between gap-3">
//               <div>
//                 <h2 className="text-lg font-semibold flex items-center gap-2">
//                   <BarChart3 size={18} className="opacity-80" />
//                   Weekly Momentum
//                 </h2>
//                 <p className="text-sm text-zinc-400 mt-2">
//                   Trading-style trend of weekly win rate and match volume (last 8
//                   weeks).
//                 </p>
//               </div>
//               {historyChart ? (
//                 <div className="text-right text-xs">
//                   <div className="text-zinc-500">Trend</div>
//                   <div
//                     className={
//                       historyChart.delta >= 0
//                         ? "text-emerald-400 font-medium"
//                         : "text-red-400 font-medium"
//                     }
//                   >
//                     {historyChart.delta >= 0 ? "+" : ""}
//                     {historyChart.delta}%
//                   </div>
//                 </div>
//               ) : null}
//             </div>
// 
//             {historyChart ? (
//               <>
//                 <div className="mt-5 rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/55 to-zinc-950/55 p-3">
//                   <svg
//                     viewBox={`0 0 ${historyChart.width} ${historyChart.height}`}
//                     className="w-full h-auto"
//                     role="img"
//                     aria-label="Weekly win-rate trend chart"
//                   >
//                     <defs>
//                       <linearGradient id="historyArea" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="0%" stopColor="rgba(56,189,248,0.45)" />
//                         <stop offset="100%" stopColor="rgba(56,189,248,0.03)" />
//                       </linearGradient>
//                       <linearGradient id="historyLine" x1="0" y1="0" x2="1" y2="0">
//                         <stop offset="0%" stopColor="rgba(125,211,252,1)" />
//                         <stop offset="100%" stopColor="rgba(34,211,238,1)" />
//                       </linearGradient>
//                     </defs>
// 
//                     {[0, 1, 2, 3, 4].map((n) => {
//                       const y =
//                         historyChart.top +
//                         (n / 4) * (historyChart.height - historyChart.top - historyChart.bottom);
//                       const value = Math.round(
//                         historyChart.maxRate - (n / 4) * historyChart.range
//                       );
//                       return (
//                         <g key={n}>
//                           <line
//                             x1="16"
//                             y1={y}
//                             x2={historyChart.width - 16}
//                             y2={y}
//                             stroke="rgba(113,113,122,0.35)"
//                             strokeDasharray="5 6"
//                           />
//                           <text
//                             x={historyChart.width - 8}
//                             y={y - 4}
//                             textAnchor="end"
//                             fontSize="10"
//                             fill="rgba(161,161,170,0.85)"
//                           >
//                             {value}%
//                           </text>
//                         </g>
//                       );
//                     })}
// 
//                     {historyChart.points.map((pt, idx) => {
//                       const barH =
//                         (pt.data.matches_played / historyChart.maxMatches) * 28;
//                       return (
//                         <g key={pt.data.week_label + idx}>
//                           <rect
//                             x={pt.x - 7}
//                             y={historyChart.height - historyChart.bottom + (28 - barH)}
//                             width="14"
//                             height={barH}
//                             rx="3"
//                             fill="rgba(249,115,22,0.4)"
//                           />
//                         </g>
//                       );
//                     })}
// 
//                     <path d={historyChart.areaPath} fill="url(#historyArea)" />
//                     <path
//                       d={historyChart.path}
//                       fill="none"
//                       stroke="url(#historyLine)"
//                       strokeWidth="3"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
// 
//                     {historyChart.points.map((pt, idx) => (
//                       <g key={`${pt.data.week_label}-dot-${idx}`}>
//                         <circle cx={pt.x} cy={pt.y} r="5.5" fill="rgba(3,7,18,1)" />
//                         <circle
//                           cx={pt.x}
//                           cy={pt.y}
//                           r="3.5"
//                           fill="rgba(125,211,252,0.98)"
//                         />
//                       </g>
//                     ))}
//                   </svg>
//                 </div>
// 
//                 <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
//                   {liveHistory.map((row) => (
//                     <div
//                       key={`history-${row.week_label}`}
//                       className="rounded-lg border border-zinc-800 bg-zinc-900/25 px-3 py-2 text-xs"
//                     >
//                       <div className="text-zinc-500">{row.week_label}</div>
//                       <div className="text-zinc-200 mt-1">
//                         {row.win_rate}% WR • {row.matches_played} matches
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/25 p-4 text-sm text-zinc-400">
//                 No history yet. Add weekly rows from `Admin Gaming`.
//               </div>
//             )}
//           </Card>
// 
//           {canViewTeamIntel ? (
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 stagger">
//               <Card className="p-6 border-zinc-800 bg-zinc-950/60 lg:col-span-2">
//                 <h2 className="text-lg font-semibold flex items-center gap-2">
//                   <BarChart3 size={18} className="opacity-80" />
//                   Performance Matrix
//                 </h2>
//                 <p className="text-sm text-zinc-400 mt-2">
//                   {livePublic
//                     ? `Live data for ${livePublic.week_label}. Updated ${new Date(
//                         livePublic.updated_at
//                       ).toLocaleDateString()}.`
//                     : "Live chart starts at zero and grows as weekly data gets added."}
//                 </p>
//                 {!liveTeamMetrics ? (
//                   <p className="text-xs text-zinc-500 mt-2">
//                     No weekly team metrics yet. Add data from Admin Gaming page.
//                   </p>
//                 ) : null}
//                 <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div className="flex items-center justify-center">
//                     <div className="relative h-44 w-44 rounded-full p-3 ring-1 ring-zinc-800 bg-zinc-900/30">
//                       <div
//                         className="h-full w-full rounded-full transition"
//                         style={pieStyle}
//                       />
//                       <div className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-zinc-950 border border-zinc-800 grid place-items-center text-xs text-zinc-400">
//                         Weekly
//                       </div>
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     {metricItems.map((item) => (
//                       <div
//                         key={item.label}
//                         className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3"
//                       >
//                         <div className="flex items-center justify-between text-xs text-zinc-500">
//                           <span>{item.label}</span>
//                           <span>{item.value}%</span>
//                         </div>
//                         <div className="mt-2 h-2 rounded-full bg-zinc-900/60">
//                           <div
//                             className="h-2 rounded-full bg-orange-400/80"
//                             style={{ width: `${item.value}%` }}
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </Card>
// 
//               <div className="space-y-4">
//                 <Card className="p-6 border-zinc-800 bg-zinc-950/60">
//                   <h2 className="text-lg font-semibold flex items-center gap-2">
//                     <Crown size={18} className="opacity-80" />
//                     Skill Intel
//                   </h2>
//                   <p className="text-sm text-zinc-400 mt-2">
//                     {content.skills_summary}
//                   </p>
//                   <div className="mt-4 space-y-2 text-sm text-zinc-300">
//                     <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
//                       Weapons: {content.weapons.join(", ") || "—"}
//                     </div>
//                     <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
//                       Style: {content.play_style_tags.join(" • ") || "—"}
//                     </div>
//                     <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
//                       {content.training_focus}
//                     </div>
//                     <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
//                       {content.other_games_note}
//                     </div>
//                   </div>
//                 </Card>
// 
//                 <Card className="p-6 border-zinc-800 bg-zinc-950/60">
//                   <h2 className="text-lg font-semibold flex items-center gap-2">
//                     <Swords size={18} className="opacity-80" />
//                     Mode Breakdown
//                   </h2>
//                   <p className="text-sm text-zinc-400 mt-2">
//                     Weekly matches by mode (admin filled).
//                   </p>
//                   {modeItems.length ? (
//                     <div className="mt-4 space-y-2 text-xs">
//                       {modeItems.map((item) => (
//                         <div
//                           key={item.label}
//                           className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3"
//                         >
//                           <div className="flex items-center justify-between text-zinc-400">
//                             <span>{item.label}</span>
//                             <span>{item.value}</span>
//                           </div>
//                           <div className="mt-2 h-2 rounded-full bg-zinc-900/60">
//                             <div
//                               className="h-2 rounded-full bg-cyan-400/80"
//                               style={{
//                                 width: `${Math.min(100, (item.value / 50) * 100)}%`,
//                               }}
//                             />
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/20 p-3 text-xs text-zinc-500">
//                       No mode data yet. Add weekly rows in Admin Gaming.
//                     </div>
//                   )}
//                 </Card>
//               </div>
//             </div>
//           ) : (
//             <Card className="p-6 border-red-500/30 bg-red-950/15">
//               <div className="flex items-start gap-3">
//                 <Lock className="mt-0.5 opacity-90" size={18} />
//                 <div>
//                   <h3 className="text-lg font-semibold">{content.team_gate_title}</h3>
//                   <p className="text-sm text-zinc-300 mt-2">{content.team_gate_text}</p>
//                   {discordAccess.linked && discordAccess.inGuild ? (
//                     <p className="text-xs text-zinc-500 mt-3">
//                       Member access detected. Team role is required for this section.
//                     </p>
//                   ) : null}
//                   <p className="text-xs text-zinc-500 mt-3">
//                     Join Discord first, then submit team request. Team approval is a
//                     separate step.
//                   </p>
//                 </div>
//               </div>
//             </Card>
//           )}
// 
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//             <Card className="p-6 border-zinc-800 bg-zinc-950/60">
//               <h2 className="text-lg font-semibold flex items-center gap-2">
//                 <Swords size={18} className="opacity-80" />
//                 Current Player Snapshot
//               </h2>
//               <div className="mt-4 space-y-2 text-sm text-zinc-300">
//                 <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
//                   Display: {profile.name || "Player"}
//                 </div>
//                 <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
//                   Games: {games.length ? games.join(", ") : content.focus_game}
//                 </div>
//                 {livePublic ? (
//                   <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
//                     Weekly streak: {livePublic.current_streak} (best{" "}
//                     {livePublic.best_streak})
//                   </div>
//                 ) : null}
//                 <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
//                   <Shield size={14} className="inline mr-2 opacity-80" />
//                   Team data visibility: weekly and role-based (team members only).
//                 </div>
//               </div>
//             </Card>
// 
//             <Card className="p-6 border-zinc-800 bg-zinc-950/60">
//               <h2 className="text-lg font-semibold flex items-center gap-2">
//                 <Flame size={18} className="opacity-80" />
//                 Clips and Highlights
//               </h2>
//               <p className="text-sm text-zinc-400 mt-2">{content.clip_title}</p>
//               <div className="mt-4">
//                 {embedUrl ? (
//                   <iframe
//                     title="Gaming clip"
//                     src={embedUrl}
//                     className="w-full aspect-video rounded-xl border border-zinc-800 bg-zinc-900/20"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                   />
//                 ) : (
//                   <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 text-sm text-zinc-400">
//                     No clip embedded yet. Add YouTube clip URL from admin later.
//                   </div>
//                 )}
//               </div>
//             </Card>
//           </div>
//         </>
//       ) : null}
// 
//       <Card className="p-6 border-zinc-800 bg-zinc-950/60">
//         <h2 className="text-lg font-semibold">Join Team Request</h2>
//         <p className="text-sm text-zinc-400 mt-2">{content.team_form_intro}</p>
//         <form className="mt-4 space-y-4" onSubmit={submitTeamRequest}>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Input
//               placeholder="Name"
//               value={teamForm.name}
//               onChange={(e) =>
//                 setTeamForm((p) => ({ ...p, name: e.target.value }))
//               }
//               required
//             />
//             <Input
//               type="email"
//               placeholder="Email"
//               value={teamForm.email}
//               onChange={(e) =>
//                 setTeamForm((p) => ({ ...p, email: e.target.value }))
//               }
//               required
//             />
//             <Input
//               placeholder="Discord username"
//               value={teamForm.discord}
//               onChange={(e) =>
//                 setTeamForm((p) => ({ ...p, discord: e.target.value }))
//               }
//             />
//             <Input
//               placeholder="Role you want (e.g. PvP, Support)"
//               value={teamForm.role}
//               onChange={(e) =>
//                 setTeamForm((p) => ({ ...p, role: e.target.value }))
//               }
//             />
//             <Input
//               placeholder="Gaming experience"
//               value={teamForm.experience}
//               onChange={(e) =>
//                 setTeamForm((p) => ({ ...p, experience: e.target.value }))
//               }
//             />
//           </div>
//           <textarea
//             className="w-full min-h-[120px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
//             placeholder="Tell your strengths and why you want to join..."
//             value={teamForm.message}
//             onChange={(e) =>
//               setTeamForm((p) => ({ ...p, message: e.target.value }))
//             }
//           />
//           <div className="flex flex-wrap items-center justify-between gap-3">
//             <p className="text-xs text-zinc-500">
//               Join Discord and joining team are separate steps.
//             </p>
//             <div className="flex items-center gap-2">
//               <a
//                 href={content.discord_url}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="btn-press magnetic rounded-xl border border-zinc-700 bg-zinc-900/40 px-4 py-2 text-sm hover:bg-zinc-900/70 transition"
//               >
//                 Join Discord
//               </a>
//               <Button type="submit" disabled={requestState === "sending"}>
//                 {requestState === "sending" ? "Sending..." : "Submit Request"}
//               </Button>
//             </div>
//           </div>
//           {requestState === "sent" ? (
//             <p className="text-xs text-emerald-400">
//               Request submitted. Check Discord for next steps.
//             </p>
//           ) : null}
//           {requestState === "error" ? (
//             <p className="text-xs text-red-400">{requestError}</p>
//           ) : null}
//         </form>
//       </Card>
// 
//       <Card className="p-5 border-zinc-800 bg-zinc-950/60">
//         <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
//           <p className="text-zinc-400">
//             Weekly refresh model active. Some private team details are hidden for now.
//           </p>
//           <Link
//             href="/admin/gaming"
//             className="text-zinc-200 hover:text-white underline"
//           >
//             Admin Gaming Control
//           </Link>
//         </div>
//       </Card>
//     </div>
//   );
// }

import Link from "next/link";
import Card from "@/components/Card";
import { Gamepad2, Sparkles, Shield } from "lucide-react";

export default function GamingPage() {
  return (
    <div className="space-y-6 animate-pageIn">
      <Card className="p-6 border-zinc-800 bg-zinc-950/70">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 grid place-items-center">
            <Gamepad2 size={20} className="opacity-80" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide">
              Gaming hub
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Coming soon
            </h1>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mt-3 max-w-2xl">
          This page is being rebuilt with live stats, weekly reports, and Discord
          team gating. We will publish it after backend data is ready.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/projects"
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm hover:bg-zinc-900/70 transition"
          >
            View projects
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm hover:bg-zinc-900/70 transition"
          >
            Contact
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles size={16} className="opacity-80" />
            Planned features
          </div>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            <li className="rounded-lg border border-zinc-800 bg-zinc-900/20 px-3 py-2">
              Weekly performance chart and match trends
            </li>
            <li className="rounded-lg border border-zinc-800 bg-zinc-900/20 px-3 py-2">
              Skill intel and team-only sections
            </li>
            <li className="rounded-lg border border-zinc-800 bg-zinc-900/20 px-3 py-2">
              Discord role sync + team requests
            </li>
          </ul>
        </Card>

        <Card className="p-5 border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Shield size={16} className="opacity-80" />
            Early access
          </div>
          <p className="text-sm text-zinc-400 mt-3">
            Join the community and watch for the launch. Team members will get
            access to deeper stats and private intel.
          </p>
          <div className="mt-4">
            <Link
              href="/contact"
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm hover:bg-zinc-900/70 transition"
            >
              Join community
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
