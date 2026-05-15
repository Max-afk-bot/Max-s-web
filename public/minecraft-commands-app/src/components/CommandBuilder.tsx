/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Copy, Terminal, FlaskConical, ChevronDown, Check } from 'lucide-react';
import { MOBS, EFFECTS, ITEMS, TARGETS } from '../constants';

type BuilderType = 'summon' | 'effect' | 'give';

const CommandBuilder = React.memo(() => {
  const [type, setType] = useState<BuilderType>('summon');
  const [target, setTarget] = useState('@p');
  const [asset, setSetAsset] = useState('zombie');
  const [amount, setAmount] = useState('1');
  const [copied, setCopied] = useState(false);

  const generatedCommand = useMemo(() => {
    switch (type) {
      case 'summon':
        return `/summon ${asset} ~ ~ ~`;
      case 'effect':
        return `/effect give ${target} ${asset} 30 1`;
      case 'give':
        return `/give ${target} ${asset} ${amount}`;
      default:
        return '';
    }
  }, [type, target, asset, amount]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const assetsList = type === 'summon' ? MOBS : type === 'effect' ? EFFECTS : ITEMS;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-cyber-cyan/20 flex items-center justify-center text-cyber-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <FlaskConical size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">THE <span className="text-cyber-cyan">LAB</span></h2>
          <p className="text-[10px] font-mono text-cyber-text-secondary uppercase tracking-[0.2em]">EXPERIMENTAL_LOGIC_ENGINE</p>
        </div>
      </div>
      
      <p className="text-cyber-text-secondary text-xs font-mono opacity-60 leading-relaxed mb-6">
        Input parameters to generate valid Minecraft protocol strings.
      </p>

      {/* Type Selector */}
      <div className="flex gap-2 mb-6">
        {(['summon', 'effect', 'give'] as BuilderType[]).map(t => (
          <button
            key={t}
            onClick={() => { setType(t); setSetAsset(t === 'summon' ? MOBS[0] : t === 'effect' ? EFFECTS[0] : ITEMS[0]); }}
            className={`flex-1 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest ${
              type === t ? 'bg-cyber-cyan text-cyber-bg border-cyber-cyan neon-border-cyan' : 'bg-cyber-glass border-cyber-glass-border text-cyber-text-secondary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="glass-card p-6 space-y-6">
        {/* Dynamic Fields */}
        {type !== 'summon' && (
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-cyber-purple font-bold tracking-widest uppercase">Target</label>
            <div className="relative">
              <select 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm appearance-none focus:border-cyber-cyan/50 outline-none transition-all"
              >
                {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-cyber-text-secondary pointer-events-none" size={16} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-cyber-purple font-bold tracking-widest uppercase">
            {type === 'summon' ? 'Mob Type' : type === 'effect' ? 'Effect' : 'Item'}
          </label>
          <div className="relative">
            <select 
              value={asset}
              onChange={(e) => setSetAsset(e.target.value)}
              className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm appearance-none focus:border-cyber-cyan/50 outline-none transition-all"
            >
              {assetsList.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-cyber-text-secondary pointer-events-none" size={16} />
          </div>
        </div>

        {type === 'give' && (
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-cyber-purple font-bold tracking-widest uppercase">Amount</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm focus:border-cyber-cyan/50 outline-none transition-all"
              min="1"
              max="64"
            />
          </div>
        )}

        {/* Output Box */}
        <div className="pt-4 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-cyber-cyan bg-cyber-cyan/5 p-4 rounded-xl border border-cyber-cyan/20">
            <Terminal size={18} className="shrink-0" />
            <code className="text-sm font-mono break-all">{generatedCommand}</code>
          </div>

          <button 
            onClick={handleCopy}
            className={`w-full h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
              copied ? 'bg-green-500 text-white' : 'bg-cyber-cyan text-cyber-bg hover:scale-[1.01] active:scale-95'
            }`}
          >
            {copied ? <><Check size={20} /> COPIED</> : <><Copy size={20} /> COPY GENERATED</>}
          </button>
        </div>
      </div>

      {/* Target Guide Footer */}
      <footer className="glass-card p-6 border-cyber-purple/20 bg-cyber-purple/5">
        <h4 className="text-[10px] font-mono text-cyber-purple font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
          <Terminal size={12} /> Target Selector Protocol
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-cyber-cyan font-mono text-xs font-bold">@p</span>
            <p className="text-[10px] text-cyber-text-secondary leading-tight uppercase font-mono">Nearest Player</p>
          </div>
          <div className="space-y-1">
            <span className="text-cyber-cyan font-mono text-xs font-bold">@a</span>
            <p className="text-[10px] text-cyber-text-secondary leading-tight uppercase font-mono">All Players</p>
          </div>
          <div className="space-y-1">
            <span className="text-cyber-cyan font-mono text-xs font-bold">@s</span>
            <p className="text-[10px] text-cyber-text-secondary leading-tight uppercase font-mono">Executor (Self)</p>
          </div>
          <div className="space-y-1">
            <span className="text-cyber-cyan font-mono text-xs font-bold">@r</span>
            <p className="text-[10px] text-cyber-text-secondary leading-tight uppercase font-mono">Random Player</p>
          </div>
          <div className="space-y-1">
            <span className="text-cyber-cyan font-mono text-xs font-bold">@e</span>
            <p className="text-[10px] text-cyber-text-secondary leading-tight uppercase font-mono">All Entities</p>
          </div>
        </div>
      </footer>
    </div>
  );
});

export default CommandBuilder;
