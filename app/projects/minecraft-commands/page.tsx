"use client";

import { ArrowLeft, Download, ExternalLink, Package, Zap, Smartphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MinecraftCommandsPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </Link>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-4">
            React + Vite PWA
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Minecraft Commands PE
          </h1>
          <p className="text-xl text-zinc-400 mb-6">
            Ultimate Bedrock Command Reference and utility app for Minecraft players. Access commands, syntax, and examples instantly on any device.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="text-zinc-500 text-sm mb-1">Tech Stack</div>
              <div className="text-white font-semibold">React + Vite</div>
            </div>
            <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="text-zinc-500 text-sm mb-1">Release Year</div>
              <div className="text-white font-semibold">2026</div>
            </div>
            <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="text-zinc-500 text-sm mb-1">Type</div>
              <div className="text-white font-semibold">PWA</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 flex gap-3">
              <Zap className="text-emerald-400 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-white mb-1">Fast & Responsive</h3>
                <p className="text-zinc-400 text-sm">Built with Vite for instant load times and smooth interactions.</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 flex gap-3">
              <Package className="text-emerald-400 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-white mb-1">PWA Ready</h3>
                <p className="text-zinc-400 text-sm">Install on any device and use offline. Perfect for mobile players.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Warning */}
        {isMobile && (
          <div className="mb-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex gap-3 items-start">
            <Smartphone className="text-amber-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-amber-300 mb-1">Mobile Device Detected</h3>
              <p className="text-amber-200/80 text-sm">
                The embedded preview is optimized for desktop. For the best experience on mobile, download the app or use the standalone version.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Get Started</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            {!isMobile ? (
              <Link
                href="/projects/minecraft-commands/view"
                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={20} />
                Open App
              </Link>
            ) : (
              <button
                disabled
                className="flex-1 px-6 py-3 bg-emerald-600/50 text-white font-semibold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
                title="Preview disabled on mobile for better performance"
              >
                <ExternalLink size={20} />
                Preview (Desktop Only)
              </button>
            )}
            <button
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/minecraft-commands-app.apk';
                link.download = 'minecraft-commands-pe.apk';
                link.click();
              }}
              title="Download the APK for Android devices"
            >
              <Download size={20} />
              Download APK
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">About</h2>
          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-300 space-y-4">
            <p>
              Minecraft Commands PE is a comprehensive reference tool for Bedrock Edition players. It provides quick access to commands, syntax documentation, and practical examples to enhance your gameplay and building experience.
            </p>
            <p>
              Built with modern web technologies, this app works seamlessly on desktop, tablet, and mobile devices. Add it to your home screen to use it like a native app!
            </p>
            <div className="mt-6 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700">
              <h3 className="font-semibold text-white mb-2">How to Install as PWA:</h3>
              <ol className="list-decimal list-inside text-sm space-y-2 text-zinc-400">
                <li>Open the app in your browser</li>
                <li>Click the share/menu button on your device</li>
                <li>Select "Add to Home Screen" or "Install App"</li>
                <li>Enjoy offline access!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Tech Details */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Tech Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "React 19",
              "Vite 6",
              "TypeScript",
              "Tailwind CSS",
              "Express",
              "Lucide Icons",
              "Motion UI",
              "Responsive Design",
            ].map((tech) => (
              <div
                key={tech}
                className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-center text-zinc-300 text-sm"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
