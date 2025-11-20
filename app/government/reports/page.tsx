'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  LogOut,
  UserCircle,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  School,
  Users,
  GraduationCap,
  BarChart3,
  PieChart,
  AlertCircle,
} from 'lucide-react';

interface SchoolReport {
  schoolId: string;
  schoolName: string;
  district: string;
  totalStudents: number;
  totalTeachers: number;
  attendanceRate: number;
  totalComplaints: number;
  openComplaints: number;
}

export default function GovernmentReportsPage() {
  const router = useRouter();
  const [governmentName, setGovernmentName] = useState('Government Official');
  const [schools, setSchools] = useState<SchoolReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');

      if (!token || role !== 'GOVERNMENT') {
        router.push('/login/government');
        return;
      }

      setGovernmentName('Government Official');
      fetchReportData(token);
    }
  }, [router, dateRange]);

  const fetchReportData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      // Fetch all schools
      const schoolsRes = await fetch(`${backendUrl}/api/core/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
      const schoolsData = await schoolsRes.json();

      // For each school, fetch detailed report data
      const reportsPromises = schoolsData.map(async (school: any) => {
        try {
          const [studentsRes, teachersRes] = await Promise.all([
            fetch(`${backendUrl}/api/core/students?schoolId=${school.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${backendUrl}/api/core/teachers?schoolId=${school.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const students = studentsRes.ok ? await studentsRes.json() : [];
          const teachers = teachersRes.ok ? await teachersRes.json() : [];

          return {
            schoolId: school.id,
            schoolName: school.name,
            district: school.district,
            totalStudents: Array.isArray(students) ? students.length : 0,
            totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
            attendanceRate: 0, // No attendance data available yet
            totalComplaints: 0, // No complaints API access for government
            openComplaints: 0,
          };
        } catch (err) {
          console.error(`Error fetching report for school ${school.id}:`, err);
          return null;
        }
      });

      const reports = (await Promise.all(reportsPromises)).filter(Boolean) as SchoolReport[];
      setSchools(reports);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Unable to load report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pragati_token');
    localStorage.removeItem('pragati_role');
    localStorage.removeItem('pragati_userId');
    localStorage.removeItem('pragati_schoolId');
    router.push('/login/government');
  };

  // Calculate overall metrics
  const totalStudents = schools.reduce((sum, s) => sum + s.totalStudents, 0);
  const totalTeachers = schools.reduce((sum, s) => sum + s.totalTeachers, 0);
  const avgAttendance = schools.length > 0
    ? schools.reduce((sum, s) => sum + s.attendanceRate, 0) / schools.length
    : 0;
  const totalComplaints = schools.reduce((sum, s) => sum + s.totalComplaints, 0);
  const openComplaints = schools.reduce((sum, s) => sum + s.openComplaints, 0);

  // Find top and bottom performers
  const topPerformers = [...schools]
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 5);
  const bottomPerformers = [...schools]
    .sort((a, b) => a.attendanceRate - b.attendanceRate)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-1" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/government')}
                className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Reports & Analytics</h1>
                  <p className="text-xs text-muted-foreground">Comprehensive insights across all schools</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 border border-white/40 backdrop-blur-xl">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium">{governmentName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-500/20 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Date Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Report Period</h3>
              <p className="text-sm text-muted-foreground">Select date range for analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>
        </motion.div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <School className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground">Schools</p>
            </div>
            <p className="text-2xl font-bold">{schools.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
            <p className="text-2xl font-bold">{totalStudents.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </div>
            <p className="text-2xl font-bold">{totalTeachers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-sm text-muted-foreground">Avg Attendance</p>
            </div>
            <p className="text-2xl font-bold">{(avgAttendance * 100).toFixed(1)}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm text-muted-foreground">Complaints</p>
            </div>
            <p className="text-2xl font-bold">{totalComplaints}</p>
            <p className="text-xs text-muted-foreground mt-1">{openComplaints} open</p>
          </motion.div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/40">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-semibold">Top Performing Schools</h3>
              </div>
              <p className="text-sm text-muted-foreground">Based on attendance rate</p>
            </div>
            <div className="p-6 space-y-4">
              {topPerformers.map((school, index) => (
                <div key={school.schoolId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{school.schoolName}</p>
                      <p className="text-xs text-muted-foreground">{school.district}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    {(school.attendanceRate * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/40">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold">Schools Needing Attention</h3>
              </div>
              <p className="text-sm text-muted-foreground">Lower attendance rates</p>
            </div>
            <div className="p-6 space-y-4">
              {bottomPerformers.map((school, index) => (
                <div key={school.schoolId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{school.schoolName}</p>
                      <p className="text-xs text-muted-foreground">{school.district}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium">
                    {(school.attendanceRate * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* All Schools Report Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/40">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Detailed School Reports</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {schools.length} schools in the system
                </p>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading report data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">School</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">District</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Students</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Teachers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Attendance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Complaints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {schools.map((school) => (
                    <tr key={school.schoolId} className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm">{school.schoolName}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{school.district}</td>
                      <td className="px-4 py-3 text-sm">{school.totalStudents}</td>
                      <td className="px-4 py-3 text-sm">{school.totalTeachers}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          school.attendanceRate >= 0.9
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : school.attendanceRate >= 0.75
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                          {(school.attendanceRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{school.totalComplaints}</span>
                          {school.openComplaints > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-medium">
                              {school.openComplaints} open
                            </span>
                          )}
                        </div>
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
