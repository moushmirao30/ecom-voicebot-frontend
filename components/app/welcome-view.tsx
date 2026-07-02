'use client';

import { motion } from 'motion/react';
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  PackageIcon,
  ShieldCheckIcon,
  TagIcon,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';

const FEATURES = [
  { icon: MagnifyingGlassIcon, label: 'Search' },
  { icon: TagIcon, label: 'Stock & Price' },
  { icon: PackageIcon, label: 'Track orders' },
  { icon: ShieldCheckIcon, label: 'Policies' },
];

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="bg-background fixed inset-0 overflow-hidden">
      {/* ---- Ambient background ---- */}
      <div className="pointer-events-none absolute inset-0">
        {/* aurora blobs */}
        <div className="bg-bot/30 animate-aurora absolute -top-32 -left-24 size-[42rem] rounded-full blur-[120px]" />
        <div className="bg-live/20 animate-glow absolute top-1/3 -right-24 size-[34rem] rounded-full blur-[120px]" />
        <div className="bg-cart/15 animate-float absolute -bottom-40 left-1/4 size-[36rem] rounded-full blur-[130px]" />
        {/* faint grid with radial fade */}
        <div
          className="bg-grid-faint absolute inset-0 opacity-60"
          style={{
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, black, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, black, transparent 75%)',
          }}
        />
        {/* bottom vignette */}
        <div className="from-background absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />
      </div>

      {/* ---- Content ---- */}
      <section className="relative z-10 mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center px-6 text-center">
        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
          className="border-border/60 bg-popover/40 text-muted-foreground mb-8 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase backdrop-blur-md"
        >
          <span className="bg-voice size-1.5 rounded-full" />
          ShopMax Voice Assistant
        </motion.span>

        {/* Mic orb — the persistent, primary control motif */}
        <motion.button
          type="button"
          onClick={onStartCall}
          aria-label={startButtonText}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, type: 'spring', stiffness: 260, damping: 18 }}
          className="group relative mb-9 grid size-24 place-content-center"
        >
          {/* pulsing rings */}
          <span className="border-bot/40 animate-ring-pulse absolute inset-0 rounded-full border" />
          <span
            className="border-bot/30 animate-ring-pulse absolute inset-0 rounded-full border"
            style={{ animationDelay: '0.8s' }}
          />
          {/* glow */}
          <span className="bg-bot/40 group-hover:bg-bot/60 absolute inset-2 rounded-full blur-xl transition-all duration-300" />
          {/* core */}
          <span className="from-bot shadow-bot/40 relative grid size-24 place-content-center rounded-full bg-gradient-to-br to-[#5a3ff0] shadow-2xl ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
            <MicrophoneIcon weight="fill" className="size-9 text-white" />
          </span>
        </motion.button>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.55, ease: 'easeOut' }}
          className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl"
        >
          Meet Max, your
          <br />
          <span className="text-gradient-bot font-serif text-5xl italic sm:text-6xl">
            voice shopping concierge.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55, ease: 'easeOut' }}
          className="text-muted-foreground mt-5 max-w-md text-base leading-relaxed text-pretty"
        >
          Search the catalog, check stock and prices, track orders, and ask about store policies —
          just by speaking. No typing, no menus.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
        >
          <Button
            size="lg"
            onClick={onStartCall}
            className="from-bot group shadow-bot/25 hover:shadow-bot/40 mt-9 h-auto rounded-full bg-gradient-to-r to-[#6a49f5] px-8 py-6 text-sm font-semibold tracking-wide text-white shadow-lg transition-all duration-300 hover:scale-105"
          >
            <MicrophoneIcon weight="fill" className="size-4" />
            {startButtonText}
            <ArrowRightIcon
              weight="bold"
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>
        </motion.div>

        {/* Feature chips */}
        <motion.ul
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          {FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="border-border/60 bg-popover/30 text-muted-foreground hover:text-foreground hover:border-bot/40 flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[11px] font-medium tracking-wide backdrop-blur-sm transition-colors"
            >
              <Icon weight="bold" className="text-bot size-3.5" />
              {label}
            </li>
          ))}
        </motion.ul>
      </section>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-muted-foreground/50 absolute bottom-6 left-0 w-full text-center font-mono text-[10px] tracking-[0.14em] uppercase"
      >
        Secured via LiveKit WebRTC · Deepgram · Cartesia
      </motion.p>
    </div>
  );
};
