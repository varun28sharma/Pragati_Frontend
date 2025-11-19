'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  FileText,
  Calendar,
  Bell,
  AlertCircle,
  TrendingUp,
  Download,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  UserCircle,
  CheckCircle,
  Clock,
  XCircle,
  School,
  GraduationCap,
  BookOpen,
  UserPlus,
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  attendanceRate: number;
  activeComplaints: number;
  pendingNotifications: number;
}

export default function PrincipalDashboard() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [principalName, setPrincipalName] = useState('Principal');
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClassrooms: 0,
    attendanceRate: 0,
    activeComplaints: 0,
    pendingNotifications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');
      const name = localStorage.getItem('pragati_name') || 'Principal';

      if (!token || role !== 'PRINCIPAL') {
        router.push('/login/principal');
        return;
      }

      setPrincipalName(name);
      fetchDashboardData(token);
    }
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    setIsLoading(true);
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      
      // Fetch various data in parallel
      const [studentsRes, teachersRes, classroomsRes] = await Promise.all([
        fetch(`${backendUrl}/api/core/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/classrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const students = studentsRes.ok ? await studentsRes.json() : [];
      const teachers = teachersRes.ok ? await teachersRes.json() : [];
      const classrooms = classroomsRes.ok ? await classroomsRes.json() : [];

      // Fetch complaints count
      const complaintsRes = await fetch(`${backendUrl}/api/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const complaintsData = complaintsRes.ok ? await complaintsRes.json() : { total: 0 };

      setStats({
        totalStudents: Array.isArray(students) ? students.length : 0,
        totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
        totalClassrooms: Array.isArray(classrooms) ? classrooms.length : 0,
        attendanceRate: 0,
        activeComplaints: complaintsData.total || 0,
        pendingNotifications: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    router.push('/login/principal');
  };

  const quickActions = [
    {
      id: 'reports',
      title: 'Attendance Reports',
      description: 'View and download attendance analytics',
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      href: '/principal/reports',
    },
    {
      id: 'complaints',
      title: 'Complaints',
      description: 'Manage student complaints and issues',
      icon: AlertCircle,
      gradient: 'from-orange-500 to-rose-500',
      href: '/principal/complaints',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Send announcements and updates',
      icon: Bell,
      gradient: 'from-purple-500 to-indigo-500',
      href: '/principal/notifications',
    },
    {
      id: 'timetables',
      title: 'Timetables',
      description: 'Manage class schedules',
      icon: Calendar,
      gradient: 'from-emerald-500 to-teal-500',
      href: '/principal/timetables',
    },
    {
      id: 'academics',
      title: 'Academic Setup',
      description: 'Manage grades, sections, and subjects',
      icon: BookOpen,
      gradient: 'from-violet-500 to-purple-500',
      href: '/principal/academics',
    },
    {
      id: 'classrooms',
      title: 'Manage Classrooms',
      description: 'Create and manage classroom assignments',
      icon: School,
      gradient: 'from-pink-500 to-purple-500',
      href: '/principal/classrooms',
    },
    {
      id: 'students',
      title: 'Manage Students',
      description: 'Add, edit, and manage student records',
      icon: GraduationCap,
      gradient: 'from-cyan-500 to-blue-500',
      href: '/principal/students',
    },
    {
      id: 'teachers',
      title: 'Manage Teachers',
      description: 'Add, edit, and manage teacher records',
      icon: Users,
      gradient: 'from-amber-500 to-orange-500',
      href: '/principal/teachers',
    },
    {
      id: 'enrollment',
      title: 'Enrollment',
      description: 'Assign teachers, enroll students, manage groups',
      icon: UserPlus,
      gradient: 'from-indigo-500 to-blue-500',
      href: '/principal/enrollment',
    },
    {
      id: 'users',
      title: 'User Logins',
      description: 'Create student & teacher login accounts',
      icon: UserPlus,
      gradient: 'from-rose-500 to-pink-500',
      href: '/principal/users',
    },
  ];

  const statCards = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Teachers',
      value: stats.totalTeachers,
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Classrooms',
      value: stats.totalClassrooms,
      icon: School,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Active Complaints',
      value: stats.activeComplaints,
      icon: AlertCircle,
      color: 'from-orange-500 to-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      {/* Top Government Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-bold">
              🇮🇳
            </div>
            <span className="font-semibold hidden sm:inline">GOVERNMENT OF INDIA</span>
            <span className="font-semibold sm:hidden">GOI</span>
          </div>
          <span className="text-[10px] sm:text-xs">Ministry of Education · Pragati Portal</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="fixed top-10 sm:top-12 left-0 right-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-foreground">Pragati Dashboard</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Principal Portal</p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Selector */}
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

              {/* User Menu */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 border border-white/40 backdrop-blur-xl">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium">{principalName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-500/20 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
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
                <span className="text-xs font-medium">{principalName}</span>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Language:</span>
                <div className="inline-flex items-center rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 px-1 py-0.5 text-[11px] shadow-sm">
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

              <button
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-500/20 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 sm:pt-36 pb-8 px-4 sm:px-6 lg:px-8">
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
                Welcome back
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Good morning, <span className="gradient-text">{principalName}</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Here's an overview of your school's performance today
              </p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 sm:p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl opacity-50" />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-3`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xl sm:text-2xl font-bold">{isLoading ? '...' : stat.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onClick={() => router.push(action.href)}
                    className="relative group overflow-hidden rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-40 group-hover:opacity-70 blur-3xl transition" />
                    
                    <div className="relative z-10">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.gradient} text-white mb-3 group-hover:scale-110 transition`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-semibold mb-1 flex items-center justify-between">
                        {action.title}
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition" />
                      </h4>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Complaints */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold">Recent Complaints</h3>
                <button
                  onClick={() => router.push('/principal/complaints')}
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </button>
              </div>
              {stats.activeComplaints > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {stats.activeComplaints} active complaint{stats.activeComplaints !== 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No active complaints</p>
              )}
            </motion.div>

            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-4">Quick Access</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/principal/reports')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-white/40 hover:bg-white/80 dark:hover:bg-slate-800/80 transition text-left"
                >
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">View Attendance Reports</span>
                </button>
                <button
                  onClick={() => router.push('/principal/timetables')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-white/40 hover:bg-white/80 dark:hover:bg-slate-800/80 transition text-left"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">Manage Timetables</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
