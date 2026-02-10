"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import { supabase } from "@/lib/supabaseClient";
import {
  defaultProfileDraft,
  fetchProfile,
  type ProfileDraft,
} from "@/lib/profile";

const fallback: ProfileDraft = {
  ...defaultProfileDraft,
  bio: "Building a modern dashboard website. Interested in programming and gaming.",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDraft>(fallback);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session) return;
      fetchProfile(session.user.id).then((p) => {
        if (p) setProfile({ ...fallback, ...p });
      });
    });
  }, []);

  return (
    <PageShell
      title="Profile"
      subtitle="Your identity and focus. Backend will sync later."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs text-zinc-500">Name</p>
          <p className="text-sm font-medium mt-1">{profile.name}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500">Username</p>
          <p className="text-sm font-medium mt-1">@{profile.username}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500">Role</p>
          <p className="text-sm font-medium mt-1">{profile.role}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500">Games</p>
          <p className="text-sm font-medium mt-1">{profile.game || "—"}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500">Gender</p>
          <p className="text-sm font-medium mt-1">{profile.gender || "—"}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500">Age</p>
          <p className="text-sm font-medium mt-1">{profile.age || "—"}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500">Skills</p>
          <p className="text-sm font-medium mt-1">{profile.skills || "—"}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500">Years Gaming</p>
          <p className="text-sm font-medium mt-1">
            {profile.gaming_years || "—"}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500">Play Style</p>
          <p className="text-sm font-medium mt-1">
            {profile.play_style || "—"}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500">Favorite Genres</p>
          <p className="text-sm font-medium mt-1">
            {profile.favorite_genres || "—"}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500">Platforms</p>
          <p className="text-sm font-medium mt-1">
            {profile.platforms || "—"}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500">Hobby</p>
          <p className="text-sm font-medium mt-1">{profile.hobby || "—"}</p>
        </Card>

        <Card className="p-4 md:col-span-2">
          <p className="text-xs text-zinc-500">Bio</p>
          <p className="text-sm text-zinc-300 mt-1">{profile.bio}</p>
        </Card>

      </div>
    </PageShell>
  );
}
