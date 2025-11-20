'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  LogOut,
  UserCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  MapPin,
  School,
  User,
} from 'lucide-react';

interface Complaint {
  id: string;
  category: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  isAnonymous: boolean;
  student: { id: string; firstName: string; lastName: string; code: string } | null;
  classroom: {
    id: string;
    grade: { name: string };
    section: { label: string };
  };
  schoolId: string;
  schoolName?: string;
  resolutionNote: string | null;
  resolvedBy: { id: string; role: string; email: string } | null;
  resolvedAt: string | null;
  createdAt: string;
}

interface School {
  id: string;
  name: string;
  district: string;
}

export default function GovernmentComplaintsPage() {
  const router = useRouter();
  const [governmentName, setGovernmentName] = useState('Government Official');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');

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

      // Fetch schools first
      const schoolsRes = await fetch(`${backendUrl}/api/core/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
      const schoolsData = await schoolsRes.json();
      setSchools(schoolsData);

      // Fetch complaints for each school
      const complaintsPromises = schoolsData.map(async (school: School) => {
        try {
          const res = await fetch(`${backendUrl}/api/complaints?schoolId=${school.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) return [];
          const data = await res.json();
          
          // Add school name to each complaint
          return (data.items || []).map((c: Complaint) => ({
            ...c,
            schoolName: school.name,
          }));
        } catch (err) {
          console.error(`Error fetching complaints for school ${school.id}:`, err);
          return [];
        }
      });

      const allComplaints = (await Promise.all(complaintsPromises)).flat();
      setComplaints(allComplaints);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to load complaints data. Please try again.');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      case 'dismissed':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'in_progress':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'dismissed':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
      default:
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      searchQuery === '' ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.schoolName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    const matchesSchool = schoolFilter === 'all' || complaint.schoolId === schoolFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesSchool;
  });

  const categories = Array.from(new Set(complaints.map((c) => c.category)));
  const statusCounts = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === 'open').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    dismissed: complaints.filter((c) => c.status === 'dismissed').length,
  };

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
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Complaints Overview</h1>
                  <p className="text-xs text-muted-foreground">Monitor complaints across all schools</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <p className="text-sm text-muted-foreground mb-2">Total</p>
            <p className="text-3xl font-bold">{statusCounts.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{statusCounts.open}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{statusCounts.in_progress}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{statusCounts.resolved}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-muted-foreground">Dismissed</p>
            </div>
            <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{statusCounts.dismissed}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search complaints..."
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
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
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

        {/* Complaints List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/40">
            <h3 className="text-lg font-semibold">Complaints</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || schoolFilter !== 'all'
                  ? 'No complaints match your filters'
                  : 'No complaints submitted yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/40">
              {filteredComplaints.map((complaint) => {
                const StatusIcon = getStatusIcon(complaint.status);
                return (
                  <div
                    key={complaint.id}
                    className="p-6 hover:bg-white/30 dark:hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {complaint.status.replace('_', ' ')}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
                            {getCategoryLabel(complaint.category)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{complaint.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <School className="w-3 h-3" />
                            {complaint.schoolName}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {complaint.classroom.grade.name} - {complaint.classroom.section.label}
                          </div>
                          {!complaint.isAnonymous && complaint.student && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {complaint.student.firstName} {complaint.student.lastName} ({complaint.student.code})
                            </div>
                          )}
                          {complaint.isAnonymous && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-500/10 text-gray-600 dark:text-gray-400 text-[10px] font-medium">
                              Anonymous
                            </span>
                          )}
                          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {complaint.resolutionNote && (
                      <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                          Resolution Note
                        </p>
                        <p className="text-sm text-muted-foreground">{complaint.resolutionNote}</p>
                        {complaint.resolvedBy && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Resolved by {complaint.resolvedBy.role} ({complaint.resolvedBy.email})
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
