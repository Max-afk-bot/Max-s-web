import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Star, Zap, ChevronRight, Check, ShieldCheck, User } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    type: 'info',
    icon: <Terminal size={40} />,
    title: 'THE PROTOCOL',
    desc: 'Access a massive local database of Bedrock Edition commands. No network required, just pure logic syntax.',
    color: 'text-cyber-cyan',
    bg: 'bg-cyber-cyan/10'
  },
  {
    type: 'info',
    icon: <Star size={40} />,
    title: 'THE VAULT',
    desc: "Like a specific node? Archive it to your local vault. Your favorite commands are saved directly on your device storage.",
    color: 'text-cyber-purple',
    bg: 'bg-cyber-purple/10'
  },
  {
    type: 'info',
    icon: <Zap size={40} />,
    title: 'THE LAB',
    desc: 'Experiment with command builders and logic sequences. Build your own nodes and contribute to the architect network.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10'
  },
  {
    type: 'consent',
    icon: <ShieldCheck size={40} />,
    title: 'DATA PROTOCOLS',
    desc: 'To proceed, you must agree to our system usage policies.',
    color: 'text-cyber-cyan',
    bg: 'bg-cyber-cyan/10'
  },
  {
    type: 'age',
    icon: <User size={40} />,
    title: 'AGE VERIFICATION',
    desc: 'Select your age bracket to optimize system parameters.',
    color: 'text-cyber-purple',
    bg: 'bg-cyber-purple/10'
  }
];

const Onboarding = memo(({ onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  const step = STEPS[currentStep];

  const canContinue = () => {
    if (step.type === 'consent') return agreedTerms;
    if (step.type === 'age') return selectedAge !== null;
    return true;
  };

  const next = () => {
    if (!canContinue()) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-cyber-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-12">
        <div className="space-y-2 text-center">
            <h1 className="text-2xl font-display font-bold text-white tracking-widest uppercase">COMMANDS FOR MCPE</h1>
            <p className="text-[10px] font-mono text-cyber-text-secondary uppercase tracking-[0.2em]">Deployment_V2.1.2</p>
        </div>

        <div className="relative min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="text-center space-y-6 w-full"
            >
              <div className={`w-20 h-20 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mx-auto shadow-2xl`}>
                {step.icon}
              </div>
              
              <div className="space-y-2">
                <h2 className={`text-2xl font-display font-bold ${step.color} tracking-tight`}>{step.title}</h2>
                <p className="text-sm text-cyber-text-secondary leading-relaxed px-4">{step.desc}</p>
              </div>

              {step.type === 'consent' && (
                <div className="pt-4 space-y-3">
                  <button 
                    onClick={() => setAgreedTerms(!agreedTerms)}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3 text-left ${agreedTerms ? 'border-cyber-cyan bg-cyber-cyan/5 text-white' : 'border-white/10 bg-white/5 text-cyber-text-secondary'}`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreedTerms ? 'bg-cyber-cyan border-cyber-cyan' : 'border-white/20'}`}>
                      {agreedTerms && <Check size={14} className="text-black" />}
                    </div>
                    <span className="text-xs font-mono">I agree to the Terms & Privacy Policy</span>
                  </button>
                  <p className="text-[9px] text-cyber-text-secondary font-mono italic">View full legal nodes in System settings later.</p>
                </div>
              )}

              {step.type === 'age' && (
                <div className="grid grid-cols-1 gap-2 pt-4">
                  {['Under 13', '13 - 17', '18+'].map((age) => (
                    <button
                      key={age}
                      onClick={() => setSelectedAge(age)}
                      className={`w-full p-3 rounded-xl border font-mono text-xs transition-all ${selectedAge === age ? 'border-cyber-purple bg-cyber-purple/10 text-white' : 'border-white/10 bg-white/5 text-cyber-text-secondary'}`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-white' : 'w-2 bg-white/10'}`} 
              />
            ))}
          </div>

          <button 
            onClick={next}
            disabled={!canContinue()}
            className={`w-full h-16 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 group transition-all uppercase tracking-widest text-xs disabled:opacity-30 disabled:grayscale`}
          >
            {currentStep === STEPS.length - 1 ? (
              <>INITIALIZE ENGINE <Check size={18} /></>
            ) : (
              <>NEXT PROTOCOL <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default Onboarding;
