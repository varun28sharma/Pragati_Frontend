'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  LogOut,
  UserCircle,
  Users,
  Search,
  Shield,
  GraduationCap,
  BookOpen,
  School as SchoolIcon,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  status: string;
  studentId: string | null;
  teacherId: string | null;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

interface School {
  id: string;
  name: string;
  district: string;
}

export default function GovernmentUsersPage() {
  const router = useRouter();
  const [governmentName, setGovernmentName] = useState('Government Official');
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');

      if (!token || role !== 'GOVERNMENT') {
        router.push('/login/government');
        return;
      }

      setGovernmentName('Government Official');
      fetchData(token);
    }
  }, [router]);

  const fetchData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const [usersRes, schoolsRes] = await Promise.all([
        fetch(`${backendUrl}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/schools`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersRes.ok) throw new Error('Failed to fetch users');
      if (!schoolsRes.ok) throw new Error('Failed to fetch schools');

      const usersData = await usersRes.json();
      const schoolsData = await schoolsRes.json();

      setUsers(Array.isArray(usersData) ? usersData : []);
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to load user data. Please try again.');
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return GraduationCap;
      case 'TEACHER':
        return BookOpen;
      case 'PRINCIPAL':
        return SchoolIcon;
      case 'GOVERNMENT':
        return Shield;
      default:
        return Shield;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'TEACHER':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'PRINCIPAL':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'GOVERNMENT':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getSchoolName = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getSchoolName(user.schoolId).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesSchool = schoolFilter === 'all' || user.schoolId === schoolFilter;

    return matchesSearch && matchesStatus && matchesSchool;
  });

  // Group users by role
  const usersByRole = {
    ADMIN: filteredUsers.filter((u) => u.role === 'ADMIN'),
    GOVERNMENT: filteredUsers.filter((u) => u.role === 'GOVERNMENT'),
    PRINCIPAL: filteredUsers.filter((u) => u.role === 'PRINCIPAL'),
    TEACHER: filteredUsers.filter((u) => u.role === 'TEACHER'),
    STUDENT: filteredUsers.filter((u) => u.role === 'STUDENT'),
  };

  const roleCounts = {
    total: users.length,
    admin: users.filter((u) => u.role === 'ADMIN').length,
    government: users.filter((u) => u.role === 'GOVERNMENT').length,
    principal: users.filter((u) => u.role === 'PRINCIPAL').length,
    teacher: users.filter((u) => u.role === 'TEACHER').length,
    student: users.filter((u) => u.role === 'STUDENT').length,
  };

  const roleConfigs = [
    { key: 'ADMIN', label: 'Admin', icon: Shield, color: 'from-red-500 to-rose-500', count: usersByRole.ADMIN.length },
    { key: 'GOVERNMENT', label: 'Government', icon: Shield, color: 'from-orange-500 to-amber-500', count: usersByRole.GOVERNMENT.length },
    { key: 'PRINCIPAL', label: 'Principal', icon: SchoolIcon, color: 'from-emerald-500 to-teal-500', count: usersByRole.PRINCIPAL.length },
    { key: 'TEACHER', label: 'Teacher', icon: BookOpen, color: 'from-purple-500 to-pink-500', count: usersByRole.TEACHER.length },
    { key: 'STUDENT', label: 'Student', icon: GraduationCap, color: 'from-blue-500 to-cyan-500', count: usersByRole.STUDENT.length },
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
              <button
                onClick={() => router.push('/government')}
                className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">User Management</h1>
                  <p className="text-xs text-muted-foreground">System-wide user accounts</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <p className="text-sm text-muted-foreground mb-2">Total Users</p>
            <p className="text-3xl font-bold">{roleCounts.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-muted-foreground">Admin</p>
            </div>
            <p className="text-2xl font-bold">{roleCounts.admin}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <p className="text-sm text-muted-foreground">Government</p>
            </div>
            <p className="text-2xl font-bold">{roleCounts.government}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <SchoolIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-muted-foreground">Principal</p>
            </div>
            <p className="text-2xl font-bold">{roleCounts.principal}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <p className="text-sm text-muted-foreground">Teacher</p>
            </div>
            <p className="text-2xl font-bold">{roleCounts.teacher}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-muted-foreground">Student</p>
            </div>
            <p className="text-2xl font-bold">{roleCounts.student}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>

              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">All Schools</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Users by Role Categories */}
        {isLoading ? (
          <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-sm text-muted-foreground">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || schoolFilter !== 'all'
                ? 'No users match your filters'
                : 'No users found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {roleConfigs.map((roleConfig, index) => {
              const users = usersByRole[roleConfig.key as keyof typeof usersByRole];
              const isExpanded = expandedRole === roleConfig.key;
              const Icon = roleConfig.icon;

              return (
                <motion.div
                  key={roleConfig.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedRole(isExpanded ? null : roleConfig.key)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/30 dark:hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${roleConfig.color} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold">{roleConfig.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {roleConfig.count} user{roleConfig.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/40">
                          {users.length === 0 ? (
                            <div className="p-8 text-center">
                              <p className="text-sm text-muted-foreground">No {roleConfig.label.toLowerCase()} users found</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-white/50 dark:bg-slate-800/50">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">School</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Created</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/40">
                                  {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition">
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <Mail className="w-3 h-3 text-muted-foreground" />
                                          <span className="text-sm">{user.email}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {user.phoneNumber ? (
                                          <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3" />
                                            {user.phoneNumber}
                                          </div>
                                        ) : (
                                          '-'
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-sm">{getSchoolName(user.schoolId)}</td>
                                      <td className="px-4 py-3">
                                        {user.status === 'active' ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                            <CheckCircle className="w-3 h-3" />
                                            Active
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium">
                                            <XCircle className="w-3 h-3" />
                                            Blocked
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
