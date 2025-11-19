'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Check,
  X,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
} from 'lucide-react';

interface AttendanceRecord {
  sessionId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  attendanceSession: {
    sessionDate: string;
    startsAt: string;
    endsAt: string;
  };
}

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

export default function StudentAttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const token = localStorage.getItem('pragati_token');
    const role = localStorage.getItem('pragati_role');

    if (!token || role !== 'STUDENT') {
      router.push('/login/student');
      return;
    }

    fetchData(token);
  }, [router, dateRange]);

  const fetchData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const studentId = localStorage.getItem('pragati_userId');
      if (!studentId) throw new Error('Student ID not found');

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const [recordsRes, summaryRes] = await Promise.all([
        fetch(`${backendUrl}/api/attendance/students/${studentId}?from=${dateRange.from}&to=${dateRange.to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/attendance/students/summary?studentId=${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!recordsRes.ok || !summaryRes.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const recordsData = await recordsRes.json();
      const summaryData = await summaryRes.json();

      setRecords(Array.isArray(recordsData) ? recordsData : []);
      setSummary(summaryData);
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      setError(err.message || 'Unable to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pragati_token');
    localStorage.removeItem('pragati_role');
    localStorage.removeItem('pragati_userId');
    router.push('/login/student');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      present: {
        icon: <Check className="w-3 h-3" />,
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        label: 'Present',
      },
      absent: {
        icon: <X className="w-3 h-3" />,
        className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        label: 'Absent',
      },
      late: {
        icon: <Clock className="w-3 h-3" />,
        className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
        label: 'Late',
      },
      excused: {
        icon: <AlertCircle className="w-3 h-3" />,
        className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        label: 'Excused',
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.absent;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${badge.className}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/student')}
                className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Attendance History</h1>
                <p className="text-xs text-muted-foreground">Detailed attendance records</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-500/20 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold">Today</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Attendance Rate</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {(summary.today.attendanceRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-emerald-600">✓ {summary.today.present}</span>
                  <span className="text-red-600">✗ {summary.today.absent}</span>
                  <span className="text-yellow-600">⏰ {summary.today.late}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold">This Week</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Attendance Rate</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {(summary.thisWeek.attendanceRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-emerald-600">✓ {summary.thisWeek.present}</span>
                  <span className="text-red-600">✗ {summary.thisWeek.absent}</span>
                  <span className="text-yellow-600">⏰ {summary.thisWeek.late}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold">Overall</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Attendance Rate</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {(summary.overall.attendanceRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-emerald-600">✓ {summary.overall.present}</span>
                  <span className="text-red-600">✗ {summary.overall.absent}</span>
                  <span className="text-yellow-600">⏰ {summary.overall.late}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Date Range Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-sm font-medium mb-2">From Date</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">To Date</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Attendance Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/40">
            <h3 className="text-lg font-semibold">Attendance Records</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {records.length} records found
            </p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading records...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No attendance records found for the selected date range</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Session Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {records.map((record) => (
                    <tr key={record.sessionId} className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 text-sm">
                        {formatDate(record.attendanceSession.sessionDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatTime(record.attendanceSession.startsAt)} - {formatTime(record.attendanceSession.endsAt)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(record.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
