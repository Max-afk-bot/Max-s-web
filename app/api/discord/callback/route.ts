import { createClient } from "@supabase/supabase-js";
import {
  discordEnv,
  exchangeDiscordCode,
  fetchDiscordGuildWithBot,
  fetchDiscordGuildMemberWithUserToken,
  fetchDiscordSelf,
  hasDiscordOAuthEnv,
  parseDiscordState,
} from "@/lib/discordServer";
import { resolveDiscordRuntimeConfig } from "@/lib/discordConfig";

function redirectWithStatus(req: Request, params: Record<string, string>) {
  const url = new URL("/gaming", req.url);
  Object.entries(params).forEach(([k, v]) => {
    url.searchParams.set(k, v);
  });
  return Response.redirect(url);
}

export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return redirectWithStatus(req, {
      discord_error: "server_supabase_env_missing",
    });
  }
  if (!hasDiscordOAuthEnv()) {
    return redirectWithStatus(req, { discord_error: "discord_env_missing" });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  if (error) {
    return redirectWithStatus(req, { discord_error: error });
  }
  if (!code || !state) {
    return redirectWithStatus(req, { discord_error: "missing_code_or_state" });
  }

  const parsed = parseDiscordState(state);
  if (!parsed?.userId) {
    return redirectWithStatus(req, { discord_error: "invalid_state" });
  }

  const tokenRes = await exchangeDiscordCode(code);
  if (!tokenRes.ok || !tokenRes.body?.access_token) {
    return redirectWithStatus(req, { discord_error: "token_exchange_failed" });
  }

  const userRes = await fetchDiscordSelf(tokenRes.body.access_token);
  if (!userRes.ok || !userRes.body?.id) {
    return redirectWithStatus(req, { discord_error: "discord_user_failed" });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const runtime = await resolveDiscordRuntimeConfig(admin);
  if (!runtime.guildId) {
    return redirectWithStatus(req, { discord_error: "guild_not_configured" });
  }

  const memberRes = await fetchDiscordGuildMemberWithUserToken(
    tokenRes.body.access_token,
    runtime.guildId
  );
  if (!memberRes.ok && memberRes.status !== 404) {
    return redirectWithStatus(req, { discord_error: "discord_member_check_failed" });
  }

  const roles = Array.isArray(memberRes.body?.roles)
    ? (memberRes.body.roles as string[])
    : [];
  const inGuild = memberRes.ok;
  const env = discordEnv();

  let isGuildOwner = false;
  if (runtime.guildId && env.botToken) {
    const guildRes = await fetchDiscordGuildWithBot(runtime.guildId, env.botToken);
    if (guildRes.ok && guildRes.body?.owner_id) {
      isGuildOwner = guildRes.body.owner_id === userRes.body.id;
    }
  }

  const hasTeamRole = runtime.teamRoleId
    ? roles.includes(runtime.teamRoleId) || isGuildOwner
    : isGuildOwner;
  const hasMemberRole = runtime.memberRoleId
    ? roles.includes(runtime.memberRoleId) || hasTeamRole
    : inGuild;

  const username = userRes.body.global_name || userRes.body.username || "";
  const { error: upsertError } = await admin.from("discord_links").upsert(
    {
      user_id: parsed.userId,
      discord_user_id: userRes.body.id,
      discord_username: username,
      discord_avatar: userRes.body.avatar ?? null,
      discord_roles: roles,
      is_in_guild: inGuild,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    return redirectWithStatus(req, { discord_error: "link_save_failed" });
  }

  if (!inGuild) {
    return redirectWithStatus(req, {
      discord: "linked_not_in_server",
    });
  }
  if (hasTeamRole) {
    return redirectWithStatus(req, { discord: "team_role_granted" });
  }
  if (hasMemberRole) {
    return redirectWithStatus(req, { discord: "member_role_granted" });
  }

  return redirectWithStatus(req, { discord: "linked_no_role" });
}
