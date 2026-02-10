import type { SupabaseClient } from "@supabase/supabase-js";
import { discordEnv } from "@/lib/discordServer";

export type DiscordRuntimeConfig = {
  guildId: string;
  memberRoleId: string;
  teamRoleId: string;
};

type ConfigRow = {
  key: string;
  value: Record<string, unknown> | null;
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function resolveDiscordRuntimeConfig(
  admin: SupabaseClient
): Promise<DiscordRuntimeConfig> {
  const env = discordEnv();

  const fallback: DiscordRuntimeConfig = {
    guildId: env.guildId,
    memberRoleId: env.memberRoleId,
    teamRoleId: env.teamRoleId,
  };

  const { data, error } = await admin
    .from("admin_system_settings")
    .select("key, value")
    .eq("key", "discord")
    .maybeSingle();

  if (error) {
    // table may not exist yet in fresh setup
    if (error.code === "42P01") return fallback;
    return fallback;
  }

  const row = (data ?? null) as ConfigRow | null;
  const payload = row?.value || {};

  const guildId = asText(payload.guild_id) || fallback.guildId;
  const memberRoleId = asText(payload.member_role_id) || fallback.memberRoleId;
  const teamRoleId = asText(payload.team_role_id) || fallback.teamRoleId;

  return { guildId, memberRoleId, teamRoleId };
}
