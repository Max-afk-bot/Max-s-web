/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Send, User, Terminal, MessageSquare, ArrowLeft, Zap, Sparkles } from 'lucide-react';

interface LeaderboardProps {
  onBack: () => void;
}

const SUPER_PLAYERS = [
  { name: 'CyberArchitect_99', commands: 42, rank: 'CORE_ENGINEER', color: 'text-cyber-cyan' },
  { name: 'RedstoneVoid', commands: 38, rank: 'LOGIC_MASTER', color: 'text-cyber-purple' },
  { name: 'BlockBreakerX', commands: 31, rank: 'SYSTEM_ADMIN', color: 'text-white' },
  { name: 'VoidWalker', commands: 27, rank: 'NODE_ALPHA', color: 'text-cyber-cyan/80' },
  { name: 'PixelGhost', commands: 15, rank: 'SCOUT_LEVEL', color: 'text-cyber-text-secondary' },
];

const Leaderboard = React.memo(({ onBack }: LeaderboardProps) => {
  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
            <Trophy size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight">Super <span className="text-yellow-500">Players</span></h2>
            <p className="text-[10px] font-mono text-cyber-text-secondary uppercase">Ranking_System_v4</p>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="mb-2">
           <h3 className="text-[10px] font-mono font-bold text-cyber-text-secondary uppercase tracking-[0.2em]">Live Ranking Cluster</h3>
        </div>
        
        {SUPER_PLAYERS.map((player, i) => (
          <motion.div 
            key={player.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 flex items-center justify-between border-white/5 hover:border-cyber-cyan/30 transition-all group"
          >
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-display font-bold text-lg ${i === 0 ? 'text-yellow-500 border-yellow-500/30' : i === 1 ? 'text-slate-300 border-slate-300/30' : i === 2 ? 'text-amber-600 border-amber-600/30' : 'text-cyber-text-secondary'}`}>
                 {i + 1}
               </div>
               <div>
                  <h4 className={`font-bold text-sm ${player.color}`}>{player.name}</h4>
                  <p className="text-[8px] font-mono text-cyber-text-secondary uppercase tracking-widest">{player.rank}</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-mono font-bold text-cyber-cyan">{player.commands} NODES</p>
               <div className="flex gap-1 justify-end mt-1">
                  {[...Array(5 - i)].map((_, s) => (
                    <Sparkles key={s} size={8} className="text-yellow-500/40" />
                  ))}
               </div>
            </div>
          </motion.div>
        ))}
      </section>

      <button 
        onClick={onBack}
        className="w-full h-14 glass-card border-dashed border-white/10 flex items-center justify-center gap-2 text-cyber-text-secondary font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
      >
        <ArrowLeft size={14} /> Return to Hub
      </button>

      <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-yellow-500 text-[9px] font-bold font-mono tracking-widest flex items-center gap-3 uppercase">
        <Star size={14} className="shrink-0" />
        NODE CONTRIBUTOR RECOGNITION SYSTEM: TOP ARCHITECTS EARN VERIFIED STATUS AND ACCESS TO EXPERIMENTAL PROTOCOLS.
      </div>
    </div>
  );
});

export default Leaderboard;
