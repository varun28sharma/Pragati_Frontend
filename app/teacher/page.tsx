"use client";

import { useState } from 'react';
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
  ChevronRight,
} from 'lucide-react';

const TeacherDashboard = () => {
  const [teacherName, setTeacherName] = useState('Teacher');

  const quickActions = [
    {
      id: 'attendance',
      title: 'Manage Attendance',
      description: 'Create sessions and view summaries',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      href: '/teacher/attendance',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Create and view notifications',
      icon: Bell,
      gradient: 'from-purple-500 to-indigo-500',
      href: '/teacher/notifications',
    },
    {
      id: 'exams',
      title: 'Exams',
      description: 'Create exams and sync results',
      icon: TrendingUp,
      gradient: 'from-green-500 to-teal-500',
      href: '/teacher/exams',
    },
    {
      id: 'analytics',
      title: 'Attendance Analytics',
      description: 'View analytics and export PDFs',
      icon: BarChart3,
      gradient: 'from-yellow-500 to-orange-500',
      href: '/teacher/analytics',
    },
    {
      id: 'timetables',
      title: 'Timetables',
      description: 'View classroom schedules',
      icon: Calendar,
      gradient: 'from-red-500 to-pink-500',
      href: '/teacher/timetables',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-foreground">Teacher Dashboard</h1>
            <button
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 inline-flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-white/40 bg-linear-to-br from-primary/10 via-white/70 to-secondary/10 dark:from-primary/5 dark:via-slate-900/70 dark:to-secondary/5 backdrop-blur-xl p-6 sm:p-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome, <span className="gradient-text">{teacherName}</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Here's an overview of your teaching activities today
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => (window.location.href = action.href)}
                  className="relative group overflow-hidden rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-linear-to-br from-white/40 to-transparent opacity-40 group-hover:opacity-70 blur-3xl transition" />
                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${action.gradient} text-white mb-3 group-hover:scale-110 transition`}>
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
      </main>
    </div>
  );
};

export default TeacherDashboard;
