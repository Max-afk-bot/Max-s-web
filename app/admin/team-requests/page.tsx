"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { supabase } from "@/lib/supabaseClient";

type TeamRequest = {
  id: number;
  user_id: string | null;
  name: string;
  email: string;
  discord_username: string | null;
  discord_user_id: string | null;
  role: string | null;
  experience: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export default function AdminTeamRequestsPage() {
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError("No admin session.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/team-requests", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      requests?: TeamRequest[];
    };
    if (!res.ok) {
      setError(body.error || "Failed to load requests.");
      setLoading(false);
      return;
    }
    setRequests(body.requests ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const updateStatus = async (
    req: TeamRequest,
    status: TeamRequest["status"],
    grantRole: boolean
  ) => {
    setError(null);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError("No admin session.");
      return;
    }

    const res = await fetch("/api/admin/team-requests", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: req.id,
        status,
        admin_note: notes[req.id] ?? req.admin_note ?? "",
        grant_role: grantRole,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(body.error || "Update failed.");
      return;
    }
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Team Requests</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Review and approve team join requests. Approve can also assign Discord
            Team role.
          </p>
        </div>
        <Button variant="ghost" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      {loading ? (
        <Card className="p-6 text-sm text-zinc-400">Loading requests...</Card>
      ) : null}

      {!loading && requests.length === 0 ? (
        <Card className="p-6 text-sm text-zinc-400">No requests yet.</Card>
      ) : null}

      <div className="space-y-4">
        {requests.map((req) => (
          <Card key={req.id} className="p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{req.name}</p>
                <p className="text-xs text-zinc-500 mt-1">{req.email}</p>
                {req.discord_username ? (
                  <p className="text-xs text-zinc-500 mt-1">
                    Discord: {req.discord_username}
                  </p>
                ) : null}
              </div>
              <span className="text-xs rounded-full border border-zinc-800 px-3 py-1 text-zinc-300">
                {req.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-300">
              <div>
                <span className="text-xs text-zinc-500">Role</span>
                <div className="mt-1">{req.role || "—"}</div>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Experience</span>
                <div className="mt-1">{req.experience || "—"}</div>
              </div>
            </div>

            {req.message ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 text-sm text-zinc-300">
                {req.message}
              </div>
            ) : null}

            <div>
              <p className="text-xs text-zinc-500 mb-2">Admin note</p>
              <Input
                value={notes[req.id] ?? req.admin_note ?? ""}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => updateStatus(req, "approved", false)}
                disabled={req.status === "approved"}
              >
                Approve
              </Button>
              <Button
                variant="ghost"
                onClick={() => updateStatus(req, "approved", true)}
                disabled={!req.discord_user_id || req.status === "approved"}
              >
                Approve + Grant Team Role
              </Button>
              <Button
                variant="ghost"
                onClick={() => updateStatus(req, "rejected", false)}
                disabled={req.status === "rejected"}
              >
                Reject
              </Button>
            </div>
            {!req.discord_user_id ? (
              <p className="text-xs text-zinc-500">
                Discord not linked. User must connect Discord before role can be granted.
              </p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
