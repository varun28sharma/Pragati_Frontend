'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LogOut,
  UserCircle,
  Menu,
  X,
} from 'lucide-react';
import { AttendanceCard } from './components/AttendanceCard';
import { TimetableCard } from './components/TimetableCard';
import { ExamResultsCard } from './components/ExamResultsCard';
import { ComplaintsCard } from './components/ComplaintsCard';
import { NotificationsCard } from './components/NotificationsCard';

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  classroom: {
    id: string;
    grade: { name: string };
    section: { label: string };
  };
}

export default function StudentDashboard() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'pa'>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');
      const studentId = localStorage.getItem('pragati_studentId');

      if (!token || role !== 'STUDENT') {
        router.push('/login/student');
        return;
      }

      if (studentId) {
        fetchStudentProfile(token, studentId);
      }
    }
  }, [router]);

  const fetchStudentProfile = async (token: string, studentId: string) => {
    setIsLoading(true);
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      
      const response = await fetch(`${backendUrl}/api/core/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStudentProfile(data);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pragati_token');
      localStorage.removeItem('pragati_role');
      localStorage.removeItem('pragati_userId');
      localStorage.removeItem('pragati_name');
    }
    router.push('/login/student');
  };

  const getStudentName = () => {
    if (studentProfile) {
      return `${studentProfile.firstName} ${studentProfile.lastName}`;
    }
    return localStorage.getItem('pragati_name') || 'Student';
  };

  const translations = {
    en: {
      welcome: 'Welcome back',
      goodMorning: 'Good morning',
      dashboard: 'Student Dashboard',
      myLearning: 'My Learning Portal',
      attendance: 'Attendance',
      timetable: 'Timetable',
      examResults: 'Exam Results',
      complaints: 'Complaints',
      notifications: 'Notifications',
      logout: 'Logout',
      english: 'English',
      punjabi: 'ਪੰਜਾਬੀ',
    },
    pa: {
      welcome: 'ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ',
      goodMorning: 'ਸ਼ੁਭ ਸਵੇਰ',
      dashboard: 'ਵਿਦਿਆਰਥੀ ਡੈਸ਼ਬੋਰਡ',
      myLearning: 'ਮੇਰਾ ਸਿੱਖਣ ਪੋਰਟਲ',
      attendance: 'ਹਾਜ਼ਰੀ',
      timetable: 'ਸਮਾਂ ਸਾਰਣੀ',
      examResults: 'ਪ੍ਰੀਖਿਆ ਨਤੀਜੇ',
      complaints: 'ਸ਼ਿਕਾਇਤਾਂ',
      notifications: 'ਸੂਚਨਾਵਾਂ',
      logout: 'ਲੌਗ ਆਊਟ',
      english: 'English',
      punjabi: 'ਪੰਜਾਬੀ',
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex flex-col">
      {/* Main Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <img
                src="/pragati-logo.png"
                alt="Pragati logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow"
              />
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-foreground">{t.dashboard}</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{t.myLearning}</p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Selector */}
              <div className="inline-flex items-center rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 px-1 py-0.5 text-[11px] shadow-sm backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded-full font-medium transition ${
                    language === 'en'
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-white/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {t.english}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('pa')}
                  className={`px-2 py-0.5 rounded-full font-medium transition ${
                    language === 'pa'
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-white/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {t.punjabi}
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 border border-white/40 backdrop-blur-xl">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium">{getStudentName()}</span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-500/20 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t.logout}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden mt-4 pt-4 border-t border-white/40 space-y-3"
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-white/40">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium">{getStudentName()}</span>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Language:</span>
                <div className="inline-flex items-center rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 px-1 py-0.5 text-[11px] shadow-sm">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded-full font-medium transition ${
                      language === 'en'
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:bg-white/80 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    {t.english}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('pa')}
                    className={`px-2 py-0.5 rounded-full font-medium transition ${
                      language === 'pa'
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:bg-white/80 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    {t.punjabi}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-500/20 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t.logout}
              </button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 sm:pt-28 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-primary/10 via-white/70 to-secondary/10 dark:from-primary/5 dark:via-slate-900/70 dark:to-secondary/5 backdrop-blur-xl p-6 sm:p-8"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-gradient-to-tr from-secondary/30 to-transparent blur-3xl" />
            
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-white/60 bg-white/60 dark:bg-slate-900/60 shadow-sm backdrop-blur-xl mb-3">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t.welcome}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                {t.goodMorning}, <span className="gradient-text">{studentProfile?.firstName || 'Student'}</span>
              </h2>
              {studentProfile?.classroom && (
                <p className="text-sm sm:text-base text-muted-foreground">
                  {studentProfile.classroom.grade.name} - {studentProfile.classroom.section.label} · Roll No: {studentProfile.code}
                </p>
              )}
            </div>
          </motion.div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Attendance Card */}
            <AttendanceCard language={language} />

            {/* Timetable Card */}
            <TimetableCard language={language} />

            {/* Exam Results Card */}
            <ExamResultsCard language={language} />

            {/* Complaints Card */}
            <ComplaintsCard language={language} />

            {/* Notifications Card */}
            <NotificationsCard language={language} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/30 dark:bg-white/5 backdrop-blur-lg py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-[11px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img
              src="/pragati-logo.png"
              alt="Pragati logo"
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
