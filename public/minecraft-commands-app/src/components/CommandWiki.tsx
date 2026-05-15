/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ChevronRight, GraduationCap, ArrowLeft, Target, Layers } from 'lucide-react';
import { WIKI_DATA, WikiArticle } from '../data/wikiData';

export default function CommandWiki() {
  const [activeArticle, setActiveArticle] = useState<WikiArticle | null>(null);

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {!activeArticle ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-6 bg-cyber-purple/5 p-4 rounded-2xl border border-cyber-purple/20">
              <div className="w-12 h-12 rounded-xl bg-cyber-purple/20 flex items-center justify-center text-cyber-purple shrink-0">
                <GraduationCap size={28} />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">The Academy</h2>
                <p className="text-[10px] text-cyber-text-secondary uppercase font-mono tracking-widest leading-tight">Subject: Operation_Logic_Training</p>
              </div>
            </div>

            <div className="grid gap-3">
              {WIKI_DATA.map((art) => (
                <motion.button
                  key={art.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveArticle(art)}
                  className="glass-card p-5 flex items-center gap-4 text-left group hover:border-cyber-purple/50 transition-all border-white/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyber-glass flex items-center justify-center text-cyber-purple group-hover:scale-110 transition-transform shrink-0">
                    {art.id === 'selectors' ? <Target size={20} /> : <Layers size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base group-hover:text-cyber-purple transition-colors truncate">{art.title}</h3>
                    <p className="text-[10px] text-cyber-text-secondary font-mono tracking-tighter uppercase mt-0.5 opacity-60">Module: {art.category}</p>
                  </div>
                  <ChevronRight size={18} className="text-cyber-text-secondary opacity-30 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="article"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setActiveArticle(null)}
              className="flex items-center gap-2 text-cyber-purple text-[10px] font-bold font-mono tracking-[0.2em] uppercase hover:opacity-80 transition-opacity"
            >
              <ArrowLeft size={14} /> Return to Modules
            </button>

            <header className="space-y-1 pt-2">
               <span className="text-cyber-purple font-mono text-[9px] font-bold tracking-[0.3em] uppercase">{activeArticle.category}</span>
               <h2 className="text-3xl font-display font-bold neon-text-purple tracking-tight">{activeArticle.title}</h2>
            </header>

            <div className="glass-card p-6 bg-cyber-bg/40">
              <p className="text-cyber-text-secondary text-sm leading-relaxed mb-6 italic border-l-2 border-cyber-purple/30 pl-4">
                {activeArticle.content}
              </p>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold font-mono text-cyber-purple tracking-[0.2em] uppercase">Core Decryption Points:</h4>
                <div className="grid gap-3">
                  {activeArticle.points.map((point, idx) => (
                    <div key={idx} className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1">
                       <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyber-purple mt-1.5 shrink-0" />
                          <p className="text-sm text-cyber-text-primary leading-snug">{point}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-cyber-purple/5 border border-cyber-purple/20 p-4 rounded-xl flex items-center gap-3">
               <BookOpen size={16} className="text-cyber-purple" />
               <p className="text-[10px] text-cyber-purple font-mono font-bold uppercase tracking-widest">Training Module Completed</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
