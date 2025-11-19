'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ClipboardCheck, TrendingUp, Calendar, AlertCircle, ArrowRight } from 'lucide-react';

interface AttendanceSummary {
  studentId: string;
  today: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
  thisWeek: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
  overall: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
}

interface AttendanceCardProps {
  language: 'en' | 'pa';
}

export function AttendanceCard({ language }: AttendanceCardProps) {
  const router = useRouter();
  const [attendanceData, setAttendanceData] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendanceSummary();
  }, []);

  const fetchAttendanceSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('pragati_token');
      const studentId = localStorage.getItem('pragati_userId');

      if (!token || !studentId) {
        setError('Authentication required');
        return;
      }

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(
        `${backendUrl}/api/attendance/students/summary?studentId=${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const data = await response.json();
      setAttendanceData(data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Unable to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
    en: {
      title: 'Attendance',
      today: 'Today',
      thisWeek: 'This Week',
      overall: 'Overall',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      excused: 'Excused',
      rate: 'Attendance Rate',
      noData: 'No attendance data available',
    },
    pa: {
      title: 'ਹਾਜ਼ਰੀ',
      today: 'ਅੱਜ',
      thisWeek: 'ਇਸ ਹਫ਼ਤੇ',
      overall: 'ਕੁੱਲ',
      present: 'ਹਾਜ਼ਰ',
      absent: 'ਗੈਰਹਾਜ਼ਰ',
      late: 'ਦੇਰ',
      excused: 'ਮਾਫ਼',
      rate: 'ਹਾਜ਼ਰੀ ਦਰ',
      noData: 'ਕੋਈ ਹਾਜ਼ਰੀ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ',
    },
  };

  const t = translations[language];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (error || !attendanceData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{error || t.noData}</p>
        </div>
      </motion.div>
    );
  }

  const overallRate = Math.round((attendanceData.overall.attendanceRate || 0) * 100);
  const weekRate = Math.round((attendanceData.thisWeek.attendanceRate || 0) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 hover:shadow-xl transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
            <p className="text-xs text-muted-foreground">{t.overall}: {overallRate}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{overallRate}%</span>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{t.rate}</span>
          <span className="text-xs font-medium">{overallRate}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${overallRate}%` }}
          />
        </div>
      </div>

      {/* This Week Stats */}
      <div className="space-y-3 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/40 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">{t.thisWeek}</span>
          <span className="text-xs font-semibold text-primary">{weekRate}%</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {attendanceData.thisWeek.present}
            </div>
            <div className="text-[10px] text-muted-foreground">{t.present}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {attendanceData.thisWeek.absent}
            </div>
            <div className="text-[10px] text-muted-foreground">{t.absent}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {attendanceData.thisWeek.late}
            </div>
            <div className="text-[10px] text-muted-foreground">{t.late}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {attendanceData.thisWeek.excused}
            </div>
            <div className="text-[10px] text-muted-foreground">{t.excused}</div>
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="flex items-center justify-between text-xs mb-4">
        <span className="text-muted-foreground">
          Total: {attendanceData.overall.total} days
        </span>
        <span className="text-muted-foreground">
          Present: {attendanceData.overall.present}
        </span>
      </div>

      {/* View Details Button */}
      <button
        onClick={() => router.push('/student/attendance')}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium transition"
      >
        View Detailed History
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
