'use client';

import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/shadcn/utils';

/**
 * Named-bot persona chip shown next to the audio visualizer in a live session.
 * Reinforces the "Max" persona (per the voice-commerce research: name the bot
 * and give it an avatar) and doubles as a readable agent-state indicator.
 */

const STATE_META: Record<string, { label: string; dot: string; pulse: boolean }> = {
  listening: { label: 'Listening', dot: 'bg-live', pulse: true },
  thinking: { label: 'Thinking', dot: 'bg-voice', pulse: true },
  speaking: { label: 'Speaking', dot: 'bg-bot', pulse: true },
  initializing: { label: 'Waking up', dot: 'bg-muted-foreground', pulse: false },
  connecting: { label: 'Connecting', dot: 'bg-muted-foreground', pulse: false },
  idle: { label: 'Ready', dot: 'bg-live', pulse: false },
};

export function MaxPersonaBadge({
  agentState,
  className,
}: {
  agentState?: string;
  className?: string;
}) {
  const meta = STATE_META[agentState ?? 'idle'] ?? STATE_META.idle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'border-border/60 bg-popover/50 pointer-events-none flex items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-1.5 backdrop-blur-md',
        className
      )}
    >
      {/* Avatar — serif "M" on the bot gradient */}
      <span className="relative grid size-7 place-content-center">
        <span
          className={cn(
            'bg-bot/40 absolute inset-0 rounded-full blur-sm transition-opacity duration-500',
            agentState === 'speaking' ? 'opacity-100' : 'opacity-40'
          )}
        />
        <span className="from-bot relative grid size-7 place-content-center rounded-full bg-gradient-to-br to-[#5a3ff0] ring-1 ring-white/20">
          <span className="font-serif text-sm leading-none text-white italic">M</span>
        </span>
      </span>

      <span className="flex flex-col leading-none">
        <span className="text-xs font-bold tracking-tight">Max</span>
        <span className="text-muted-foreground mt-0.5 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] uppercase">
          <span className="relative flex size-1.5">
            {meta.pulse && (
              <span
                className={cn(
                  'absolute inline-flex size-full animate-ping rounded-full opacity-70',
                  meta.dot
                )}
              />
            )}
            <span className={cn('relative inline-flex size-1.5 rounded-full', meta.dot)} />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={meta.label}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.18 }}
            >
              {meta.label}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </motion.div>
  );
}
