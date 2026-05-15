import React, { useState, useEffect, memo } from 'react';

const Clock = memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="px-3 py-1 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg flex items-center gap-2 group hover:border-cyber-cyan/40 transition-all">
        <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse shadow-[0_0_8px_rgba(0,229,255,1)]" />
        <span className="text-[11px] font-mono font-bold text-cyber-cyan tracking-[0.15em] tabular-nums">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </span>
      </div>
      <span className="text-[7px] font-mono text-cyber-text-secondary uppercase font-bold tracking-[0.3em] mt-1 pl-1 opacity-50 font-display">SYNC_OPERATIONAL</span>
    </div>
  );
});

export default Clock;
