'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Search,
  LogOut,
  UserCircle,
  X,
  Save,
  Users,
  BookOpen,
  UserPlus,
  Trash2,
} from 'lucide-react';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  schoolId: string;
}

interface Classroom {
  id: string;
  grade: { id: string; name: string; level: number };
  section: { id: string; label: string };
  academicYear: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  classroomId: string;
}

interface TeacherSubject {
  id: string;
  teacherId: string;
  subjectId: string;
  classroomId: string;
  startDate: string;
  endDate: string | null;
  teacher?: { firstName: string; lastName: string };
  subject?: { code: string; name: string };
  classroom?: { grade: { name: string }; section: { label: string } };
}

interface StudentGroup {
  id: string;
  schoolId: string;
  name: string;
  description: string | null;
  visibility: string;
  members: Array<{ studentId: string }>;
}

type TabType = 'teacher-subjects' | 'student-subjects' | 'groups';

export default function EnrollmentManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('teacher-subjects');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [principalName, setPrincipalName] = useState('Principal');
  const [schoolId, setSchoolId] = useState('');

  // Form states
  const [teacherSubjectForm, setTeacherSubjectForm] = useState({
    teacherId: '',
    subjectId: '',
    classroomId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const [studentSubjectForm, setStudentSubjectForm] = useState({
    studentId: '',
    teacherSubjectId: '',
    enrolledOn: new Date().toISOString().split('T')[0],
  });

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    visibility: 'manual',
  });

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupStudentIds, setGroupStudentIds] = useState<string[]>([]);

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

      const [teachersRes, subjectsRes, classroomsRes, studentsRes, groupsRes, teacherSubjectsRes] = await Promise.all([
        fetch(`${backendUrl}/api/core/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/classrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/enrollment/student-groups`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/enrollment/teacher-subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const teachersData = await teachersRes.json();
      const subjectsData = await subjectsRes.json();
      const classroomsData = await classroomsRes.json();
      const studentsData = await studentsRes.json();
      const groupsData = await groupsRes.json();
      const teacherSubjectsData = teacherSubjectsRes.ok ? await teacherSubjectsRes.json() : [];

      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setStudentGroups(Array.isArray(groupsData) ? groupsData : []);
      setTeacherSubjects(Array.isArray(teacherSubjectsData) ? teacherSubjectsData : []);

      // Get schoolId from localStorage or from the data
      const storedSchoolId = localStorage.getItem('pragati_schoolId');
      if (storedSchoolId) {
        setSchoolId(storedSchoolId);
      } else if (subjectsData.length > 0) {
        setSchoolId(subjectsData[0].schoolId);
      } else if (studentsData.length > 0) {
        setSchoolId(studentsData[0].schoolId);
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

  const handleCreateTeacherSubject = async () => {
    if (!teacherSubjectForm.teacherId || !teacherSubjectForm.subjectId || !teacherSubjectForm.classroomId) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/enrollment/teacher-subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacherId: teacherSubjectForm.teacherId,
          subjectId: teacherSubjectForm.subjectId,
          classroomId: teacherSubjectForm.classroomId,
          startDate: teacherSubjectForm.startDate,
          endDate: teacherSubjectForm.endDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create teacher-subject assignment');
      }

      resetForms();
      setShowCreateModal(false);

      if (token) {
        await fetchData(token);
      }
    } catch (err: any) {
      console.error('Error creating teacher-subject:', err);
      setError(err.message || 'Failed to create assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStudentSubject = async () => {
    if (!studentSubjectForm.studentId || !studentSubjectForm.teacherSubjectId) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/enrollment/student-subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: studentSubjectForm.studentId,
          teacherSubjectId: studentSubjectForm.teacherSubjectId,
          enrolledOn: studentSubjectForm.enrolledOn,
          status: 'active',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enroll student');
      }

      resetForms();
      setShowCreateModal(false);

      if (token) {
        await fetchData(token);
      }
    } catch (err: any) {
      console.error('Error enrolling student:', err);
      setError(err.message || 'Failed to enroll student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/enrollment/student-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId,
          name: groupForm.name,
          description: groupForm.description || null,
          visibility: groupForm.visibility,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create group');
      }

      resetForms();
      setShowCreateModal(false);

      if (token) {
        await fetchData(token);
      }
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddGroupMembers = async () => {
    if (!selectedGroup || groupStudentIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const userId = localStorage.getItem('pragati_userId');

      const response = await fetch(`${backendUrl}/api/enrollment/student-groups/${selectedGroup}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentIds: groupStudentIds,
          addedBy: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add members');
      }

      setSelectedGroup(null);
      setGroupStudentIds([]);

      if (token) {
        await fetchData(token);
      }
    } catch (err: any) {
      console.error('Error adding members:', err);
      setError(err.message || 'Failed to add members. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForms = () => {
    setTeacherSubjectForm({
      teacherId: '',
      subjectId: '',
      classroomId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setStudentSubjectForm({
      studentId: '',
      teacherSubjectId: '',
      enrolledOn: new Date().toISOString().split('T')[0],
    });
    setGroupForm({
      name: '',
      description: '',
      visibility: 'manual',
    });
    setError(null);
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

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? `${subject.code} - ${subject.name}` : 'Unknown';
  };

  const getClassroomLabel = (classroomId: string) => {
    const classroom = classrooms.find((c) => c.id === classroomId);
    return classroom ? `${classroom.grade.name} - ${classroom.section.label}` : 'Unknown';
  };

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName} (${student.code})` : 'Unknown';
  };

  const filteredTeacherSubjects = teacherSubjects.filter((ts) => {
    const query = searchQuery.toLowerCase();
    const teacherName = ts.teacher ? `${ts.teacher.firstName} ${ts.teacher.lastName}`.toLowerCase() : '';
    const subjectName = ts.subject?.name.toLowerCase() || '';
    const classroom = ts.classroom ? `${ts.classroom.grade.name} ${ts.classroom.section.label}`.toLowerCase() : '';
    return teacherName.includes(query) || subjectName.includes(query) || classroom.includes(query);
  });

  const filteredGroups = studentGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <h1 className="text-sm sm:text-lg font-bold">Enrollment Management</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Assign teachers, enroll students, and manage groups
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition"
              >
                <Plus className="w-4 h-4" />
                {activeTab === 'teacher-subjects' && 'Assign Teacher'}
                {activeTab === 'student-subjects' && 'Enroll Student'}
                {activeTab === 'groups' && 'Create Group'}
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
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-2"
          >
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab('teacher-subjects');
                  setSearchQuery('');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activeTab === 'teacher-subjects'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Teacher Assignments</span>
                <span className="sm:hidden">Teachers</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('student-subjects');
                  setSearchQuery('');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activeTab === 'student-subjects'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Student Enrollment</span>
                <span className="sm:hidden">Students</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('groups');
                  setSearchQuery('');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activeTab === 'groups'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4" />
                Groups
              </button>
            </div>
          </motion.div>

          {/* Search Bar (only for groups) */}
          {activeTab === 'groups' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-3"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/60 bg-white/70 dark:bg-slate-950/60 backdrop-blur-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </motion.div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/70 dark:bg-red-950/40 backdrop-blur-xl p-6 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
            </div>
          )}

          {/* Teacher-Subjects Tab */}
          {!isLoading && !error && activeTab === 'teacher-subjects' && (
            <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
              {filteredTeacherSubjects.length === 0 ? (
                <div className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {teacherSubjects.length === 0 
                      ? 'No teacher-subject assignments found.'
                      : 'No assignments match your search.'}
                    <br />
                    {teacherSubjects.length === 0 && 'Click "Assign Teacher" to create a new assignment.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/50 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Teacher</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Classroom</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">End Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40">
                      {filteredTeacherSubjects.map((ts) => (
                        <tr key={ts.id} className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition">
                          <td className="px-4 py-3 text-sm">
                            {ts.teacher ? `${ts.teacher.firstName} ${ts.teacher.lastName}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {ts.subject ? (
                              <div>
                                <div className="font-medium">{ts.subject.name}</div>
                                <div className="text-xs text-muted-foreground">{ts.subject.code}</div>
                              </div>
                            ) : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {ts.classroom ? (
                              <span>{ts.classroom.grade.name} - {ts.classroom.section.label}</span>
                            ) : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {new Date(ts.startDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {ts.endDate && ts.endDate !== '1970-01-01' && new Date(ts.endDate).getTime() > 0
                              ? new Date(ts.endDate).toLocaleDateString()
                              : 'Ongoing'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Student-Subjects Tab */}
          {!isLoading && !error && activeTab === 'student-subjects' && (
            <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6">
              <p className="text-sm text-muted-foreground text-center">
                Student enrollments will be displayed here once created.
                <br />
                Click "Enroll Student" to add a student to a subject.
              </p>
            </div>
          )}

          {/* Groups Tab */}
          {!isLoading && !error && activeTab === 'groups' && (
            <div className="space-y-4">
              {filteredGroups.length === 0 ? (
                <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No groups found</p>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {group.visibility}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedGroup(group.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add Members
                      </button>
                    </div>

                    {group.members.length > 0 && (
                      <div className="border-t border-white/40 pt-4">
                        <h4 className="text-sm font-medium mb-2">Members:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {group.members.map((member, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 text-xs"
                            >
                              {getStudentName(member.studentId)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/40 bg-white dark:bg-slate-900 p-6 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {activeTab === 'teacher-subjects' && 'Assign Teacher to Subject'}
                {activeTab === 'student-subjects' && 'Enroll Student in Subject'}
                {activeTab === 'groups' && 'Create Student Group'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForms();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Teacher-Subject Form */}
            {activeTab === 'teacher-subjects' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Teacher</label>
                  <select
                    value={teacherSubjectForm.teacherId}
                    onChange={(e) =>
                      setTeacherSubjectForm({ ...teacherSubjectForm, teacherId: e.target.value })
                    }
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

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Subject</label>
                  <select
                    value={teacherSubjectForm.subjectId}
                    onChange={(e) =>
                      setTeacherSubjectForm({ ...teacherSubjectForm, subjectId: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Classroom</label>
                  <select
                    value={teacherSubjectForm.classroomId}
                    onChange={(e) =>
                      setTeacherSubjectForm({ ...teacherSubjectForm, classroomId: e.target.value })
                    }
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Start Date</label>
                    <input
                      type="date"
                      value={teacherSubjectForm.startDate}
                      onChange={(e) =>
                        setTeacherSubjectForm({ ...teacherSubjectForm, startDate: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={teacherSubjectForm.endDate}
                      onChange={(e) =>
                        setTeacherSubjectForm({ ...teacherSubjectForm, endDate: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Student-Subject Form */}
            {activeTab === 'student-subjects' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Student</label>
                  <select
                    value={studentSubjectForm.studentId}
                    onChange={(e) =>
                      setStudentSubjectForm({ ...studentSubjectForm, studentId: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">Select student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Teacher-Subject Assignment
                  </label>
                  <select
                    value={studentSubjectForm.teacherSubjectId}
                    onChange={(e) =>
                      setStudentSubjectForm({ ...studentSubjectForm, teacherSubjectId: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">Select assignment</option>
                    <option value="placeholder" disabled>
                      Create teacher assignments first
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Enrollment Date</label>
                  <input
                    type="date"
                    value={studentSubjectForm.enrolledOn}
                    onChange={(e) =>
                      setStudentSubjectForm({ ...studentSubjectForm, enrolledOn: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Group Form */}
            {activeTab === 'groups' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Group Name</label>
                  <input
                    type="text"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    placeholder="e.g., Remediation Batch"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    placeholder="e.g., Math help group"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Visibility</label>
                  <select
                    value={groupForm.visibility}
                    onChange={(e) => setGroupForm({ ...groupForm, visibility: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="manual">Manual</option>
                    <option value="dynamic">Dynamic</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForms();
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'teacher-subjects') handleCreateTeacherSubject();
                  else if (activeTab === 'student-subjects') handleCreateStudentSubject();
                  else handleCreateGroup();
                }}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Members Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-2xl border border-white/40 bg-white dark:bg-slate-900 p-6 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Add Members to Group</h3>
              <button
                onClick={() => {
                  setSelectedGroup(null);
                  setGroupStudentIds([]);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={groupStudentIds.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGroupStudentIds([...groupStudentIds, student.id]);
                      } else {
                        setGroupStudentIds(groupStudentIds.filter((id) => id !== student.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">
                    {student.firstName} {student.lastName} ({student.code})
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => {
                  setSelectedGroup(null);
                  setGroupStudentIds([]);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGroupMembers}
                disabled={isSubmitting || groupStudentIds.length === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {isSubmitting ? 'Adding...' : `Add ${groupStudentIds.length} Student${groupStudentIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
