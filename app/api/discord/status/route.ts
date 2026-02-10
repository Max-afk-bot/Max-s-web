import { createClient } from "@supabase/supabase-js";
import {
  fetchDiscordGuildMemberWithBot,
  fetchDiscordGuildWithBot,
  hasDiscordOAuthEnv,
  discordEnv,
} from "@/lib/discordServer";
import { noStoreJson, rateLimit } from "@/lib/apiSecurity";
import { resolveDiscordRuntimeConfig } from "@/lib/discordConfig";

type DiscordLinkRow = {
  user_id: string;
  discord_user_id: string;
  discord_username: string | null;
  discord_avatar: string | null;
  discord_roles: string[] | null;
  is_in_guild: boolean | null;
};

export async function GET(req: Request) {
  const rateError = rateLimit(req, "discord-status-get", 60, 10 * 60 * 1000);
  if (rateError) return rateError;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return noStoreJson(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE URL." },
      500
    );
  }
  if (!hasDiscordOAuthEnv()) {
    return noStoreJson({
      linked: false,
      inGuild: false,
      hasMemberRole: false,
      hasTeamRole: false,
      roles: [],
      discordUsername: null,
      envMissing: true,
      error: "Discord OAuth env is incomplete on server.",
    });
  }

  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return noStoreJson({ error: "Missing auth token." }, 401);
  }
  const token = auth.slice(7);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return noStoreJson({ error: "Invalid session." }, 401);
  }

  const { data: linkData, error: linkError } = await admin
    .from("discord_links")
    .select(
      "user_id, discord_user_id, discord_username, discord_avatar, discord_roles, is_in_guild"
    )
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (linkError) {
    return noStoreJson(
      { error: linkError.message || "Failed to load Discord link." },
      500
    );
  }

  const link = (linkData ?? null) as DiscordLinkRow | null;

  if (!link?.discord_user_id) {
    return noStoreJson({
      linked: false,
      inGuild: false,
      hasMemberRole: false,
      hasTeamRole: false,
      roles: [],
      discordUsername: null,
      envMissing: false,
    });
  }

  const runtime = await resolveDiscordRuntimeConfig(admin);
  const env = discordEnv();
  if (!runtime.guildId) {
    return noStoreJson({
      linked: true,
      inGuild: false,
      hasMemberRole: false,
      hasTeamRole: false,
      roles: [],
      discordUsername: link.discord_username || null,
      envMissing: false,
      error: "Guild ID is not configured.",
    });
  }

  const memberRes = await fetchDiscordGuildMemberWithBot(
    link.discord_user_id,
    runtime.guildId,
    env.botToken
  );
  if (!memberRes.ok && memberRes.status !== 404) {
    return noStoreJson(
      {
        error:
          (memberRes.body as { message?: string })?.message ||
          "Failed to verify Discord guild member.",
      },
      502
    );
  }

  const roles = Array.isArray(memberRes.body?.roles)
    ? (memberRes.body.roles as string[])
    : [];
  const inGuild = memberRes.ok;
  let isGuildOwner = false;
  const guildRes = await fetchDiscordGuildWithBot(runtime.guildId, env.botToken);
  if (guildRes.ok && guildRes.body?.owner_id) {
    isGuildOwner = guildRes.body.owner_id === link.discord_user_id;
  }

  const hasTeamRole = runtime.teamRoleId
    ? roles.includes(runtime.teamRoleId) || isGuildOwner
    : isGuildOwner;
  const hasMemberRole = runtime.memberRoleId
    ? roles.includes(runtime.memberRoleId) || hasTeamRole
    : inGuild;

  const username =
    memberRes.body?.user?.global_name ||
    memberRes.body?.user?.username ||
    link.discord_username ||
    null;
  const avatar = memberRes.body?.user?.avatar || link.discord_avatar || null;

  await admin
    .from("discord_links")
    .update({
      discord_username: username,
      discord_avatar: avatar,
      discord_roles: roles,
      is_in_guild: inGuild,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userData.user.id);

  return noStoreJson({
    linked: true,
    inGuild,
    hasMemberRole,
    hasTeamRole,
    roles,
    discordUsername: username,
    envMissing: false,
  });
}
