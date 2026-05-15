/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Map, Target, Terminal, ChevronRight, Info, ArrowLeft, GraduationCap, Zap, FlaskConical } from 'lucide-react';

interface WikiProps {
  onBack: () => void;
  initialTopicId?: string | null;
}

interface WikiTopic {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  content: string;
  category: string;
  points: string[];
}

const WIKI_TOPICS: WikiTopic[] = [
  {
    id: 'intro',
    title: 'What are Commands?',
    icon: <Terminal size={20} />,
    description: 'Special text instructions used to control the Minecraft world.',
    content: 'Commands are special text instructions used to control the Minecraft world. You type commands in Chat (/), Command Blocks, or Functions.\n\nExample:\n/time set day\n\nThis tells Minecraft:\ntime = command name\nset = action\nday = value\n\nResult: The world becomes daytime.',
    category: 'BASICS',
    points: [
      'Think of commands like sentences: Verb + Who + What + Extra info.',
      'Always start with a forward slash (/) in chat.',
      'Commands can automate complex tasks in seconds.'
    ]
  },
  {
    id: 'syntax',
    title: 'Syntax & Symbols',
    icon: <BookOpen size={20} />,
    description: 'Understanding required, optional, and repeat indicators.',
    content: 'Most commands follow this pattern: /command argument1 argument2 argument3\n\nCommand Syntax Symbols:\n\n• < > Required: Anything inside is mandatory.\n• [ ] Optional: Anything inside can be omitted.\n• | Choice: Means "OR" (pick one).\n• ... Repeat: Can be repeated multiple times.',
    category: 'BASICS',
    points: [
      '<target> <destination> - You MUST fill both.',
      '<player> <item> [amount] - You can skip the amount.',
      'clear|rain|thunder - Choose exactly one option.',
      'Correct syntax is key to avoiding "Red Text" errors.'
    ]
  },
  {
    id: 'coords',
    title: 'Coordinates Guide',
    icon: <Map size={20} />,
    description: 'X, Y, Z, ~ (Relative), and ^ (Local) positioning.',
    content: 'Coordinates are positions in the world (x y z).\n\n• X Axis: East (+) / West (-)\n• Y Axis: Height (Up (+) / Down (-))\n• Z Axis: South (+) / North (-)\n\nRelative Coordinates (~):\n• ~ means current position.\n• ~1 means 1 block positive.\n\nLocal Coordinates (^):\n• Relative to where players look (^left ^up ^forward).',
    category: 'SPATIAL',
    points: [
      'X Axis: Positive is EAST, Negative is WEST.',
      'Z Axis: Positive is SOUTH, Negative is NORTH.',
      'Y Axis: Up/Down height monitoring.',
      '/tp @s ~ ~10 ~ moves you 10 blocks UP.',
      '/setblock ~ ~-1 ~ stone places stone BELOW your feet.',
      'Ground level is usually Y=64, with deep slate starting at Y=0.',
      '^ ^ ^5 teleport 5 blocks in the direction you look.'
    ]
  },
  {
    id: 'selectors',
    title: 'Target Selectors',
    icon: <Target size={20} />,
    description: '@p, @a, @e, and advanced filtering logic.',
    content: 'Selectors choose entities:\n\n• @p: Nearest player\n• @a: All players\n• @r: Random player\n• @s: Self (executor)\n• @e: All entities (mobs, items, boats, etc.)\n\nFilters inside []:\n• type=zombie (Only zombies)\n• r=5 (Radius of 5 blocks)\n• tag=boss (Entities with specific tag)\n• name=Steve (Exact name match)',
    category: 'LOGIC',
    points: [
      '@kill @e - World apocalypse! Deletes nearly everything.',
      '@e[type=zombie,r=10] - Targets nearby zombies specifically.',
      '@initiator - Advanced selector for NPC/dialog systems.',
      'Use ! for exclusion: @e[type=!player] targets everything BUT players.'
    ]
  },
  {
    id: 'effects',
    title: 'Effects Guide',
    icon: <FlaskConical size={20} />,
    description: 'Status effects analysis and timing protocols.',
    content: 'Effects give temporary powers or problems.\n\nSyntax: /effect <target> <effect> <seconds> <amplifier>\n\nCommon Effects:\n• speed / slowness\n• haste / mining_fatigue\n• strength / weakness\n• instant_health / instant_damage\n• regeneration / poison / wither\n• fire_resistance / water_breathing\n• invisibility / levitation',
    category: 'ENVIRONMENT',
    points: [
      'Amplifier 255 often breaks games: use with caution.',
      'Wither can kill, while poison stops at half a heart.',
      'Levitation is a chaos favorite for traps.',
      'Use "clear" to remove effects: /effect clear @p.'
    ]
  },
  {
    id: 'execute',
    title: 'Master Execute',
    icon: <Zap size={20} />,
    description: 'Advanced context switching and conditional logic.',
    content: 'The Swiss Army knife of commands. Syntax: /execute <conditions> run <command>\n\nModules:\n• as: Changes WHO runs the command\n• at: Changes WHERE it runs\n• if block/entity: Conditional checks\n• unless: Opposite of if\n• positioned/rotated: Shifts context base',
    category: 'ADVANCED',
    points: [
      '/execute as @e[type=zombie] run say Braaaaains!',
      '/execute at @p run summon lightning_bolt ~ ~ ~',
      '/execute if block ~ ~-1 ~ gold_block run tellraw @s {"text":"RICH!"}',
      'Combined logic: "as @a at @s" is the golden rule for player-relative FX.'
    ]
  },
  {
    id: 'logic',
    title: 'Scoreboards & Logic',
    icon: <Terminal size={20} />,
    description: 'Tracking stats, variables, and math operations.',
    content: 'Scoreboards are the "variables" of Minecraft. Used to track kills, points, or custom logic.\n\nKey actions:\n• objectives add: Creates a tracker.\n• players set/add: Changes values.\n• players operation: Math between scores (+, -, *, /).\n• players test: Check if score is in range.',
    category: 'LOGIC',
    points: [
      '/scoreboard objectives setdisplay sidebar points - Shows scores on screen.',
      'Operations like "+=" allow for complex health or currency systems.',
      'Scoreboard "test" is excellent for gating behavior behind level requirements.',
      'Use "dummy" criteria for variables that don\'t track natural stats.'
    ]
  },
  {
    id: 'blocks',
    title: 'Command Blocks',
    icon: <Terminal size={20} />,
    description: 'Impulse, Chain, and Repeat block architectures.',
    content: 'Get one: /give @p command_block\n\nTypes:\n• Impulse (Orange): Runs once per activation.\n• Chain (Green): Runs if the parent block succeeded.\n• Repeat (Purple): Runs continuously (20 times per second).\n\nRequires "Operator" status and "Cheats" enabled in world settings.',
    category: 'LOGIC',
    points: [
      'Repeat blocks are powerful but can cause severe lag if abused.',
      'Condition mode ensures chains don\'t break mid-logic.',
      'Tick delay allows for built-in timing without redstone clocks.',
      'Green (Chain) blocks must point in the direction of the previous block.'
    ]
  },
  {
    id: 'tips',
    title: 'Mistakes & Fun',
    icon: <Info size={20} />,
    description: 'Common pitfalls and fun experiments.',
    content: 'Common Mistakes:\n• Forgetting the slash (/) in chat.\n• Wrong selectors (killing too much with @e).\n• Wrong coords (need all 3: X Y Z).\n\nFun Experiments:\n• Meteor: /summon lightning_bolt ~ ~ ~\n• Sky Jump: /tp @p ~ 200 ~\n• Chaos Cows: Mass summon /summon cow ~ ~ ~',
    category: 'SYSTEM',
    points: [
      'Test complex commands in a separate world first.',
      'Use tab completion to avoid typing errors.',
      'Backup your world before running massive /fill or /kill @e commands.'
    ]
  }
];

