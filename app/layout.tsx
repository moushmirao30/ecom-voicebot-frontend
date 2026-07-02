import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/app/theme-provider';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { cn } from '@/lib/shadcn/utils';
import { getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/globals.css';

// Display + body — Inter (variable, up to 900 for the 800 hero weight)
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// Accent — Instrument Serif Italic for marketing moments
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

// Metadata / SKU — JetBrains Mono
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const styles = getStyles(appConfig);
  const { pageTitle, pageDescription } = appConfig;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        inter.variable,
        instrumentSerif.variable,
        jetbrainsMono.variable,
        'scroll-smooth font-sans antialiased'
      )}
    >
      <head>
        {styles && <style>{styles}</style>}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </head>
      <body className="overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <header className="from-background pointer-events-none fixed top-0 left-0 z-50 flex w-full flex-row items-center justify-between bg-gradient-to-b to-transparent p-5 md:p-6">
            {/* Wordmark */}
            <div className="pointer-events-auto flex flex-row items-center gap-2.5">
              <div className="bg-bot/15 ring-bot/30 relative flex size-9 items-center justify-center rounded-xl ring-1 backdrop-blur-sm">
                <img src="/logo.svg" alt="ShopMax" className="size-5" />
                <span className="bg-bot/25 absolute inset-0 -z-10 rounded-xl blur-md" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-gradient-bot text-base font-extrabold tracking-tight">
                  ShopMax
                </span>
                <span className="text-muted-foreground/70 font-mono text-[9px] font-medium tracking-[0.24em] uppercase">
                  Voice Commerce
                </span>
              </div>
            </div>

            {/* Live status pill */}
            <div className="border-border/60 bg-popover/40 pointer-events-auto flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="bg-live absolute inline-flex size-full animate-ping rounded-full opacity-70" />
                <span className="bg-live relative inline-flex size-2 rounded-full" />
              </span>
              <span className="text-muted-foreground font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
                AI Voice · Live
              </span>
            </div>
          </header>

          {children}
          <div className="group fixed bottom-0 left-1/2 z-50 mb-2 -translate-x-1/2">
            <ThemeToggle className="translate-y-20 transition-transform delay-150 duration-300 group-hover:translate-y-0" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
