'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Edit,
  Save,
  X,
  ChevronDown,
  LogOut,
  UserCircle,
  BookOpen,
  MapPin,
  User,
} from 'lucide-react';

interface Classroom {
  id: string;
  schoolId: string;
  grade: { id: string; name: string };
  section: { id: string; label: string };
  academicYear: string;
}

interface TimetableEntry {
  id?: string;
  weekDay: number;
  period: number;
  startTime: string;
  endTime: string;
  teacherSubjectId?: string;
  label: string;
  location?: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  subject?: {
    id: string;
    code: string;
    name: string;
  };
}

interface TimetableResponse {
  classroomId: string;
  schoolId: string;
  entries: TimetableEntry[];
}

interface Subject {
  id: string;
  code: string;
  name: string;
  schoolId: string;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetablesPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{ weekDay: number; period: number } | null>(null);
  const [principalName, setPrincipalName] = useState('Principal');

  // Form state for editing
  const [formData, setFormData] = useState({
    label: '',
    startTime: '',
    endTime: '',
    location: '',
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
      fetchClassrooms(token);
      fetchSubjects(token);
    }
  }, [router]);

  const fetchSubjects = async (token: string) => {
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/core/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchClassrooms = async (token: string) => {
    setIsLoading(true);
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/core/classrooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classrooms');
      }

      const data = await response.json();
      setClassrooms(Array.isArray(data) ? data : []);
      
      // Auto-select first classroom if available
      if (data.length > 0) {
        setSelectedClassroom(data[0].id);
        fetchTimetable(token, data[0].id);
      }
    } catch (err) {
      setError('Unable to load classrooms. Please try again.');
      console.error('Error fetching classrooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimetable = async (token: string, classroomId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/timetables/classrooms/${classroomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timetable');
      }

      const data: TimetableResponse = await response.json();
      setTimetable(data.entries || []);
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setTimetable([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassroomChange = async (classroomId: string) => {
    setSelectedClassroom(classroomId);
    if (classroomId) {
      const token = localStorage.getItem('pragati_token');
      if (token) {
        await fetchTimetable(token, classroomId);
      }
    } else {
      setTimetable([]);
    }
    setIsEditing(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (weekDay: number, period: number) => {
    const existing = timetable.find((e) => e.weekDay === weekDay && e.period === period);
    
    if (existing) {
      setFormData({
        label: existing.label,
        startTime: existing.startTime,
        endTime: existing.endTime,
        location: existing.location || '',
      });
    } else {
      setFormData({
        label: '',
        startTime: '',
        endTime: '',
        location: '',
      });
    }
    
    setEditingEntry({ weekDay, period });
    setIsEditing(true);
  };

  const handleSaveEntry = () => {
    if (!editingEntry) return;

    const updatedTimetable = [...timetable];
    const existingIndex = updatedTimetable.findIndex(
      (e) => e.weekDay === editingEntry.weekDay && e.period === editingEntry.period
    );

    const newEntry: TimetableEntry = {
      weekDay: editingEntry.weekDay,
      period: editingEntry.period,
      label: formData.label,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location || undefined,
    };

    if (existingIndex >= 0) {
      updatedTimetable[existingIndex] = { ...updatedTimetable[existingIndex], ...newEntry };
    } else {
      updatedTimetable.push(newEntry);
    }

    setTimetable(updatedTimetable);
    setIsEditing(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (weekDay: number, period: number) => {
    setTimetable(timetable.filter((e) => !(e.weekDay === weekDay && e.period === period)));
  };

  const handleSaveTimetable = async () => {
    if (!selectedClassroom) return;

    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      // Strip IDs from entries before sending
      const entriesToSave = timetable.map(({ id, teacher, subject, ...entry }) => entry);

      const response = await fetch(`${backendUrl}/api/timetables/classrooms/${selectedClassroom}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ entries: entriesToSave }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save timetable');
      }

      const result = await response.json();
      console.log('Timetable saved successfully:', result);

      // Refresh timetable
      if (token) {
        await fetchTimetable(token, selectedClassroom);
      }

      alert(`Timetable saved successfully! Total entries: ${result.totalEntries || timetable.length}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save timetable. Please try again.');
      console.error('Error saving timetable:', err);
    } finally {
      setIsSaving(false);
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

  const getEntryForSlot = (weekDay: number, period: number): TimetableEntry | undefined => {
    return timetable.find((e) => e.weekDay === weekDay && e.period === period);
  };

  const selectedClassroomData = classrooms.find((c) => c.id === selectedClassroom);

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
                <h1 className="text-sm sm:text-lg font-bold">Timetables</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {selectedClassroomData
                    ? `${selectedClassroomData.grade.name} - ${selectedClassroomData.section.label}`
                    : 'Select a classroom'}
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 sm:pt-36 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Classroom Selector & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-xs font-medium text-muted-foreground mb-2">Select Classroom</label>
                <select
                  value={selectedClassroom}
                  onChange={(e) => handleClassroomChange(e.target.value)}
                  className="w-full rounded-lg border border-white/60 bg-white/70 dark:bg-slate-950/60 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.grade.name} - {classroom.section.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveTimetable}
                disabled={isSaving || !selectedClassroom}
                className="w-full sm:w-auto mt-6 inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Timetable'}
              </button>
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/70 dark:bg-red-950/40 backdrop-blur-xl p-4 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Timetable Grid */}
          {selectedClassroom && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-white/40">
                <h3 className="text-lg font-semibold">Weekly Schedule</h3>
                <p className="text-xs text-muted-foreground mt-1">Click on any slot to edit or add a class</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-white/50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground w-24">
                        Period
                      </th>
                      {WEEKDAYS.map((day, index) => (
                        <th key={index} className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/40">
                    {PERIODS.map((period) => (
                      <tr key={period} className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition">
                        <td className="px-3 py-3 text-xs font-medium text-muted-foreground">Period {period}</td>
                        {WEEKDAYS.map((_, weekDayIndex) => {
                          const weekDay = weekDayIndex + 1;
                          const entry = getEntryForSlot(weekDay, period);
                          
                          return (
                            <td key={weekDayIndex} className="px-2 py-2">
                              <button
                                onClick={() => handleEditEntry(weekDay, period)}
                                className={`w-full min-h-[80px] p-2 rounded-lg text-left transition ${
                                  entry
                                    ? 'bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20'
                                    : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-800/70 border border-dashed border-gray-300 dark:border-gray-700'
                                }`}
                              >
                                {entry ? (
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold text-foreground truncate">{entry.label}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        {entry.startTime} - {entry.endTime}
                                      </span>
                                    </div>
                                    {entry.location && (
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{entry.location}</span>
                                      </div>
                                    )}
                                    {entry.teacher && (
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <User className="w-3 h-3" />
                                        <span className="truncate">
                                          {entry.teacher.firstName} {entry.teacher.lastName}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <Plus className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Edit Entry Modal */}
      {isEditing && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/40 bg-white dark:bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                Edit {WEEKDAYS[editingEntry.weekDay - 1]} - Period {editingEntry.period}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingEntry(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Subject
                </label>
                <select
                  value={formData.label}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      label: e.target.value,
                    });
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Select a subject or enter custom</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select from available subjects or type a custom label below
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Custom Label (optional)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Mathematics, Break, Advisory"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Override with a custom label if needed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Room 201"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                {getEntryForSlot(editingEntry.weekDay, editingEntry.period) && (
                  <button
                    onClick={() => {
                      handleDeleteEntry(editingEntry.weekDay, editingEntry.period);
                      setIsEditing(false);
                      setEditingEntry(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-500/20 transition"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingEntry(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEntry}
                  disabled={!formData.label || !formData.startTime || !formData.endTime}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
