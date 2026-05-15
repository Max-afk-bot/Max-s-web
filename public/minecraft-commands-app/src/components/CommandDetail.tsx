/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Share2, Star, Info, Terminal, Lightbulb, AlertTriangle, Hash, Play, BookOpen, Zap } from 'lucide-react';

interface CommandDetailProps {
  command: any;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onCopy: () => void;
  onViewWiki?: (wikiId: string) => void;
}

const CommandDetail = memo(({ command, isFavorite, onClose, onToggleFavorite, onCopy, onViewWiki }: CommandDetailProps) => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  if (!command) return null;

  const handleTest = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="glass-card w-full max-w-xl max-h-[85vh] overflow-y-auto no-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence>
          {showComingSoon && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] flex items-center justify-center bg-cyber-bg/80 backdrop-blur-md p-6 text-center"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-cyber-cyan/20 flex items-center justify-center text-cyber-cyan mx-auto animate-pulse">
                   <Play size={32} />
                </div>
                <h3 className="text-xl font-display font-bold text-cyber-cyan">SIMULATOR_PENDING</h3>
                <p className="text-sm text-cyber-text-secondary font-mono">Logic Packet Simulator requires additional data nodes. Coming in next scheduled transmission.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sticky top-0 bg-cyber-bg/60 backdrop-blur-lg p-6 flex justify-between items-center border-b border-white/5">
          <div>
            <h2 className="text-2xl font-display font-bold neon-text-cyan">{command.title}</h2>
            <span className="text-[10px] font-mono text-cyber-purple uppercase tracking-widest">{command.category}</span>
          </div>
          <button onClick={onClose} className="text-cyber-text-secondary hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Guide / Help */}
          <section className="bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-xl p-5">
             <div className="flex items-center gap-2 mb-3 text-cyber-cyan">
                <Terminal size={18} />
                <h3 className="font-bold text-xs uppercase tracking-[0.2em]">Protocol Analysis</h3>
             </div>
             <div className="space-y-3">
               {(command.breakdown || command.syntaxBreakdown) ? (
                 <div className="text-cyber-text-primary text-xs leading-relaxed font-mono whitespace-pre-line">
                   {command.breakdown || command.syntaxBreakdown}
                 </div>
               ) : (
                 <p className="text-cyber-text-primary text-xs leading-relaxed italic opacity-70 font-mono">
                   NO_BREAKDOWN_AVAILABLE: Ensure cheats are active and syntax is correct for Bedrock Edition.
                 </p>
               )}
             </div>
          </section>

          {/* Syntax Block */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-cyber-cyan font-mono group cursor-pointer" onClick={onCopy}>
              <Terminal size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wider">Source Code</h3>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-cyber-cyan text-cyber-bg px-2 py-0.5 rounded">TAP TO COPY</div>
            </div>
            <div className="bg-black/60 rounded-xl p-5 font-mono text-sm text-cyber-cyan border border-cyber-cyan/20 break-all relative overflow-hidden group">
              {command.syntax}
              <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/80 to-transparent pointer-events-none" />
            </div>
          </section>

          {/* Description */}
          <section className="space-y-4 font-mono">
            <div className="text-[9px] text-cyber-text-secondary border-b border-white/5 pb-2 uppercase tracking-widest font-bold">Operational_Objective</div>
            <p className="text-cyber-text-secondary text-sm leading-relaxed">
              {command.description || "Information missing. Contact sys admin."}
            </p>
          </section>

          {/* Usage Example */}
          {command.example && !command.examples && (
            <section>
              <div className="flex items-center gap-2 mb-3 text-cyber-purple">
                <Hash size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Example Instance</h3>
              </div>
              <div className="bg-cyber-purple/5 p-4 rounded-xl border border-cyber-purple/10 font-mono text-xs text-cyber-text-primary">
                {command.example}
              </div>
            </section>
          )}

          {/* Multiple Examples / Shortcuts */}
          {command.examples && command.examples.length > 0 && (
            <section className="space-y-3">
               <div className="flex items-center gap-2 mb-1 text-cyber-purple">
                <Zap size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Node Presets</h3>
              </div>
              <div className="grid gap-2">
                {command.examples.map((ex: any, i: number) => (
                  <button 
                    key={i}
                    onClick={() => { onCopy(); }} // it's already an onClick away but this adds more engagement
                    className="flex flex-col items-start glass-card p-3 border-cyber-purple/20 hover:border-cyber-purple/50 transition-all text-left group"
                  >
                    <span className="text-[8px] font-mono text-cyber-purple/60 uppercase mb-1">{ex.label}</span>
                    <div className="flex items-center justify-between w-full">
                       <code className="text-[10px] font-mono text-cyber-text-primary truncate">{ex.cmd}</code>
                       <Copy size={12} className="text-cyber-purple opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Tip / Tip List */}
          {(command.tip || command.tips) && (
            <section className="bg-cyber-purple/10 border border-cyber-purple/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-cyber-purple">
                <Lightbulb size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Strategic Tip</h3>
              </div>
              <p className="text-cyber-text-primary text-sm leading-relaxed italic">
                "{command.tip || (command.tips && command.tips[0])}"
              </p>
            </section>
          )}

          {/* Warning */}
          {command.warnings && command.warnings.length > 0 && (
            <section className="bg-cyber-danger/10 border border-cyber-danger/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-cyber-danger">
                <AlertTriangle size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Warning</h3>
              </div>
              <ul className="list-disc list-inside text-cyber-text-primary text-sm space-y-1">
                {command.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </section>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
             {command.wikiLink && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onViewWiki?.(command.wikiLink); }}
                 className="w-full h-12 glass-card border-cyber-purple/30 text-cyber-purple flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-cyber-purple/10 active:scale-95 transition-all mb-1"
               >
                 <BookOpen size={16} /> Learn in Academy
               </button>
             )}
            <div className="flex gap-3">
              <button 
                onClick={onCopy}
                className="flex-1 h-14 bg-cyber-cyan text-cyber-bg font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-cyber-cyan/10"
              >
                <Copy size={20} /> COPY
              </button>
              <button 
                onClick={handleTest}
                className="flex-1 h-14 bg-cyber-purple text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-cyber-purple/10"
              >
                <Play size={20} /> TEST COMMAND
              </button>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onToggleFavorite}
                className={`flex-1 h-14 rounded-2xl flex items-center justify-center transition-all border ${
                  isFavorite 
                    ? 'bg-cyber-purple/20 border-cyber-purple text-cyber-purple font-bold' 
                    : 'bg-cyber-glass border-cyber-glass-border text-cyber-text-secondary'
                }`}
              >
                <Star size={20} fill={isFavorite ? "currentColor" : "none"} className="mr-2" /> {isFavorite ? 'ARCHIVED' : 'SAVE TO VAULT'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default CommandDetail;
