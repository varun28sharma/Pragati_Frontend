'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Edit,
  Search,
  GraduationCap,
  LogOut,
  UserCircle,
  X,
  Save,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
} from 'lucide-react';

interface Student {
  id: string;
  schoolId: string;
  classroomId: string;
  classTeacherId: string;
  code: string;
  phoneNumber: string | null;
  firstName: string;
  lastName: string;
  gender: string | null;
  dateOfBirth: string | null;
  gradeLevel: number;
  sectionLabel: string;
  active: boolean;
  enrolledAt: string;
}

interface Classroom {
  id: string;
  grade: { id: string; name: string; level: number };
  section: { id: string; label: string };
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

export default function StudentsManagementPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [principalName, setPrincipalName] = useState('Principal');
  const [schoolId, setSchoolId] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    code: '',
    phoneNumber: '',
    classroomId: '',
    classTeacherId: '',
    gender: '',
    dateOfBirth: '',
    enrolledAt: new Date().toISOString().split('T')[0],
    isActive: true,
  });

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
      fetchData(token);
    }
  }, [router]);

  const fetchData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      
      const [studentsRes, classroomsRes, teachersRes] = await Promise.all([
        fetch(`${backendUrl}/api/core/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/classrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!studentsRes.ok || !classroomsRes.ok || !teachersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const studentsData = await studentsRes.json();
      const classroomsData = await classroomsRes.json();
      const teachersData = await teachersRes.json();

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);

      // Get schoolId from localStorage or from the data
      const storedSchoolId = localStorage.getItem('pragati_schoolId');
      if (storedSchoolId) {
        setSchoolId(storedSchoolId);
      } else if (studentsData.length > 0) {
        setSchoolId(studentsData[0].schoolId);
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

  const handleCreateStudent = async () => {
    if (!formData.firstName || !formData.lastName || !formData.code || !formData.classroomId || !formData.classTeacherId) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const classroom = classrooms.find(c => c.id === formData.classroomId);

      const response = await fetch(`${backendUrl}/api/core/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId,
          classroomId: formData.classroomId,
          classTeacherId: formData.classTeacherId,
          code: formData.code,
          phoneNumber: formData.phoneNumber || undefined,
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          gradeLevel: classroom?.grade.level,
          sectionLabel: classroom?.section.label,
          enrolledAt: formData.enrolledAt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create student');
      }

      resetForm();
      setShowCreateModal(false);

      if (token) {
        await fetchData(token);
      }
    } catch (err) {
      console.error('Error creating student:', err);
      setError('Failed to create student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/core/students/${editingStudent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber || undefined,
          classroomId: formData.classroomId,
          gender: formData.gender || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          active: formData.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update student');
      }

      setEditingStudent(null);
      resetForm();

      if (token) {
        await fetchData(token);
      }
    } catch (err) {
      console.error('Error updating student:', err);
      setError('Failed to update student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      code: '',
      phoneNumber: '',
      classroomId: '',
      classTeacherId: '',
      gender: '',
      dateOfBirth: '',
      enrolledAt: new Date().toISOString().split('T')[0],
      isActive: true,
    });
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      code: student.code,
      phoneNumber: student.phoneNumber || '',
      classroomId: student.classroomId,
      classTeacherId: student.classTeacherId,
      gender: student.gender || '',
      dateOfBirth: student.dateOfBirth || '',
      enrolledAt: student.enrolledAt,
      isActive: student.active,
    });
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

  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.code.toLowerCase().includes(searchLower)
    );
  });

  const getClassroomLabel = (classroomId: string) => {
    const classroom = classrooms.find(c => c.id === classroomId);
    return classroom ? `${classroom.grade.name} - ${classroom.section.label}` : 'N/A';
  };

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
                <h1 className="text-sm sm:text-lg font-bold">Student Management</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {students.length} total students
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition"
              >
                <Plus className="w-4 h-4" />
                Add Student
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
                placeholder="Search by name or student code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/60 bg-white/70 dark:bg-slate-950/60 backdrop-blur-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </motion.div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/70 dark:bg-red-950/40 backdrop-blur-xl p-6 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading students...</p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Classroom</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/40">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">No students found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition"
                        >
                          <td className="px-4 py-3 text-sm font-medium">{student.code}</td>
                          <td className="px-4 py-3 text-sm">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm">{getClassroomLabel(student.classroomId)}</td>
                          <td className="px-4 py-3 text-sm">{student.phoneNumber || '-'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                student.active
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {student.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition"
                            >
                              <Edit className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-2xl border border-white/40 bg-white dark:bg-slate-900 p-6 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingStudent(null);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {!editingStudent && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Student Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., STU-0001"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1234567890"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">Select gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Classroom</label>
                  <select
                    value={formData.classroomId}
                    onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">Select classroom</option>
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.grade.name} - {classroom.section.label}
                      </option>
                    ))}
                  </select>
                </div>

                {!editingStudent && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Class Teacher</label>
                    <select
                      value={formData.classTeacherId}
                      onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <option value="">Select teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                {editingStudent && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingStudent(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={editingStudent ? handleUpdateStudent : handleCreateStudent}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : editingStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
