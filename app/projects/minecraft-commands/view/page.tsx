"use client";

import { useState, useEffect } from "react";
import { Maximize2, Minimize2, ExternalLink, X } from "lucide-react";
import Link from "next/link";

export default function ViewerPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const elem = document.getElementById("app-iframe");
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch((err) => {
          alert("Could not enter fullscreen: " + err.message);
        });
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/projects/minecraft-commands"
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
            title="Back to project"
          >
            <X size={20} />
          </Link>
          <h1 className="text-white font-semibold truncate">
            Minecraft Commands PE
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <a
            href="/minecraft-commands-app/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </div>

      {/* App Container */}
      <div className="flex-1 overflow-hidden" id="app-iframe-container">
        <iframe
          id="app-iframe"
          src="/minecraft-commands-app/"
          className="w-full h-full border-0"
          title="Minecraft Commands PE App"
          allow="geolocation; microphone; camera; fullscreen"
        />
      </div>
    </div>
  );
}
