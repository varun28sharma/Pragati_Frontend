"use client";

import type { ReactNode } from 'react';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex flex-col overflow-hidden">
      <header className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/roles')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to roles
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-muted-foreground">Language</span>
            <div className="inline-flex items-center rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 px-1 py-0.5 text-[11px] shadow-sm backdrop-blur-xl">
              <button
                type="button"
                className="px-2 py-0.5 rounded-full bg-primary text-white font-medium"
              >
                English
              </button>
              <button
                type="button"
                className="px-2 py-0.5 rounded-full text-muted-foreground hover:bg-white/80 dark:hover:bg-slate-800/80 transition"
              >
                ਪੰਜਾਬੀ
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute w-80 h-80 bg-primary/15 rounded-full blur-3xl" style={{ top: '5%', left: '8%' }} />
          <div className="absolute w-72 h-72 bg-secondary/15 rounded-full blur-3xl" style={{ bottom: '-10%', right: '-4%' }} />
        </div>
        <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
          {children}
        </div>
      </main>
      <footer className="border-t border-white/20 bg-white/30 dark:bg-white/5 backdrop-blur-lg py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3 text-[11px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <Image
              src="/pragati-logo.png"
              alt="Pragati logo"
              width={72}
              height={72}
              className="w-12 h-12 object-contain drop-shadow"
            />
            <span className="font-semibold text-foreground hidden sm:inline">Pragati</span>
          </div>
          <p className="text-right">
            © {new Date().getFullYear()} Pragati. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
