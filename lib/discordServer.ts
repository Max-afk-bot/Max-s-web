import crypto from "crypto";

export const DISCORD_API = "https://discord.com/api/v10";

export function discordEnv() {
  return {
    clientId: process.env.DISCORD_CLIENT_ID || "",
    clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    redirectUri: process.env.DISCORD_REDIRECT_URI || "",
    botToken: process.env.DISCORD_BOT_TOKEN || "",
    guildId: process.env.DISCORD_GUILD_ID || "",
    teamRoleId: process.env.DISCORD_TEAM_ROLE_ID || "",
    memberRoleId: process.env.DISCORD_MEMBER_ROLE_ID || "",
    stateSecret: process.env.DISCORD_OAUTH_STATE_SECRET || "",
  };
}

export function hasDiscordOAuthEnv() {
  const env = discordEnv();
  return Boolean(
    env.clientId &&
      env.clientSecret &&
      env.redirectUri &&
      env.stateSecret &&
      env.botToken
  );
}

export function buildDiscordState(payload: { userId: string; nonce: string }) {
  const env = discordEnv();
  const raw = `${payload.userId}:${payload.nonce}`;
  const sig = crypto
    .createHmac("sha256", env.stateSecret)
    .update(raw)
    .digest("hex");
  return Buffer.from(`${raw}:${sig}`, "utf8").toString("base64url");
}

export function parseDiscordState(state: string) {
  const env = discordEnv();
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const [userId, nonce, sig] = decoded.split(":");
    if (!userId || !nonce || !sig) return null;
    const raw = `${userId}:${nonce}`;
    const expected = crypto
      .createHmac("sha256", env.stateSecret)
      .update(raw)
      .digest("hex");
    if (sig !== expected) return null;
    return { userId, nonce };
  } catch {
    return null;
  }
}

export async function discordFetch<T>(path: string, init?: RequestInit) {
  const res = await fetch(`${DISCORD_API}${path}`, init);
  const body = (await res.json().catch(() => ({}))) as T & {
    message?: string;
  };
  return { ok: res.ok, status: res.status, body };
}

export function discordAuthUrl(state: string) {
  const env = discordEnv();
  const params = new URLSearchParams({
    client_id: env.clientId,
    response_type: "code",
    redirect_uri: env.redirectUri,
    scope: "identify guilds.members.read",
    state,
    prompt: "consent",
  });
  return `${DISCORD_API}/oauth2/authorize?${params.toString()}`;
}

type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

export type DiscordUser = {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar?: string | null;
};

export type DiscordGuildMember = {
  user?: DiscordUser;
  roles?: string[];
};

export type DiscordGuild = {
  id: string;
  owner_id: string;
};

export async function exchangeDiscordCode(code: string) {
  const env = discordEnv();
  const params = new URLSearchParams({
    client_id: env.clientId,
    client_secret: env.clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: env.redirectUri,
  });

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as DiscordTokenResponse;
  return { ok: res.ok, status: res.status, body };
}

export async function fetchDiscordSelf(token: string) {
  return discordFetch<DiscordUser>("/users/@me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}

export async function fetchDiscordGuildMemberWithUserToken(
  token: string,
  guildId: string
) {
  return discordFetch<DiscordGuildMember>(
    `/users/@me/guilds/${guildId}/member`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );
}

export async function fetchDiscordGuildMemberWithBot(
  discordUserId: string,
  guildId: string,
  botToken: string
) {
  return discordFetch<DiscordGuildMember>(
    `/guilds/${guildId}/members/${discordUserId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );
}

export async function fetchDiscordGuildWithBot(guildId: string, botToken: string) {
  return discordFetch<DiscordGuild>(`/guilds/${guildId}`, {
    method: "GET",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}

export async function addDiscordRoleToMember(
  guildId: string,
  discordUserId: string,
  roleId: string,
  botToken: string
) {
  return discordFetch(`/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}
