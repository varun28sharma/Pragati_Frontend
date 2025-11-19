'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Edit,
  Search,
  School,
  Users,
  LogOut,
  UserCircle,
  X,
  Save,
} from 'lucide-react';

interface Grade {
  id: string;
  name: string;
  level: number;
}

interface Section {
  id: string;
  label: string;
}

interface Classroom {
  id: string;
  schoolId: string;
  grade: { id: string; name: string; level: number };
  section: { id: string; label: string };
  academicYear: string;
}

export default function ClassroomsManagementPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [principalName, setPrincipalName] = useState('Principal');
  const [schoolId, setSchoolId] = useState('');

  // Form state
  const [gradeId, setGradeId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');
      const name = localStorage.getItem('pragati_name') || 'Principal';

      if (!token || role !== 'PRINCIPAL') {
        router.push('/login/principal');
        return;
      }

      setPrincipalName(name);
      
      // Set default academic year
      const currentYear = new Date().getFullYear();
      setAcademicYear(`${currentYear}-${currentYear + 1}`);

      fetchData(token);
    }
  }, [router]);

  const fetchData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      
      const [classroomsRes, gradesRes, sectionsRes] = await Promise.all([
        fetch(`${backendUrl}/api/core/classrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/grades`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/sections`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!classroomsRes.ok || !gradesRes.ok || !sectionsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const classroomsData = await classroomsRes.json();
      const gradesData = await gradesRes.json();
      const sectionsData = await sectionsRes.json();

      setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
      setGrades(Array.isArray(gradesData) ? gradesData : []);
      setSections(Array.isArray(sectionsData) ? sectionsData : []);

      // Get schoolId from localStorage or from the data
      const storedSchoolId = localStorage.getItem('pragati_schoolId');
      if (storedSchoolId) {
        setSchoolId(storedSchoolId);
      } else if (classroomsData.length > 0) {
        setSchoolId(classroomsData[0].schoolId);
      } else {
        // Fetch from schools API as fallback
        const schoolsRes = await fetch(`${backendUrl}/api/core/schools`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (schoolsRes.ok) {
          const schoolsData = await schoolsRes.json();
          if (Array.isArray(schoolsData) && schoolsData.length > 0) {
            setSchoolId(schoolsData[0].id);
          }
        }
      }
    } catch (err) {
      setError('Unable to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClassroom = async () => {
    if (!gradeId || !sectionId || !academicYear) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/core/classrooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId,
          gradeId,
          sectionId,
          academicYear,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create classroom');
      }

      // Reset form and close modal
      setGradeId('');
      setSectionId('');
      setShowCreateModal(false);

      // Refresh classrooms
      if (token) {
        await fetchData(token);
      }
    } catch (err) {
      console.error('Error creating classroom:', err);
      setError('Failed to create classroom. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClassroom = async () => {
    if (!editingClassroom || !academicYear) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/core/classrooms/${editingClassroom.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ academicYear }),
      });

      if (!response.ok) {
        throw new Error('Failed to update classroom');
      }

      setEditingClassroom(null);

      // Refresh classrooms
      if (token) {
        await fetchData(token);
      }
    } catch (err) {
      console.error('Error updating classroom:', err);
      setError('Failed to update classroom. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const filteredClassrooms = classrooms.filter((classroom) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      classroom.grade.name.toLowerCase().includes(searchLower) ||
      classroom.section.label.toLowerCase().includes(searchLower) ||
      classroom.academicYear.toLowerCase().includes(searchLower)
    );
  });

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
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/principal')}
                className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm sm:text-lg font-bold">Classroom Management</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {classrooms.length} total classrooms
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition"
              >
                <Plus className="w-4 h-4" />
                Create Classroom
              </button>

              <div className="inline-flex items-center rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 px-1 py-0.5 text-[11px] shadow-sm backdrop-blur-xl">
                <button type="button" className="px-2 py-0.5 rounded-full bg-primary text-white font-medium">
                  English
                </button>
                <button
                  type="button"
                  className="px-2 py-0.5 rounded-full text-muted-foreground hover:bg-white/80 dark:hover:bg-slate-800/80 transition"
                >
                  ਪੰਜਾਬੀ
                </button>
              </div>

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

            {/* Mobile Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="md:hidden p-2 rounded-lg bg-primary text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 sm:pt-36 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by grade, section, or academic year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/60 bg-white/70 dark:bg-slate-950/60 backdrop-blur-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/70 dark:bg-red-950/40 backdrop-blur-xl p-6 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading classrooms...</p>
            </div>
          )}

          {/* Classrooms Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClassrooms.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-12 text-center">
                  <School className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No classrooms found</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first classroom
                  </button>
                </div>
              ) : (
                filteredClassrooms.map((classroom, index) => (
                  <motion.div
                    key={classroom.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                        <School className="w-5 h-5" />
                      </div>
                      <button
                        onClick={() => {
                          setEditingClassroom(classroom);
                          setAcademicYear(classroom.academicYear);
                        }}
                        className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold mb-1">
                      {classroom.grade.name} - {classroom.section.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Academic Year: {classroom.academicYear}
                    </p>

                    <div className="pt-3 border-t border-white/40">
                      <button
                        onClick={() => router.push(`/principal/classrooms/${classroom.id}/students`)}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                      >
                        <Users className="w-3.5 h-3.5" />
                        View Students
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Classroom Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/40 bg-white dark:bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Create New Classroom</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Grade</label>
                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Select a grade</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Section</label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Select a section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      Section {section.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g., 2025-2026"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClassroom}
                  disabled={isSubmitting || !gradeId || !sectionId || !academicYear}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Classroom Modal */}
      {editingClassroom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/40 bg-white dark:bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                Edit {editingClassroom.grade.name} - {editingClassroom.section.label}
              </h3>
              <button
                onClick={() => setEditingClassroom(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g., 2025-2026"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingClassroom(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateClassroom}
                  disabled={isSubmitting || !academicYear}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
