/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Star, Copy, Settings, ChevronRight, Terminal, History, Info, FlaskConical, Zap, Dice5, BookOpen, GraduationCap, Bell, MessageSquare, Send, X, ArrowLeft, AlertTriangle, Trophy, Book, Shield, ScrollText, Map, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from './services/storageService';
import CommandDetail from './components/CommandDetail';
import CommandBuilder from './components/CommandBuilder';
import UserCommandEditor from './components/UserCommandEditor';
import CommandWiki from './components/Wiki';
import Leaderboard from './components/Leaderboard';
import Onboarding from './components/Onboarding';
import DocumentViewer, { DocType } from './components/DocumentViewer';

import AppLogo from './components/AppLogo';
import Clock from './components/Clock';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Command {
  id: string;
  title: string;
  syntax: string;
  description: string;
  category: string;
  tags: string[];
  [key: string]: any;
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userCommands, setUserCommands] = useState<Command[]>([]);
  const [navTab, setNavTab] = useState<'home' | 'wiki' | 'lab' | 'favs' | 'settings' | 'leaderboard'>('home');
  const [dailyCommand, setDailyCommand] = useState<Command | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [renderLimit, setRenderCapping] = useState(15);
  const [showNotification, setShowNotification] = useState(false);
  const [updateNotice, setUpdateNotice] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });
  const [issueMessage, setIssueMessage] = useState('');
  const [issueStatus, setIssueStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [activeSetting, setActiveSetting] = useState<'menu' | 'suggest' | 'issue' | 'appearance' | 'terms' | 'privacy' | 'about'>('menu');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null);
  const [wikiTopicId, setWikiTopicId] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const APP_VERSION = '2.1.2';

  useEffect(() => {
    // Check onboarding
    const seenOnboarding = localStorage.getItem('has_seen_onboarding_v2');
    if (!seenOnboarding) {
      setShowOnboarding(true);
    }

    // Show launch notification
    const hasSeenLaunch = sessionStorage.getItem('hasSeenLaunchNotice_v2');
    if (!hasSeenLaunch) {
      setTimeout(() => setShowNotification(true), 1000);
    }

    // Auto-Updater Check
    const lastVersion = localStorage.getItem('app_version');
    if (lastVersion && lastVersion !== APP_VERSION) {
      setUpdateNotice({
        show: true,
        msg: `System recalibrated to v${APP_VERSION}. Optimized performance and new logic nodes active.`
      });
    }
    localStorage.setItem('app_version', APP_VERSION);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('has_seen_onboarding_v2', 'true');
    setShowOnboarding(false);
  };

  const closeNotification = () => {
    setShowNotification(false);
    sessionStorage.setItem('hasSeenLaunchNotice', 'true');
  };

  useEffect(() => {
    const fetchData = async () => {
      const timeoutId = setTimeout(() => {
        setIsInitialLoading(false);
      }, 5000); // Fail-safe timeout

      try {
        const [catRes, cmdRes] = await Promise.all([
          fetch('/data/indexes/categories_index.json'),
          fetch('/data/indexes/commands_index.json')
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories);
        }

        if (cmdRes.ok) {
          const cmdData = await cmdRes.json();
          setCommands(cmdData.commands);
          
          if (cmdData.commands.length > 0) {
            const dayIdx = new Date().getDate() % cmdData.commands.length;
            setDailyCommand(cmdData.commands[dayIdx]);
          }
        }
        
        setFavorites(storageService.getFavorites());
        setUserCommands(storageService.getUserCommands());
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        clearTimeout(timeoutId);
        setIsInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRandomChaos = () => {
    const chaosCmds = commands.filter(c => c.category === 'fun' || c.category === 'chaos');
    const pool = chaosCmds.length > 0 ? chaosCmds : commands;
    const randomIdx = Math.floor(Math.random() * pool.length);
    openCommandDetail(pool[randomIdx].id);
  };

  useEffect(() => {
    setRenderCapping(15);
  }, [searchQuery, selectedCategory, navTab]);

  const filteredCommands = useMemo(() => {
    let list = [...commands, ...userCommands];
    
    if (navTab === 'favs') {
      list = list.filter(cmd => favorites.includes(cmd.id) || cmd.id.startsWith('user-'));
    }

    if (isInitialLoading && list.length === 0) return [];
    
    const query = searchQuery.toLowerCase().trim();
    if (!query && !selectedCategory) return list;

    return list.filter(cmd => {
      const matchesSearch = query ? (
        cmd.title.toLowerCase().includes(query) || 
        cmd.syntax.toLowerCase().includes(query) ||
        (cmd.tags && cmd.tags.some(tag => tag.toLowerCase().includes(query)))
      ) : true;
      const matchesCategory = selectedCategory ? cmd.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [commands, userCommands, searchQuery, selectedCategory, navTab, favorites, isInitialLoading]);

  const handleToggleFavorite = useCallback((id: string) => {
    if (id.startsWith('user-')) {
       storageService.deleteUserCommand(id);
       setUserCommands(storageService.getUserCommands());
    } else {
       storageService.toggleFavorite(id);
       setFavorites(storageService.getFavorites());
    }
  }, []);

  const handleDownload = useCallback(() => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setUpdateNotice({ show: true, msg: "Data modules recalibrated. Local node cache at 100% capacity." });
    }, 1500);
  }, []);

  const handleUserCmdUpdate = useCallback(() => {
    setUserCommands(storageService.getUserCommands());
  }, []);

  const handleCopy = useCallback((syntax: string) => {
    try {
      navigator.clipboard.writeText(syntax);
    } catch (err) {
      console.error('Copy failed', err);
    }
  }, []);

  const handleSendIssue = useCallback(() => {
    if (!issueMessage.trim()) return;
    setIssueStatus('sending');
    setTimeout(() => {
      setIssueStatus('sent');
      setIssueMessage('');
      setTimeout(() => setIssueStatus('idle'), 3000);
    }, 1500);
  }, [issueMessage]);

  const openCommandDetail = useCallback(async (id: string) => {
    const userCmd = userCommands.find(c => id === c.id);
    if (userCmd) {
      setSelectedCommand(userCmd);
      return;
    }

    const cmd = commands.find(c => id === c.id);
    if (!cmd) return;

    try {
      setIsDetailLoading(true);
      const res = await fetch(`/data/commands/${cmd.category}.json`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      const fullCmd = data.commands.find((c: any) => c.id === id);
      setSelectedCommand(fullCmd || cmd);
      storageService.addToHistory(id);
    } catch (e) {
      console.warn("Failed to load extended data, using index fallback.", e);
      setSelectedCommand(cmd);
    } finally {
      setIsDetailLoading(false);
    }
  }, [commands, userCommands]);

  const getCategoryIcon = (id: string) => {
    switch(id) {
      case 'basics': return <Terminal size={20} />;
      case 'world': return <Map size={20} />;
      case 'entity': return <Target size={20} />;
      case 'execute': return <Zap size={20} />;
      case 'logic': return <Shield size={20} />;
      case 'automation': return <Settings size={20} />;
      case 'environment': return <FlaskConical size={20} />;
      case 'display': return <MessageSquare size={20} />;
      case 'visuals': return <BookOpen size={20} />;
      case 'server': return <Shield size={20} />;
      case 'survival': return <ScrollText size={20} />;
      case 'fun': return <Dice5 size={20} />;
      default: return <Terminal size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text-primary font-sans relative overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#00e5ff11,transparent)]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-4 md:pt-8 pb-32">
        <AnimatePresence mode="wait">
          {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
          {updateNotice.show && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-x-4 top-24 z-[90] glass-card p-5 border-cyber-purple bg-cyber-bg shadow-2xl"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyber-purple/20 flex items-center justify-center text-cyber-purple shrink-0">
                <Zap size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-cyber-purple text-xs uppercase tracking-widest">Update_Available</h4>
                <p className="text-[11px] text-cyber-text-secondary mt-1">{updateNotice.msg}</p>
                <div className="flex gap-2 mt-3">
                   <button 
                    onClick={() => setUpdateNotice({ ...updateNotice, show: false })}
                    className="px-4 py-1.5 bg-cyber-purple text-white text-[10px] font-bold rounded-lg uppercase"
                   >
                     Acknowledge
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-6 left-4 right-4 z-[100] glass-card p-4 border-cyber-cyan shadow-[0_0_30px_rgba(0,229,255,0.2)] bg-cyber-bg/95 backdrop-blur-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-cyber-cyan/20 flex items-center justify-center text-cyber-cyan shrink-0 animate-pulse">
                <Bell size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-cyber-cyan flex items-center gap-2">
                  SYSTEM_LAUNCH_INTEL
                </h4>
                <p className="text-xs text-cyber-text-secondary mt-1 leading-relaxed">
                  Commands For Minecraft PE has officially launched! 🚀 If you encounter bugs, glitches, or inaccurate nodes, please report them via the <b>App Issue</b> portal in System Settings.
                </p>
              </div>
              <button 
                onClick={closeNotification}
                className="text-cyber-text-secondary hover:text-white transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCommand && (
          <CommandDetail 
            command={selectedCommand}
            isFavorite={favorites.includes(selectedCommand.id) || selectedCommand.id.startsWith('user-')}
            onClose={() => setSelectedCommand(null)}
            onToggleFavorite={() => handleToggleFavorite(selectedCommand.id)}
            onCopy={() => handleCopy(selectedCommand.syntax)}
            onViewWiki={(id) => {
              setWikiTopicId(id);
              setNavTab('wiki');
              setSelectedCommand(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-4">
        {/* Simple Simple Players trigger */}
        <div className="flex justify-between items-center mb-6">
          <Clock />
          <button 
           onClick={() => setNavTab('leaderboard')}
           className="text-[9px] font-mono font-bold text-cyber-purple border border-cyber-purple/20 bg-cyber-purple/5 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyber-purple/10 active:scale-95 transition-all uppercase group"
          >
             <Trophy size={14} className="group-hover:scale-110 transition-transform text-cyber-purple" /> <span className="opacity-70 tracking-widest">RANK_DATA</span>
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold neon-text-cyan tracking-tight uppercase leading-none">
              {navTab === 'home' ? 'COMMANDS FOR MC' : navTab === 'wiki' ? 'ACADEMY' : navTab === 'favs' ? 'ARCHIVE' : navTab === 'lab' ? 'THE LAB' : navTab === 'leaderboard' ? 'BOARD' : selectedDoc ? 'DOCS' : 'SYSTEM'} <span className="text-cyber-purple">PE</span>
            </h1>
            <p className="text-cyber-text-secondary text-[9px] font-mono tracking-[0.2em] uppercase truncate max-w-[220px] opacity-70">
              {selectedDoc ? `VIEWING_${selectedDoc.toUpperCase()}` : navTab === 'home' ? 'ULTIMATE BEDROCK REFERENCE' : navTab === 'wiki' ? 'OPERATIONAL LOGIC TRAINING' : navTab === 'favs' ? 'YOUR LOCAL ARCHIVE' : navTab === 'lab' ? 'EXPERIMENTAL COMMAND GENERATOR' : navTab === 'leaderboard' ? 'CONTRIBUTOR_METRICS' : 'CONFIGURATION & INFO'}
              </p>
          </div>
          <div className="pb-1 shrink-0">
             <AppLogo 
               type={navTab === 'home' ? 'terminal' : navTab === 'wiki' ? 'wiki' : navTab === 'lab' ? 'lab' : navTab === 'leaderboard' ? 'leaderboard' : 'terminal'} 
               className="w-16 h-16 drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" 
               glowColor={navTab === 'wiki' ? 'rgba(168, 85, 247, 0.4)' : navTab === 'leaderboard' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(0, 229, 255, 0.4)'}
             />
          </div>
        </div>

        {/* Search Bar (Only on Home/Favs) */}
        {navTab !== 'settings' && navTab !== 'lab' && navTab !== 'wiki' && navTab !== 'leaderboard' && (
          <div className="relative group mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-cyber-text-secondary group-focus-within:text-cyber-cyan transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder={`Search ${navTab === 'favs' ? 'archive' : 'commands'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-cyber-glass border border-cyber-glass-border rounded-2xl focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all text-cyber-text-primary placeholder:text-cyber-text-secondary shadow-lg backdrop-blur-lg"
              />
            </div>
            
            {/* Status bar */}
            <div className="flex justify-between items-center px-4 py-2 bg-cyber-cyan/5 rounded-xl border border-cyber-cyan/10">
               <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-cyber-cyan">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
                  OFFLINE_PROTOCOL: ACTIVE
               </div>
               <button 
                  onClick={handleDownload}
                  className="text-[9px] font-mono font-bold text-cyber-text-secondary hover:text-cyber-cyan transition-colors flex items-center gap-1 uppercase"
                >
                  {isDownloading ? 'Downloading...' : 'Update Module'}
               </button>
            </div>
          </div>
        )}
      </header>

      {/* Content Switcher */}
      {selectedDoc ? (
        <DocumentViewer type={selectedDoc} onBack={() => setSelectedDoc(null)} />
      ) : navTab === 'settings' ? (
        <section className="space-y-6 pb-20">
          {activeSetting === 'menu' ? (
            <div className="grid gap-4">
              <button 
                onClick={() => setActiveSetting('suggest')}
                className="glass-card p-5 flex items-center justify-between group hover:border-cyber-cyan transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan">
                    <FlaskConical size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">Suggest Command</h3>
                    <p className="text-[10px] text-cyber-text-secondary font-mono">DATABASE_EXPANSION</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-cyber-text-secondary group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => setActiveSetting('issue')}
                className="glass-card p-5 flex items-center justify-between group hover:border-cyber-purple transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyber-purple/10 flex items-center justify-center text-cyber-purple">
                    <MessageSquare size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">App Issue & Report</h3>
                    <p className="text-[10px] text-cyber-text-secondary font-mono">GLITCH_CORRECTION</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-cyber-text-secondary group-hover:translate-x-1 transition-all" />
              </button>

              {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="glass-card p-5 flex items-center justify-between group border-cyber-cyan bg-cyber-cyan/5 transition-all animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-cyber-cyan/20 flex items-center justify-center text-cyber-cyan">
                      <GraduationCap size={20} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-sm text-cyber-cyan">Install App</h3>
                      <p className="text-[10px] text-cyber-cyan/70 font-mono">ADD_TO_HOME_SCREEN</p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-cyber-cyan text-black text-[8px] font-bold rounded uppercase">System Ready</div>
                </button>
              )}

              <button 
                onClick={() => setActiveSetting('appearance')}
                className="glass-card p-5 flex items-center justify-between group hover:border-cyber-cyan transition-all opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan">
                    <Zap size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">Appearance</h3>
                    <p className="text-[10px] text-cyber-text-secondary font-mono">UI_PERSONALIZATION</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-cyber-text-secondary" />
              </button>

              <button 
                onClick={() => setSelectedDoc('guide')}
                className="glass-card p-5 flex items-center justify-between group hover:border-cyber-cyan transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan">
                    <Book size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">Architect Guide</h3>
                    <p className="text-[10px] text-cyber-text-secondary font-mono">SYSTEM_DOCUMENTATION</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-cyber-text-secondary group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => setSelectedDoc('terms')}
                className="glass-card p-5 flex items-center justify-between group hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                    <ScrollText size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">Terms & Service</h3>
                    <p className="text-[10px] text-cyber-text-secondary font-mono">LEGAL_PROTOCOLS</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-cyber-text-secondary group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => setSelectedDoc('privacy')}
                className="glass-card p-5 flex items-center justify-between group hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                    <Shield size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">Privacy & Policy</h3>
                    <p className="text-[10px] text-cyber-text-secondary font-mono">DATA_ENCRYPTION</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-cyber-text-secondary group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => setActiveSetting('about')}
                className="glass-card p-5 flex items-center justify-between group hover:border-cyber-cyan transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan">
                    <Terminal size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">About System</h3>
                    <p className="text-[10px] text-cyber-text-secondary font-mono">NODE_SPECIFICATIONS</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-cyber-text-secondary group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <button 
                onClick={() => setActiveSetting('menu')}
                className="flex items-center gap-2 text-cyber-text-secondary text-[10px] font-bold font-mono tracking-widest uppercase hover:text-white transition-colors"
              >
                <ArrowLeft size={14} /> Back to settings
              </button>

              {activeSetting === 'suggest' && (
                <div className="glass-card p-6 space-y-6 border-cyber-cyan/30">
                  <header>
                    <h2 className="text-2xl font-display font-bold text-cyber-cyan">Suggest Node</h2>
                    <p className="text-[10px] font-mono text-cyber-text-secondary uppercase">Database_Expansion_Request</p>
                  </header>
                  <div className="space-y-4">
                    <p className="text-sm text-cyber-text-secondary">Found a command we missed? Feed it to the engine to help other architects.</p>
                    <textarea 
                      placeholder="Enter syntax and short description..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-cyan/50 outline-none h-32 font-mono text-cyber-text-primary"
                    />
                    <button className="w-full h-12 bg-cyber-cyan text-cyber-bg font-bold rounded-xl text-xs uppercase tracking-widest">Transmit Suggestion</button>
                  </div>
                </div>
              )}

              {activeSetting === 'issue' && (
                <div className="glass-card p-6 space-y-6 border-cyber-purple/30">
                  <header>
                    <h2 className="text-2xl font-display font-bold text-cyber-purple">Issue Portal</h2>
                    <p className="text-[10px] font-mono text-cyber-text-secondary uppercase">Glitch_Correction_Request</p>
                  </header>
                  <div className="space-y-4">
                    <p className="text-sm text-cyber-text-secondary">Network sync error? Incorrect syntax? Report a glitch directly to the node central.</p>
                    <textarea 
                      value={issueMessage}
                      onChange={(e) => setIssueMessage(e.target.value)}
                      placeholder="Describe the bug or glitch here..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-purple/50 outline-none h-40 font-mono text-cyber-text-primary resize-none"
                    />
                    <button 
                      onClick={handleSendIssue}
                      disabled={issueStatus !== 'idle' || !issueMessage.trim()}
                      className="w-full h-12 bg-cyber-purple text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {issueStatus === 'sent' ? 'Transmission Success' : issueStatus === 'sending' ? 'Transmitting...' : <><Send size={14} /> Send Issue Report</>}
                    </button>
                  </div>
                </div>
              )}

              {activeSetting === 'appearance' && (
                <div className="glass-card p-8 border-dashed border-white/10 text-center space-y-4">
                  <Zap size={48} className="mx-auto text-cyber-cyan/20" />
                  <h3 className="font-display font-bold">Protocol Locked</h3>
                  <p className="text-xs text-cyber-text-secondary font-mono">Appearance personalization module currently under development. Default CYBER_DARK active.</p>
                </div>
              )}

              {activeSetting === 'about' && (
                <div className="space-y-4">
                  <div className="glass-card p-6 flex flex-col items-center text-center space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan mb-2">
                      <Terminal size={32} />
                    </div>
                    <h3 className="text-xl font-display font-bold">COMMANDS FOR MCPE v2.0.4</h3>
                    <p className="text-[10px] font-mono text-cyber-text-secondary">STATUS: OPERATIONAL_STABLE</p>
                  </div>
                  <div className="glass-card p-4 flex justify-between items-center text-[10px] font-mono text-cyber-text-secondary">
                     <span>DEVELOPMENT CORE</span>
                     <span className="text-white">NODE_ENGINE_V8</span>
                  </div>
                  <button onClick={handleDownload} className="w-full h-12 glass-card border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                    Sync Local Data Pack
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </section>
      ) : navTab === 'wiki' ? (
        <CommandWiki 
          onBack={() => { setNavTab('home'); setWikiTopicId(null); }} 
          initialTopicId={wikiTopicId}
        />
      ) : navTab === 'leaderboard' ? (
        <Leaderboard onBack={() => setNavTab('home')} />
      ) : navTab === 'lab' ? (
        <CommandBuilder />
      ) : (
        <>
          {/* Saved Tab Add Feature */}
          {navTab === 'favs' && !selectedCategory && !searchQuery && (
            <UserCommandEditor onSaved={handleUserCmdUpdate} />
          )}

          {/* Dashboard (Home Only) */}
          {navTab === 'home' && !selectedCategory && !searchQuery && (
            <div className="space-y-8">
              <section className="grid grid-cols-2 gap-3 mt-4">
                {/* Featured Wiki Card */}
                <motion.div 
                   whileTap={{ scale: 0.95 }}
                   onClick={() => setNavTab('wiki')}
                   className="col-span-2 glass-card p-6 border-cyber-purple/40 bg-cyber-purple/10 cursor-pointer group relative overflow-hidden mb-2 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-cyber-purple transition-all"
                >
                  <div className="flex items-center gap-3 mb-2 text-cyber-purple relative">
                     <GraduationCap size={20} className="group-hover:animate-bounce" />
                     <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Advanced Education</span>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white relative mb-1">COMMAND ACADEMY</h2>
                  <p className="text-xs text-cyber-text-secondary relative font-mono uppercase tracking-widest opacity-80 decoration-none">Operational Logic Database</p>
                </motion.div>

                {isInitialLoading ? (
                  <>
                    <div className="glass-card h-20 bg-white/5 animate-pulse" />
                    <div className="glass-card h-20 bg-white/5 animate-pulse" />
                  </>
                ) : (
                  <>
                    <motion.div 
                       whileTap={{ scale: 0.95 }}
                       onClick={() => dailyCommand && openCommandDetail(dailyCommand.id)}
                       className="glass-card p-4 border-cyber-purple/20 cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute -right-2 -top-2 text-cyber-purple/10 -rotate-12 group-hover:scale-110 transition-transform">
                        <Zap size={64} />
                      </div>
                      <div className="flex items-center gap-2 mb-1 text-cyber-purple relative">
                         <Zap size={14} className="group-hover:animate-pulse" />
                         <span className="text-[9px] font-bold uppercase tracking-wider">Daily Pick</span>
                      </div>
                      <p className="text-xs font-bold truncate relative">{dailyCommand?.title || 'Loading...'}</p>
                    </motion.div>
                    <motion.div 
                       whileTap={{ scale: 0.95 }}
                       onClick={handleRandomChaos}
                       className="glass-card p-4 border-cyber-cyan/20 cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute -right-2 -top-2 text-cyber-cyan/10 -rotate-12 group-hover:scale-110 transition-transform">
                        <Dice5 size={64} />
                      </div>
                      <div className="flex items-center gap-2 mb-1 text-cyber-cyan relative">
                         <Dice5 size={14} className="group-hover:rotate-45 transition-transform" />
                         <span className="text-[9px] font-bold uppercase tracking-wider">Random Chaos</span>
                      </div>
                      <p className="text-xs font-bold truncate relative">Roll the dice</p>
                    </motion.div>
                  </>
                )}
              </section>

              {/* Categories Grid (Boxes of Type) */}
              <section className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex items-center justify-between mb-1">
                   <h2 className="text-sm font-bold font-mono text-cyber-text-secondary uppercase tracking-[0.2em]">COMMAND CATEGORIES</h2>
                </div>
                {isInitialLoading && categories.length === 0 ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass-card min-h-[120px] bg-white/5 animate-pulse" />
                  ))
                ) : (
                  categories.map(cat => (
                    <motion.div 
                      key={cat.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="glass-card p-5 border-white/5 cursor-pointer hover:border-cyber-cyan/30 transition-all flex flex-col gap-3 group min-h-[120px] justify-between"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan group-hover:scale-110 transition-all shrink-0">
                         {getCategoryIcon(cat.id)}
                      </div>
                      <div>
                         <h3 className="font-display font-bold text-base group-hover:text-cyber-cyan transition-colors leading-tight line-clamp-1">{cat.name}</h3>
                         <p className="text-cyber-text-secondary text-[9px] font-mono uppercase mt-1 tracking-tighter opacity-60">View {commands.filter(c => c.category === cat.id).length || '...'} Nodes</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </section>
            </div>
          )}

          {(selectedCategory || searchQuery || navTab === 'favs') && (
            <>
              {/* Category Header Back Button */}
              {selectedCategory && !searchQuery && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="mb-6 text-cyber-cyan text-[10px] font-bold font-mono tracking-widest flex items-center gap-2 uppercase hover:opacity-80 pb-2 border-b border-cyber-cyan/10 w-full"
                >
                  <ChevronRight size={14} className="rotate-180" /> Back to modules
                </button>
              )}

              {/* Categories Chips (Compact version) */}
              <section className="mb-8 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-3">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`px-6 py-2 rounded-full border transition-all font-medium text-xs uppercase tracking-widest ${
                    selectedCategory === null 
                      ? 'bg-cyber-cyan text-cyber-bg border-cyber-cyan font-bold' 
                      : 'bg-cyber-glass text-cyber-text-secondary border-cyber-glass-border'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-6 py-2 rounded-full border transition-all font-medium text-xs uppercase tracking-widest ${
                      selectedCategory === cat.id 
                        ? 'bg-cyber-purple text-cyber-text-primary border-cyber-purple font-bold' 
                        : 'bg-cyber-glass text-cyber-text-secondary border-cyber-glass-border hover:border-cyber-text-secondary'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </section>

              {/* Results */}
              <main>
                {isInitialLoading && filteredCommands.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="relative">
                      <div className="w-12 h-12 border-2 border-cyber-cyan/20 border-t-cyber-cyan animate-spin rounded-full" />
                      <Terminal size={14} className="absolute inset-0 m-auto text-cyber-cyan animate-pulse" />
                    </div>
                    <div className="animate-pulse text-cyber-cyan font-mono text-[10px] tracking-[0.3em] uppercase">
                      Indexing_Subroutines...
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isDetailLoading && (
                      <div className="flex items-center justify-center py-4 bg-cyber-cyan/5 border border-dashed border-cyber-cyan/20 rounded-2xl animate-pulse">
                         <span className="text-[10px] font-mono text-cyber-cyan tracking-[0.2em]">DECRYPTING_NODE_DATA...</span>
                      </div>
                    )}
                    <AnimatePresence mode='popLayout'>
                      {filteredCommands.length > 0 ? (
                        filteredCommands.slice(0, renderLimit).map((cmd, idx) => (
                          <motion.article 
                            key={cmd.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-card p-5 group hover:border-cyber-cyan/50 transition-all active:scale-[0.98] cursor-pointer"
                            onClick={() => openCommandDetail(cmd.id)}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="text-[9px] font-mono text-cyber-purple font-bold uppercase tracking-widest mb-1 block opacity-80">
                                  {cmd.category}
                                </span>
                                <h3 className="text-xl font-display font-bold leading-tight group-hover:text-cyber-cyan transition-colors">
                                  {cmd.title}
                                </h3>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(cmd.id); }}
                                className={`${favorites.includes(cmd.id) ? 'text-cyber-purple' : 'text-cyber-text-secondary'} hover:text-cyber-cyan transition-colors pt-1`}
                              >
                                <Star size={20} fill={favorites.includes(cmd.id) ? "currentColor" : "none"} />
                              </button>
                            </div>

                            <div className="bg-black/60 rounded-xl p-4 mb-4 font-mono text-xs text-cyber-cyan border border-white/5 flex items-center group-hover:border-cyber-cyan/20">
                              <Terminal size={14} className="mr-3 shrink-0 text-cyber-cyan opacity-40" />
                              <code className="truncate">{cmd.syntax}</code>
                            </div>

                            <div className="flex items-center text-cyber-text-secondary text-[10px] gap-6 font-mono uppercase font-bold tracking-tighter">
                              <div className="flex items-center gap-1.5 hover:text-cyber-cyan transition-colors" onClick={(e) => { e.stopPropagation(); handleCopy(cmd.syntax); }}>
                                 <Copy size={12} className="text-cyber-cyan" /> Copy Command
                              </div>
                              <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                                 {cmd.wikiLink ? (
                                   <>
                                     <BookOpen size={12} className="text-cyber-purple" /> Learn
                                   </>
                                 ) : (
                                   <>
                                     <Info size={12} className="text-cyber-cyan opacity-40" /> Detail
                                   </>
                                 )}
                              </div>
                            </div>
                          </motion.article>
                        ))
                      ) : (
                        <div className="text-center py-24 glass-card border-dashed border-white/5">
                           {navTab === 'favs' ? (
                             <>
                               <Star size={40} className="mx-auto text-cyber-purple/20 mb-4" />
                               <h3 className="font-bold text-white uppercase text-xs tracking-widest">Archive Empty</h3>
                               <p className="text-[10px] text-cyber-text-secondary mt-2 font-mono">NO_SAVED_PROTOCOLS_FOUND</p>
                             </>
                           ) : (
                             <>
                               <AlertTriangle size={40} className="mx-auto text-cyber-purple/20 mb-4" />
                               <h3 className="font-bold text-white uppercase text-xs tracking-widest">No Matches</h3>
                               <p className="text-[10px] text-cyber-text-secondary mt-2 font-mono">STATUS_ERROR: NO_MATCHES_FOUND</p>
                             </>
                           )}
                        </div>
                      )}
                    </AnimatePresence>

                    {filteredCommands.length > renderLimit && (
                      <button 
                        onClick={() => setRenderCapping(prev => prev + 20)}
                        className="w-full h-14 glass-card border-dashed border-cyber-cyan/20 text-cyber-cyan text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-cyber-cyan/5 transition-all mt-4 mb-10 flex items-center justify-center gap-2"
                      >
                         Load_Additional_Data_Pack...
                      </button>
                    )}
                  </div>
                )}
              </main>
            </>
          )}
        </>
      )}

      {/* Navigation Bar */}
      <div className="h-24" /> {/* Spacer for footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-cyber-bg/90 backdrop-blur-xl border-t border-cyber-glass-border px-3 flex justify-around items-center z-40 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => setNavTab('home')}
          className={`${navTab === 'home' ? 'text-cyber-cyan' : 'text-cyber-text-secondary'} flex flex-col items-center justify-center gap-1 transition-all active:scale-75 w-14`}
        >
          <div className="relative">
            <Terminal size={20} className={navTab === 'home' ? 'neon-text-cyan' : ''} />
            {navTab === 'home' && <motion.div layoutId="nav-glow" className="absolute -inset-2 bg-cyber-cyan/10 blur-xl rounded-full" />}
          </div>
          <span className="text-[8px] font-bold uppercase tracking-widest leading-none">HUB</span>
        </button>

        <button 
          onClick={() => setNavTab('wiki')}
          className={`${navTab === 'wiki' ? 'text-cyber-purple' : 'text-cyber-text-secondary'} flex flex-col items-center justify-center gap-1 transition-all active:scale-75 w-14`}
        >
          <div className="relative">
            <BookOpen size={20} className={navTab === 'wiki' ? 'neon-text-purple' : ''} />
            {navTab === 'wiki' && <motion.div layoutId="nav-glow" className="absolute -inset-2 bg-cyber-purple/10 blur-xl rounded-full" />}
          </div>
          <span className="text-[8px] font-bold uppercase tracking-widest leading-none">WIKI</span>
        </button>

        <button 
          onClick={() => setNavTab('lab')}
          className={`${navTab === 'lab' ? 'text-cyber-cyan' : 'text-cyber-text-secondary'} flex flex-col items-center justify-center gap-1 transition-all active:scale-75 w-14`}
        >
          <div className="relative">
            <FlaskConical size={20} className={navTab === 'lab' ? 'neon-text-cyan' : ''} />
            {navTab === 'lab' && <motion.div layoutId="nav-glow" className="absolute -inset-2 bg-cyber-cyan/10 blur-xl rounded-full" />}
          </div>
          <span className="text-[8px] font-bold uppercase tracking-widest leading-none">LAB</span>
        </button>

        <button 
          onClick={() => setNavTab('favs')}
          className={`${navTab === 'favs' ? 'text-cyber-purple' : 'text-cyber-text-secondary'} flex flex-col items-center justify-center gap-1 transition-all active:scale-75 w-14`}
        >
          <div className="relative">
            <Star size={20} fill={navTab === 'favs' ? "currentColor" : "none"} className={navTab === 'favs' ? 'neon-text-purple' : ''} />
            {navTab === 'favs' && <motion.div layoutId="nav-glow" className="absolute -inset-2 bg-cyber-purple/10 blur-xl rounded-full" />}
          </div>
          <span className="text-[8px] font-bold uppercase tracking-widest leading-none">VAULT</span>
        </button>

        <button 
           onClick={() => setNavTab('settings')}
           className={`${navTab === 'settings' ? 'text-white' : 'text-cyber-text-secondary'} flex flex-col items-center justify-center gap-1 transition-all active:scale-75 w-14`}
        >
          <div className="relative">
            <Settings size={20} />
            {navTab === 'settings' && <motion.div layoutId="nav-glow" className="absolute -inset-2 bg-white/5 blur-xl rounded-full" />}
          </div>
          <span className="text-[8px] font-bold uppercase tracking-widest leading-none">SYS</span>
        </button>
      </footer>
    </div>
  </div>
  );
}

// Removed duplicate components

