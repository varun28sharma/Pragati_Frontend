'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, BookOpen, AlertCircle } from 'lucide-react';

interface TimetableEntry {
  id: string;
  weekDay: number;
  period: number;
  label: string;
  startTime: string;
  endTime: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  subject?: {
    id: string;
    code: string;
    name: string;
  };
}

interface TimetableResponse {
  studentId: string;
  classroomId: string;
  entries: TimetableEntry[];
}

interface TimetableCardProps {
  language: 'en' | 'pa';
}

export function TimetableCard({ language }: TimetableCardProps) {
  const [timetableData, setTimetableData] = useState<TimetableResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState(new Date().getDay());

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('pragati_token');
      const studentId = localStorage.getItem('pragati_studentId');

      if (!token || !studentId) {
        setError('Authentication required');
        return;
      }

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(
        `${backendUrl}/api/timetables/students/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 404) {
        // No timetable set up yet - this is normal
        setTimetableData(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch timetable');
      }

      const data = await response.json();
      setTimetableData(data);
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError('Timetable will appear once your class schedule is set up');
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
    en: {
      title: 'Timetable',
      subtitle: 'Today\'s schedule',
      noClasses: 'No classes scheduled for today',
      noTimetable: 'Timetable not available',
      period: 'Period',
      teacher: 'Teacher',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    pa: {
      title: 'ਸਮਾਂ ਸਾਰਣੀ',
      subtitle: 'ਅੱਜ ਦਾ ਸਮਾਂ-ਸੂਚੀ',
      noClasses: 'ਅੱਜ ਕੋਈ ਕਲਾਸਾਂ ਨਹੀਂ',
      noTimetable: 'ਸਮਾਂ ਸਾਰਣੀ ਉਪਲਬਧ ਨਹੀਂ',
      period: 'ਪੀਰੀਅਡ',
      teacher: 'ਅਧਿਆਪਕ',
      days: ['ਐਤਵਾਰ', 'ਸੋਮਵਾਰ', 'ਮੰਗਲਵਾਰ', 'ਬੁੱਧਵਾਰ', 'ਵੀਰਵਾਰ', 'ਸ਼ੁੱਕਰਵਾਰ', 'ਸ਼ਨੀਵਾਰ'],
      daysShort: ['ਐਤ', 'ਸੋਮ', 'ਮੰਗਲ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕਰ', 'ਸ਼ਨੀ'],
    },
  };

  const t = translations[language];

  // Filter entries for current day (API uses 1=Monday, JS uses 0=Sunday)
  const todayEntries = timetableData?.entries.filter(entry => {
    // Convert JS day (0=Sunday) to API day (1=Monday)
    const apiDay = currentDay === 0 ? 7 : currentDay;
    return entry.weekDay === apiDay;
  }).sort((a, b) => a.period - b.period) || [];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 hover:shadow-xl transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
            <p className="text-xs text-muted-foreground">{t.days[currentDay]}</p>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6].map((day) => {
          const jsDay = day === 7 ? 0 : day;
          const isSelected = jsDay === currentDay;
          return (
            <button
              key={day}
              onClick={() => setCurrentDay(jsDay)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition ${
                isSelected
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800/80'
              }`}
            >
              {t.daysShort[jsDay]}
            </button>
          );
        })}
      </div>

      {/* Classes List */}
      {todayEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {timetableData ? t.noClasses : t.noTimetable}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {todayEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/40 hover:bg-white/80 dark:hover:bg-slate-800/80 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      {t.period} {entry.period}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.startTime} - {entry.endTime}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold">
                    {entry.subject?.name || entry.label}
                  </h4>
                  {entry.subject?.code && (
                    <p className="text-xs text-muted-foreground">{entry.subject.code}</p>
                  )}
                </div>
              </div>
              {entry.teacher && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/40">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {entry.teacher.firstName} {entry.teacher.lastName}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
