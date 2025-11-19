'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';

type Role = 'STUDENT' | 'TEACHER' | 'PRINCIPAL' | 'GOVERNMENT';

interface LoginCardProps {
  role: Role;
  title: string;
  subtitle: string;
  redirectPath?: string;
}

interface LoginResponse {
  token: string;
  expiresIn: string;
  userId: string;
  role: string;
  studentId: string | null;
  teacherId: string | null;
  schoolId: string | null;
}

export function LoginCard({ role, title, subtitle, redirectPath }: LoginCardProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid credentials. Please check your email and password.');
        } else if (response.status === 403) {
          setError('Your account is blocked. Please contact your administrator.');
        } else {
          setError('Unable to sign in right now. Please try again.');
        }
        return;
      }

      const data = (await response.json()) as LoginResponse;

      if (data.role !== role) {
        setError('This account belongs to a different role.');
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('pragati_token', data.token);
        localStorage.setItem('pragati_role', data.role);
        localStorage.setItem('pragati_userId', data.userId);
        
        // Store studentId or teacherId for role-specific APIs
        if (data.studentId) {
          localStorage.setItem('pragati_studentId', data.studentId);
        }
        if (data.teacherId) {
          localStorage.setItem('pragati_teacherId', data.teacherId);
        }
        
        if (data.schoolId) {
          localStorage.setItem('pragati_schoolId', data.schoolId);
        }
        // Use email entered as display name fallback until richer profile available
        localStorage.setItem('pragati_name', email);
      }

      router.push(redirectPath ?? '/');
    } catch {
      setError('Unable to sign in right now. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-lg shadow-primary/10"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/40 to-transparent blur-3xl opacity-60" />
      <div className="absolute -left-16 -bottom-16 h-32 w-32 rounded-full bg-gradient-to-tr from-emerald-400/30 to-transparent blur-3xl opacity-60" />
      <div className="relative z-10 p-5 sm:p-6">
        <div className="mb-4">
          <p className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] border border-white/60 bg-white/60 dark:bg-slate-900/60 shadow-sm backdrop-blur-xl mb-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Secure sign-in
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">{title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/60 bg-white/70 dark:bg-slate-950/60 backdrop-blur-sm px-3 py-2 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-medium text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/60 bg-white/70 dark:bg-slate-950/60 backdrop-blur-sm px-3 py-2 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          {error && (
            <p className="text-[11px] text-red-500 bg-red-50/70 dark:bg-red-950/40 border border-red-200/70 dark:border-red-900/50 rounded-md px-2 py-1">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-emerald-500 text-white text-sm font-medium px-3 py-2.5 shadow-md shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Don&apos;t create a new account yourself. Pragati access is provisioned by your school or district administrator.
        </p>
      </div>
    </motion.div>
  );
}
