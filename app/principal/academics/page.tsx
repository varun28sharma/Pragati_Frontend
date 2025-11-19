'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Edit,
  Search,
  BookOpen,
  LogOut,
  UserCircle,
  X,
  Save,
  GraduationCap,
  Grid3x3,
  Upload,
} from 'lucide-react';

interface Grade {
  id: string;
  schoolId: string;
  name: string;
  level: number;
  isActive: boolean;
}

interface Section {
  id: string;
  gradeId: string;
  label: string;
}

interface Subject {
  id: string;
  schoolId: string;
  code: string;
  name: string;
}

type EditingItem = {
  type: 'grade' | 'section' | 'subject';
  data: Grade | Section | Subject;
};

type TabType = 'grades' | 'sections' | 'subjects';

export default function AcademicsManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('grades');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [principalName, setPrincipalName] = useState('Principal');
  const [schoolId, setSchoolId] = useState('');

  // Form states
  const [gradeForm, setGradeForm] = useState({ name: '', level: '', isActive: true });
  const [sectionForm, setSectionForm] = useState({ gradeId: '', label: '' });
  const [subjectForm, setSubjectForm] = useState({ code: '', name: '' });

  // Bulk form states
  const [bulkGradeForm, setBulkGradeForm] = useState({
    startLevel: '1',
    endLevel: '12',
    nameFormat: 'Grade {level}',
  });
  const [bulkSectionForm, setBulkSectionForm] = useState({
    gradeId: '',
    labels: 'A, B, C, D',
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

      const [gradesRes, sectionsRes, subjectsRes] = await Promise.all([
        fetch(`${backendUrl}/api/core/grades`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/sections`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!gradesRes.ok || !sectionsRes.ok || !subjectsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const gradesData = await gradesRes.json();
      const sectionsData = await sectionsRes.json();
      const subjectsData = await subjectsRes.json();

      setGrades(Array.isArray(gradesData) ? gradesData : []);
      setSections(Array.isArray(sectionsData) ? sectionsData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);

      // Get schoolId from localStorage or from the data
      const storedSchoolId = localStorage.getItem('pragati_schoolId');
      if (storedSchoolId) {
        setSchoolId(storedSchoolId);
      } else if (gradesData.length > 0) {
        setSchoolId(gradesData[0].schoolId);
      } else if (subjectsData.length > 0) {
        setSchoolId(subjectsData[0].schoolId);
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

  const handleCreateGrade = async () => {
    if (!gradeForm.name || !gradeForm.level) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/core/grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId,
          name: gradeForm.name,
          level: parseInt(gradeForm.level),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create grade');
      }

      resetForms();
      setShowCreateModal(false);

      if (token) {
        await fetchData(token);
      }
    } catch (err: any) {
      console.error('Error creating grade:', err);
      setError(err.message || 'Failed to create grade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSection = async () => {
    if (!sectionForm.gradeId || !sectionForm.label) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/core/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gradeId: sectionForm.gradeId,
          label: sectionForm.label,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create section');
      }

      resetForms();
      setShowCreateModal(false);

      if (token) {
        await fetchData(token);
      }
    } catch (err: any) {
      console.error('Error creating section:', err);
      setError(err.message || 'Failed to create section. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!subjectForm.code || !subjectForm.name) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/core/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId,
          code: subjectForm.code,
          name: subjectForm.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subject');
      }

      resetForms();
      setShowCreateModal(false);

      if (token) {
        await fetchData(token);
      }
    } catch (err: any) {
      console.error('Error creating subject:', err);
      setError(err.message || 'Failed to create subject. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGrade = async () => {
    if (!editingItem || editingItem.type !== 'grade') return;
    const grade = editingItem.data as Grade;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/core/grades/${grade.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: gradeForm.name,
          isActive: gradeForm.isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update grade');
      }

      setEditingItem(null);
      resetForms();

      if (token) {
        await fetchData(token);
      }
    } catch (err: any) {
      console.error('Error updating grade:', err);
      setError(err.message || 'Failed to update grade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSection = async () => {
    if (!editingItem || editingItem.type !== 'section') return;
    const section = editingItem.data as Section;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/core/sections/${section.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: sectionForm.label,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update section');
      }

      setEditingItem(null);
      resetForms();

      if (token) {
        await fetchData(token);
      }
    } catch (err: any) {
      console.error('Error updating section:', err);
      setError(err.message || 'Failed to update section. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingItem || editingItem.type !== 'subject') return;
    const subject = editingItem.data as Subject;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/core/subjects/${subject.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: subjectForm.code,
          name: subjectForm.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subject');
      }

      setEditingItem(null);
      resetForms();

      if (token) {
        await fetchData(token);
      }
    } catch (err: any) {
      console.error('Error updating subject:', err);
      setError(err.message || 'Failed to update subject. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkCreateGrades = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const schoolId = localStorage.getItem('pragati_schoolId') || '';

      if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
      }

      const response = await fetch(`${backendUrl}/api/core/grades/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId,
          startLevel: parseInt(bulkGradeForm.startLevel),
          endLevel: parseInt(bulkGradeForm.endLevel),
          nameFormat: bulkGradeForm.nameFormat,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create grades in bulk');
      }

      const result = await response.json();
      const count = result.grades?.length || (parseInt(bulkGradeForm.endLevel) - parseInt(bulkGradeForm.startLevel) + 1);
      
      setBulkGradeForm({ startLevel: '1', endLevel: '12', nameFormat: 'Grade {level}' });
      setShowBulkModal(false);

      if (token) {
        await fetchData(token);
      }

      alert(`Successfully created ${count} grades!`);
    } catch (err: any) {
      console.error('Error creating grades in bulk:', err);
      setError(err.message || 'Failed to create grades in bulk. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkCreateSections = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      // Parse labels from comma-separated string
      const labels = bulkSectionForm.labels
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (labels.length === 0) {
        throw new Error('Please enter at least one section label');
      }

      const response = await fetch(`${backendUrl}/api/core/sections/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gradeId: parseInt(bulkSectionForm.gradeId),
          labels,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create sections in bulk');
      }

      const result = await response.json();
      const count = result.sections?.length || labels.length;
      
      setBulkSectionForm({ gradeId: '', labels: 'A, B, C, D' });
      setShowBulkModal(false);

      if (token) {
        await fetchData(token);
      }

      alert(`Successfully created ${count} sections!`);
    } catch (err: any) {
      console.error('Error creating sections in bulk:', err);
      setError(err.message || 'Failed to create sections in bulk. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForms = () => {
    setGradeForm({ name: '', level: '', isActive: true });
    setSectionForm({ gradeId: '', label: '' });
    setSubjectForm({ code: '', name: '' });
    setError(null);
  };

  const handleEditGrade = (grade: Grade) => {
    setEditingItem({ type: 'grade', data: grade });
    setGradeForm({ name: grade.name, level: grade.level.toString(), isActive: grade.isActive });
  };

  const handleEditSection = (section: Section) => {
    setEditingItem({ type: 'section', data: section });
    setSectionForm({ gradeId: section.gradeId, label: section.label });
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingItem({ type: 'subject', data: subject });
    setSubjectForm({ code: subject.code, name: subject.name });
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

  const getGradeName = (gradeId: string) => {
    const grade = grades.find((g) => g.id === gradeId);
    return grade ? grade.name : 'Unknown';
  };

  const filteredGrades = grades.filter((grade) =>
    grade.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSections = sections.filter((section) => {
    const gradeName = getGradeName(section.gradeId);
    return (
      section.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gradeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase())
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
                <h1 className="text-sm sm:text-lg font-bold">Academic Management</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Manage grades, sections, and subjects
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition"
              >
                <Plus className="w-4 h-4" />
                Add {activeTab === 'grades' ? 'Grade' : activeTab === 'sections' ? 'Section' : 'Subject'}
              </button>

              {(activeTab === 'grades' || activeTab === 'sections') && (
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-white/60 text-slate-700 dark:text-slate-300 text-sm font-medium hover:shadow-lg hover:bg-white/90 dark:hover:bg-slate-800/90 backdrop-blur-xl transition"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Create
                </button>
              )}

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

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 rounded-lg bg-primary text-white"
              >
                <Plus className="w-5 h-5" />
              </button>
              {(activeTab === 'grades' || activeTab === 'sections') && (
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-white/60 text-slate-700 dark:text-slate-300"
                >
                  <Upload className="w-5 h-5" />
                </button>
              )}
            </div>
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
                  setActiveTab('grades');
                  setSearchQuery('');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'grades'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Grades
              </button>
              <button
                onClick={() => {
                  setActiveTab('sections');
                  setSearchQuery('');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'sections'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Sections
              </button>
              <button
                onClick={() => {
                  setActiveTab('subjects');
                  setSearchQuery('');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'subjects'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Subjects
              </button>
            </div>
          </motion.div>

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
                placeholder={`Search ${activeTab}...`}
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
              <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
            </div>
          )}

          {/* Grades Table */}
          {!isLoading && !error && activeTab === 'grades' && (
            <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Level</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/40">
                    {filteredGrades.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center">
                          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">No grades found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredGrades.map((grade) => (
                        <tr key={grade.id} className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3 text-sm font-medium">{grade.name}</td>
                          <td className="px-4 py-3 text-sm">{grade.level}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                grade.isActive
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {grade.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleEditGrade(grade)}
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

          {/* Sections Table */}
          {!isLoading && !error && activeTab === 'sections' && (
            <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Label</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Grade</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/40">
                    {filteredSections.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center">
                          <Grid3x3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">No sections found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredSections.map((section) => (
                        <tr key={section.id} className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3 text-sm font-medium">{section.label}</td>
                          <td className="px-4 py-3 text-sm">{getGradeName(section.gradeId)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleEditSection(section)}
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

          {/* Subjects Table */}
          {!isLoading && !error && activeTab === 'subjects' && (
            <div className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/40">
                    {filteredSubjects.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center">
                          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">No subjects found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredSubjects.map((subject) => (
                        <tr key={subject.id} className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3 text-sm font-medium">{subject.code}</td>
                          <td className="px-4 py-3 text-sm">{subject.name}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleEditSubject(subject)}
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
      {(showCreateModal || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/40 bg-white dark:bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {editingItem
                  ? `Edit ${editingItem.type === 'grade' ? 'Grade' : editingItem.type === 'section' ? 'Section' : 'Subject'}`
                  : `Add New ${activeTab === 'grades' ? 'Grade' : activeTab === 'sections' ? 'Section' : 'Subject'}`}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                  resetForms();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(activeTab === 'grades' || editingItem?.type === 'grade') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Grade Name</label>
                  <input
                    type="text"
                    value={gradeForm.name}
                    onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                    placeholder="e.g., Grade 8"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Level</label>
                  <input
                    type="number"
                    value={gradeForm.level}
                    onChange={(e) => setGradeForm({ ...gradeForm, level: e.target.value })}
                    placeholder="e.g., 8"
                    disabled={!!editingItem}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                {editingItem && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
                    <select
                      value={gradeForm.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setGradeForm({ ...gradeForm, isActive: e.target.value === 'active' })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'sections' || editingItem?.type === 'section') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Grade</label>
                  <select
                    value={sectionForm.gradeId}
                    onChange={(e) => setSectionForm({ ...sectionForm, gradeId: e.target.value })}
                    disabled={!!editingItem}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select grade</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Section Label</label>
                  <input
                    type="text"
                    value={sectionForm.label}
                    onChange={(e) => setSectionForm({ ...sectionForm, label: e.target.value })}
                    placeholder="e.g., A, B, C"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            )}

            {(activeTab === 'subjects' || editingItem?.type === 'subject') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Subject Code</label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    placeholder="e.g., MATH8"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    placeholder="e.g., Mathematics"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                  resetForms();
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingItem) {
                    if (editingItem.type === 'grade') handleUpdateGrade();
                    else if (editingItem.type === 'section') handleUpdateSection();
                    else handleUpdateSubject();
                  } else {
                    if (activeTab === 'grades') handleCreateGrade();
                    else if (activeTab === 'sections') handleCreateSection();
                    else handleCreateSubject();
                  }
                }}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Creation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/40 bg-white dark:bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                Bulk Create {activeTab === 'grades' ? 'Grades' : 'Sections'}
              </h3>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkGradeForm({ startLevel: '1', endLevel: '12', nameFormat: 'Grade {level}' });
                  setBulkSectionForm({ gradeId: '', labels: 'A, B, C, D' });
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTab === 'grades' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Start Level</label>
                  <input
                    type="number"
                    value={bulkGradeForm.startLevel}
                    onChange={(e) => setBulkGradeForm({ ...bulkGradeForm, startLevel: e.target.value })}
                    placeholder="e.g., 1"
                    min="1"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">End Level</label>
                  <input
                    type="number"
                    value={bulkGradeForm.endLevel}
                    onChange={(e) => setBulkGradeForm({ ...bulkGradeForm, endLevel: e.target.value })}
                    placeholder="e.g., 12"
                    min="1"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Name Format</label>
                  <input
                    type="text"
                    value={bulkGradeForm.nameFormat}
                    onChange={(e) => setBulkGradeForm({ ...bulkGradeForm, nameFormat: e.target.value })}
                    placeholder="Use {level} as placeholder"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Example: &quot;Grade &#123;level&#125;&quot; will create &quot;Grade 1&quot;, &quot;Grade 2&quot;, etc.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Grade</label>
                  <select
                    value={bulkSectionForm.gradeId}
                    onChange={(e) => setBulkSectionForm({ ...bulkSectionForm, gradeId: e.target.value })}
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
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Section Labels</label>
                  <input
                    type="text"
                    value={bulkSectionForm.labels}
                    onChange={(e) => setBulkSectionForm({ ...bulkSectionForm, labels: e.target.value })}
                    placeholder="e.g., A, B, C, D"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter section labels separated by commas
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkGradeForm({ startLevel: '1', endLevel: '12', nameFormat: 'Grade {level}' });
                  setBulkSectionForm({ gradeId: '', labels: 'A, B, C, D' });
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'grades') handleBulkCreateGrades();
                  else handleBulkCreateSections();
                }}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isSubmitting ? 'Creating...' : 'Bulk Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
