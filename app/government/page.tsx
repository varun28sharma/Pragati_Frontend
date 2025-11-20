'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  School,
  Users,
  AlertCircle,
  TrendingUp,
  LogOut,
  UserCircle,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  GraduationCap,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface SchoolStats {
  id: string;
  name: string;
  district: string;
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  attendanceRate: number;
  activeComplaints: number;
}

interface OverallStats {
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  averageAttendance: number;
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
}

export default function GovernmentDashboard() {
  const router = useRouter();
  const [governmentName, setGovernmentName] = useState('Government Official');
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClassrooms: 0,
    averageAttendance: 0,
    totalComplaints: 0,
    openComplaints: 0,
    resolvedComplaints: 0,
  });
  const [schools, setSchools] = useState<SchoolStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');

      if (!token || role !== 'GOVERNMENT') {
        router.push('/login/government');
        return;
      }

      setGovernmentName('Government Official');
      fetchDashboardData(token);
    }
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      // Fetch schools
      const schoolsRes = await fetch(`${backendUrl}/api/core/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
      const schoolsData = await schoolsRes.json();

      // For each school, fetch detailed stats
      const schoolStatsPromises = schoolsData.map(async (school: any) => {
        try {
          const [studentsRes, teachersRes, classroomsRes] = await Promise.all([
            fetch(`${backendUrl}/api/core/students?schoolId=${school.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${backendUrl}/api/core/teachers?schoolId=${school.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${backendUrl}/api/core/classrooms?schoolId=${school.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const students = studentsRes.ok ? await studentsRes.json() : [];
          const teachers = teachersRes.ok ? await teachersRes.json() : [];
          const classrooms = classroomsRes.ok ? await classroomsRes.json() : [];

          return {
            id: school.id,
            name: school.name,
            district: school.district,
            totalStudents: Array.isArray(students) ? students.length : 0,
            totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
            totalClassrooms: Array.isArray(classrooms) ? classrooms.length : 0,
            attendanceRate: 0, // No attendance data available yet
            activeComplaints: 0, // No complaints API access for government
          };
        } catch (err) {
          console.error(`Error fetching stats for school ${school.id}:`, err);
          return {
            id: school.id,
            name: school.name,
            district: school.district,
            totalStudents: 0,
            totalTeachers: 0,
            totalClassrooms: 0,
            attendanceRate: 0,
            activeComplaints: 0,
          };
        }
      });

      const schoolStats = await Promise.all(schoolStatsPromises);
      setSchools(schoolStats);

      // Calculate overall stats
      const overall: OverallStats = {
        totalSchools: schoolStats.length,
        totalStudents: schoolStats.reduce((sum, s) => sum + s.totalStudents, 0),
        totalTeachers: schoolStats.reduce((sum, s) => sum + s.totalTeachers, 0),
        totalClassrooms: schoolStats.reduce((sum, s) => sum + s.totalClassrooms, 0),
        averageAttendance: schoolStats.length > 0
          ? schoolStats.reduce((sum, s) => sum + s.attendanceRate, 0) / schoolStats.length
          : 0,
        totalComplaints: 0,
        openComplaints: 0,
        resolvedComplaints: 0,
      };

      setOverallStats(overall);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load dashboard data. Please try again.');
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

  const quickLinks = [
    {
      id: 'schools',
      title: 'All Schools',
      description: 'View all registered schools',
      icon: School,
      gradient: 'from-blue-500 to-cyan-500',
      href: '/government/schools',
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      description: 'Comprehensive reports and insights',
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-500',
      href: '/government/reports',
    },
    {
      id: 'complaints',
      title: 'Complaints Overview',
      description: 'Monitor complaints across all schools',
      icon: AlertCircle,
      gradient: 'from-orange-500 to-red-500',
      href: '/government/complaints',
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage system users',
      icon: Users,
      gradient: 'from-emerald-500 to-teal-500',
      href: '/government/users',
    },
  ];

  const statCards = [
    {
      label: 'Total Schools',
      value: overallStats.totalSchools,
      icon: School,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Students',
      value: overallStats.totalStudents.toLocaleString(),
      icon: GraduationCap,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Total Teachers',
      value: overallStats.totalTeachers,
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Avg Attendance',
      value: `${(overallStats.averageAttendance * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-1" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 via-white to-green-600">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Government Portal</h1>
                  <p className="text-xs text-muted-foreground">Ministry of Education - India</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="inline-flex items-center rounded-full bg-white/60 dark:bg-slate-900/60 border border-white/40 px-1 py-0.5 text-[11px] shadow-sm backdrop-blur-xl">
                <button type="button" className="px-2 py-0.5 rounded-full bg-primary text-white font-medium">
                  English
                </button>
                <button type="button" className="px-2 py-0.5 rounded-full text-muted-foreground hover:bg-white/80 dark:hover:bg-slate-800/80 transition">
                  ਪੰਜਾਬੀ
                </button>
              </div>

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-orange-500/10 via-white/70 to-green-500/10 dark:from-orange-500/5 dark:via-slate-900/70 dark:to-green-500/5 backdrop-blur-xl p-8"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-orange-400/20 to-transparent blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-tr from-green-400/20 to-transparent blur-3xl" />
          
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300 backdrop-blur-xl mb-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              Bharat Sarkar · Government of India
            </p>
            <h2 className="text-3xl font-bold mb-2">
              Welcome, <span className="gradient-text">{governmentName}</span>
            </h2>
            <p className="text-muted-foreground">
              Monitor and manage education infrastructure across all registered schools
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => router.push(link.href)}
                className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 text-left hover:shadow-xl transition-all duration-200"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${link.gradient} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <link.icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold mb-1">{link.title}</h4>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Schools Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/40">
            <h3 className="text-lg font-semibold">Schools Overview</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {schools.length} school{schools.length !== 1 ? 's' : ''} registered
            </p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading schools...</p>
            </div>
          ) : schools.length === 0 ? (
            <div className="p-12 text-center">
              <School className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No schools registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">School Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">District</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Students</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Teachers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Classrooms</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {schools.map((school) => (
                    <tr
                      key={school.id}
                      className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition cursor-pointer"
                      onClick={() => router.push(`/government/schools/${school.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{school.name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {school.district}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{school.totalStudents}</td>
                      <td className="px-4 py-3 text-sm">{school.totalTeachers}</td>
                      <td className="px-4 py-3 text-sm">{school.totalClassrooms}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="border-t border-white/20 bg-white/30 dark:bg-white/5 backdrop-blur-lg py-4 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-[11px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img
              src="/pragati-logo.png"
              alt="Pragati logo"
              className="w-12 h-12 object-contain drop-shadow"
            />
            <span className="font-semibold text-foreground hidden sm:inline">Pragati</span>
          </div>
          <p className="text-right">© {new Date().getFullYear()} Pragati. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
