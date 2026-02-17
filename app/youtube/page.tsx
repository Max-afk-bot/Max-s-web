"use client";

import Image from "next/image";

export default function YoutubePage() {
  const channel = {
    name: "Max lifeYT",
    handle: "@Max_lifeYT",
    bannerUrl:
      "https://yt3.googleusercontent.com/i8svS5kNvejS93DHCmr_UhPVmQWRy_tzkkQbU30IZGTz4wyKY6aoha_Z7OmNU602QMts1JcmYQ=w1060-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
    avatarUrl:
      "https://yt3.googleusercontent.com/eb3yaFyiEHd5KQZcL2Y__4tteKJVSPDPKOI6WNSLbZNSIc3bxoRGk4Z3uIGrkpIoIKz_sExkow=s160-c-k-c0x00ffffff-no-rj",
    website: "deadweb.vercel.app",
    channelUrl: "https://youtube.com/@max_lifeyt?si=_yq83jCglUPXeFwi",
  };

  return (
    <div className="relative overflow-hidden animate-pageIn youtube-stage space-y-6">
      <div className="youtube-vortex" aria-hidden="true" />
      <div className="youtube-noise" aria-hidden="true" />
      <div className="page-veil" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-2 sm:px-6">
        <div className="youtube-banner h-36 sm:h-48">
          {channel.bannerUrl ? (
            <Image
              src={channel.bannerUrl}
              alt="YouTube channel banner"
              fill
              sizes="(max-width: 640px) 100vw, 960px"
              className="object-cover"
              priority
            />
          ) : null}
        </div>

        <div className="relative -mt-10 sm:-mt-12 px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden youtube-avatar">
              {channel.avatarUrl ? (
                <Image
                  src={channel.avatarUrl}
                  alt="Channel avatar"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-xl font-semibold text-zinc-200">
                  M
                </div>
              )}
            </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-semibold">
              {channel.name}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">{channel.handle}</p>
            <p className="text-xs text-zinc-500 mt-2">{channel.website}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={channel.channelUrl}
                target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-xs hover:bg-zinc-900/70 transition"
                >
                  Open channel
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs uppercase tracking-wide text-zinc-500">
          {["Home", "Shorts", "Clips", "About"].map((tab) => (
            <button
              key={tab}
              type="button"
              className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-900/70 transition"
              onClick={() => window.alert(`${tab} is pending development.`)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-300">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <p className="text-xs text-zinc-500">Main focus</p>
            <p className="text-sm mt-1">
              Competitive Minecraft (Bedrock) highlights, skill growth, and
              progress updates.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <p className="text-xs text-zinc-500">Style</p>
            <p className="text-sm mt-1">
              Aggressive, high‑pressure gameplay with clutch moments and PvP.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <p className="text-xs text-zinc-500">Uploads</p>
            <p className="text-sm mt-1">
              New clips and updates are added as I progress and train.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <p className="text-xs text-zinc-500">Goal</p>
            <p className="text-sm mt-1">
              Build a strong gaming archive and grow a focused community.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 text-sm text-zinc-300">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">
            What to expect
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>• Minecraft Bedrock PvP clips and skill highlights.</li>
            <li>• Progress updates as the training level improves.</li>
            <li>• Future uploads as the gaming intel page goes live.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