const CommandWiki = React.memo(({ onBack, initialTopicId }: WikiProps) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(initialTopicId || null);

  React.useEffect(() => {
    if (initialTopicId) {
      setSelectedTopicId(initialTopicId);
    }
  }, [initialTopicId]);

  const selectedTopic = WIKI_TOPICS.find(t => t.id === selectedTopicId);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-24 overflow-x-hidden"
    >
      <header className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-white/5 gap-4 sticky top-0 bg-cyber-bg/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden px-1">
          <div className="w-10 h-10 rounded-xl bg-cyber-purple/20 flex items-center justify-center text-cyber-purple shrink-0">
            <GraduationCap size={24} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight truncate text-white">Academy <span className="text-cyber-purple">Wiki</span></h2>
            <p className="text-[9px] font-mono text-cyber-text-secondary uppercase truncate">Operational_Database_V4</p>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!selectedTopicId ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 px-1"
          >
            <div className="mb-2">
              <h3 className="text-[10px] font-mono font-bold text-cyber-text-secondary uppercase tracking-[0.2em] mb-4">Select Learning Module</h3>
            </div>
            
            {WIKI_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className="glass-card p-4 sm:p-5 flex items-center justify-between group hover:border-cyber-purple transition-all text-left overflow-hidden"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-cyber-purple/10 flex items-center justify-center text-cyber-purple group-hover:scale-110 transition-transform shrink-0">
                    {topic.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm group-hover:text-cyber-purple transition-colors truncate">{topic.title}</h3>
                    <p className="text-[9px] sm:text-[10px] text-cyber-text-secondary font-mono uppercase truncate opacity-60">
                      {topic.category} <span className="mx-1">//</span> {topic.description}
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-cyber-text-secondary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>
            ))}

            <button 
              onClick={onBack}
              className="mt-8 w-full h-14 glass-card border-dashed border-white/10 flex items-center justify-center gap-2 text-cyber-text-secondary font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={14} /> Exit Knowledge Base
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setSelectedTopicId(null)}
              className="flex items-center gap-2 text-cyber-purple text-[10px] font-bold font-mono tracking-widest uppercase hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to modules
            </button>

            <article className="glass-card p-4 sm:p-6 space-y-6 border-cyber-purple/30 overflow-hidden">
              <header className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyber-purple/20 flex items-center justify-center text-cyber-purple shrink-0">
                  {selectedTopic?.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white truncate">{selectedTopic?.title}</h2>
                  <p className="text-[9px] font-mono text-cyber-purple uppercase tracking-widest truncate">{selectedTopic?.category}_MODULE_PRY</p>
                </div>
              </header>

              <div className="p-5 bg-black/40 border border-white/5 rounded-2xl">
                 <p className="text-sm text-cyber-text-secondary leading-relaxed whitespace-pre-line font-mono">
                  {selectedTopic?.content}
                </p>
              </div>

              {selectedTopic?.points && (
                <div className="space-y-3">
                   <h4 className="text-[10px] font-mono font-bold text-cyber-purple uppercase tracking-[0.2em]">Logic Protocol Points:</h4>
                   <div className="space-y-2">
                      {selectedTopic.points.map((point, i) => (
                        <div key={i} className="flex gap-3 items-start text-xs text-cyber-text-primary font-mono opacity-80 bg-white/5 p-3 rounded-lg border border-white/5">
                           <span className="text-cyber-purple shrink-0">#0{i+1}</span>
                           <p className="leading-normal">{point}</p>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                 <div className="glass-card p-3 bg-cyber-purple/5 border-cyber-purple/20">
                    <p className="text-[8px] font-mono text-cyber-purple/60 uppercase mb-1">Status</p>
                    <p className="text-[10px] font-bold uppercase">Authorized</p>
                 </div>
                 <div className="glass-card p-3 bg-cyber-purple/5 border-cyber-purple/20">
                    <p className="text-[8px] font-mono text-cyber-purple/60 uppercase mb-1">Access</p>
                    <p className="text-[10px] font-bold uppercase">Unrestricted</p>
                 </div>
              </div>

              <footer className="pt-2">
                <p className="text-[9px] text-cyber-text-secondary italic">
                   Note: Minecraft Bedrock Edition syntax may vary slightly between versions. Always test logic in a secure node environment.
                </p>
              </footer>
            </article>

            <div className="glass-card p-4 flex items-center gap-3 bg-cyber-cyan/5 border-cyber-cyan/20">
              <FlaskConical size={16} className="text-cyber-cyan" />
              <p className="text-[10px] font-mono text-cyber-text-secondary leading-none uppercase">
                Want to test this? Visit <span className="text-cyber-cyan font-bold">THE LAB</span> to build custom nodes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default CommandWiki;
