'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';

interface ExamResult {
  exam: {
    id: string;
    name: string;
    totalMarks: number;
    examDate: string;
  };
  score: number;
  grade: string;
}

interface ExamResultsCardProps {
  language: 'en' | 'pa';
}

export function ExamResultsCard({ language }: ExamResultsCardProps) {
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExamResults();
  }, []);

  const fetchExamResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('pragati_token');
      const studentId = localStorage.getItem('pragati_studentId');

      if (!token || !studentId) {
        setError('Authentication required');
        return;
      }

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(
        `${backendUrl}/api/assessments/students/${studentId}/latest`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 404) {
        // No exam results yet - this is normal for new students
        setExamResults([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch exam results');
      }

      const data = await response.json();
      setExamResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching exam results:', err);
      setError('Exam results will appear once they are published');
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
    en: {
      title: 'Exam Results',
      subtitle: 'Recent performance',
      noResults: 'No exam results available yet',
      marks: 'Marks',
      grade: 'Grade',
      date: 'Date',
      viewAll: 'View all results',
    },
    pa: {
      title: 'ਪ੍ਰੀਖਿਆ ਨਤੀਜੇ',
      subtitle: 'ਹਾਲੀਆ ਪ੍ਰਦਰਸ਼ਨ',
      noResults: 'ਅਜੇ ਤੱਕ ਕੋਈ ਪ੍ਰੀਖਿਆ ਨਤੀਜੇ ਉਪਲਬਧ ਨਹੀਂ',
      marks: 'ਅੰਕ',
      grade: 'ਗ੍ਰੇਡ',
      date: 'ਤਾਰੀਖ',
      viewAll: 'ਸਾਰੇ ਨਤੀਜੇ ਦੇਖੋ',
    },
  };

  const t = translations[language];

  const getGradeColor = (grade: string) => {
    const firstChar = grade.charAt(0).toUpperCase();
    switch (firstChar) {
      case 'A':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'B':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'C':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'D':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 hover:shadow-xl transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
            <p className="text-xs text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Results List */}
      {examResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{t.noResults}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {examResults.slice(0, 5).map((result, index) => (
            <div
              key={`${result.exam.id}-${index}`}
              className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/40 hover:bg-white/80 dark:hover:bg-slate-800/80 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">{result.exam.name}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getGradeColor(result.grade)}`}>
                  {result.grade}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {t.marks}: {result.score}/{result.exam.totalMarks}
                </span>
                <span>{new Date(result.exam.examDate).toLocaleDateString()}</span>
              </div>
              {/* Score Bar */}
              <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${(result.score / result.exam.totalMarks) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {examResults.length > 5 && (
            <button className="w-full text-xs text-primary hover:underline py-2">
              {t.viewAll} ({examResults.length})
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
