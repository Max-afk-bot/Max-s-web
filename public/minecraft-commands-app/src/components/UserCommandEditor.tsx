/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Save, Terminal, Type, AlignLeft } from 'lucide-react';
import { storageService } from '../services/storageService';

interface UserCommandEditorProps {
  onSaved: () => void;
}

const UserCommandEditor = memo(({ onSaved }: UserCommandEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', syntax: '', description: '' });

  const handleSave = () => {
    if (!formData.title || !formData.syntax) return;
    storageService.saveUserCommand(formData);
    setFormData({ title: '', syntax: '', description: '' });
    setIsOpen(false);
    onSaved();
  };

  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full h-14 glass-card border-cyber-cyan/30 flex items-center justify-center gap-2 text-cyber-cyan font-bold text-xs uppercase tracking-widest hover:bg-cyber-cyan/5 transition-all active:scale-95"
      >
        <Plus size={18} /> Protocol Initialization (Create)
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md p-6 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-xl font-display font-bold neon-text-cyan flex items-center gap-2">
                  <Terminal size={20} className="text-cyber-cyan" /> New Sequence
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-cyber-text-secondary hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-cyber-purple font-bold tracking-widest uppercase flex items-center gap-2">
                    <Type size={12} /> Cipher Name (Title)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. My Secret Base TP"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm focus:border-cyber-cyan transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-cyber-purple font-bold tracking-widest uppercase flex items-center gap-2">
                    <Terminal size={12} /> Syntax Hash
                  </label>
                  <input 
                    type="text" 
                    placeholder="/tp @s 100 64 100"
                    value={formData.syntax}
                    onChange={(e) => setFormData(prev => ({ ...prev, syntax: e.target.value }))}
                    className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm font-mono text-cyber-cyan focus:border-cyber-cyan transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-cyber-purple font-bold tracking-widest uppercase flex items-center gap-2">
                    <AlignLeft size={12} /> Logic Log (Description)
                  </label>
                  <textarea 
                    placeholder="Enter details..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-cyan transition-all outline-none h-24"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={!formData.title || !formData.syntax}
                className="w-full h-14 bg-cyber-cyan text-cyber-bg font-bold rounded-2xl flex items-center justify-center gap-2 neon-border-cyan disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
              >
                <Save size={20} /> COMMITTING TO LOCAL_CACHE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default UserCommandEditor;
