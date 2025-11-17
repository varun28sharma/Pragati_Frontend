'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Users, BarChart3, Shield, ArrowLeft, ChevronRight } from 'lucide-react';

const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'View timetable, homework, marks and attendance in one place.',
    icon: BookOpen,
    accent: 'from-blue-500 to-cyan-500',
    badge: 'Learn',
  },
  {
    id: 'teacher',
    title: 'Teacher',
    description: 'Mark attendance in seconds and track classroom progress.',
    icon: Users,
    accent: 'from-emerald-500 to-teal-500',
    badge: 'Teach',
  },
  {
    id: 'principal',
    title: 'Principal / Head',
    description: 'Monitor school performance, staff attendance and key indicators.',
    icon: BarChart3,
    accent: 'from-orange-500 to-rose-500',
    badge: 'Lead',
  },
  {
    id: 'government',
    title: 'District / Govt Official',
    description: 'Access compliance reports and district-wide analytics securely.',
    icon: Shield,
    accent: 'from-purple-500 to-indigo-500',
    badge: 'Govern',
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleSelect = (roleId: string) => {
    // Placeholder: wire to actual routes when available
    router.push(`/?role=${roleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex flex-col">
      <header className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            Pragati · Secure role-based access
          </p>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs border border-white/60 bg-white/60 dark:bg-slate-900/60 shadow-sm mb-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Choose how you want to continue
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">
              Select your <span className="gradient-text">Pragati role</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
              Each role gets a tailored dashboard, so we can show you the right tools, reports and actions as soon as you sign in.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelect(role.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="relative group overflow-hidden rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 sm:p-5 text-left shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-40 group-hover:opacity-70 blur-2xl transition "
                    style={{}}>
                  </div>
                  <div className={`mb-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${role.accent} px-2.5 py-1 text-[11px] font-medium text-white shadow-sm`}
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/20">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span>{role.badge}</span>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <h2 className="text-sm sm:text-base font-semibold flex items-center justify-between gap-2">
                      <span>{role.title}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition" />
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
                      {role.description}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 flex items-center gap-2">
                    <span className="inline-flex h-1 w-8 rounded-full bg-emerald-400/60 group-hover:bg-emerald-400 transition" />
                  </p>
                </motion.button>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 sm:mt-10 text-center text-[11px] sm:text-xs text-muted-foreground"
          >
            <p>
              Need an account? Contact your school administrator or district coordinator for account creation.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
