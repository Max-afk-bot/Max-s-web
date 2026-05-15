/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { FileText, Shield, GraduationCap, ArrowLeft, Book, ScrollText } from 'lucide-react';

export type DocType = 'terms' | 'privacy' | 'guide';

interface DocumentViewerProps {
  type: DocType;
  onBack: () => void;
}

const DOCS = {
  terms: {
    title: 'Terms of Service',
    icon: <ScrollText size={24} />,
    subtitle: 'Standard Operational Agreement',
    content: `
      1. ACCEPTANCE BY INITIALIZATION
      By accessing "Commands For Minecraft PE" (the "Interface"), you acknowledge and agree to be bound by these Terms of Service. If you do not agree, you must terminate your session and delete all local cache data.

      2. INTENDED USE
      The Interface is designed as a logic reference tool for Minecraft Bedrock Edition (PE). All command syntax and logic nodes provided are for educational and creative purposes within the game environment.

      3. NO WARRANTY
      The tools and nodes provided are experimental. Use of these commands within your world files is at your own risk. The developers are not liable for any corrupted world data, broken logic loops, or unexpected entity behavior resulting from terminal input.

      4. USER CONTRIBUTIONS
      By submitting "Unique Nodes" or feedback through the Lab or Leaderboard protocols, you grant us a non-exclusive, royalty-free right to use, modify, and display that logic for the improvement of the general user base.

      5. RESTRICTIONS
      Users may not attempt to reverse engineer the application binary or use automated bots to scrape the command database.
    `
  },
  privacy: {
    title: 'Privacy Policy',
    icon: <Shield size={24} />,
    subtitle: 'Device-Local Data Protocol',
    content: `
      1. ZERO-CLOUD ARCHITECTURE
      Our system is built on a Zero-Touch privacy model. We do not maintain external servers for your personal command archives. All "Favorites" and saved "Lab Nodes" are stored exclusively in your browser's Local Storage.

      2. DATA COLLECTION
      • Unique Nodes: Only nodes explicitly submitted by the user for ranking are transmitted to our review queue.
      • Feedback: Information sent via the Feedback Portal is used solely for bug tracking and system optimization.
      • Analytics: We do not track your location, browser history, or Minecraft account identity.

      3. THIRD-PARTY NODES
      The application does not link to external accounts like Xbox Live or Discord unless explicitly requested by future feature nodes.

      4. COOKIE USAGE
      We use persistent local cache (Local Storage) to remember your onboarding status and system theme preferences.
    `
  },
  guide: {
    title: 'Architect Guide',
    icon: <Book size={24} />,
    subtitle: 'Command Implementation Manual',
    content: `
      WELCOME ARCHITECT.
      This guide outlines the core functional requirements for Bedrock Command Logic.

      I. THE SYNTAX STRING
      Every command sequence must follow the path: /command <required> [optional]. 
      Note: Bedrock syntax is highly specific regarding spacing and character casing in NBT components.

      II. SELECTOR LOGIC
      • @a: All players in the dimension.
      • @e: All active entities. Use [type=...] to avoid lag when running high-frequency chains.
      • @s: The entity executing the script.

      III. COORDINATE SYSTEMS
      • Absolute: Exact world space relative to 0,0,0.
      • Relative (~): Based on the current execution point.
      • Local (^): Based on the direction the executor is facing.

      IV. TICKING AND TIMING
      Bedrock runs at 20 ticks per second. When building "Repeat" chains, ensure your logic account for the 0.05s delay to prevent server-side overflow.
    `
  }
};

const DocumentViewer = React.memo(({ type, onBack }: DocumentViewerProps) => {
  const doc = DOCS[type];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-24"
    >
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyber-purple/20 flex items-center justify-center text-cyber-purple">
            {doc.icon}
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{doc.title}</h2>
            <p className="text-[10px] font-mono text-cyber-text-secondary uppercase">{doc.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="glass-card p-6 bg-white/5 border-white/5 relative">
        <div className="absolute top-0 right-0 p-3 opacity-10">
           <FileText size={100} />
        </div>
        <div className="relative z-10">
           <pre className="whitespace-pre-line font-mono text-[11px] leading-relaxed text-cyber-text-primary opacity-80">
             {doc.content.trim()}
           </pre>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onBack}
          className="h-14 glass-card border-dashed border-white/10 flex items-center justify-center gap-2 text-cyber-text-secondary font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="h-14 glass-card flex items-center justify-center gap-2 text-cyber-cyan text-[10px] font-bold font-mono opacity-40 uppercase">
          Verified_Node
        </div>
      </div>

      <footer className="pt-8 text-center">
         <p className="text-[9px] font-mono text-cyber-text-secondary uppercase tracking-[0.2em]">Protocol_ID: {type.toUpperCase()}_v_2026</p>
      </footer>
    </motion.div>
  );
});

export default DocumentViewer;
