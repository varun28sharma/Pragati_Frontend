"use client";

import React, { useState, useEffect } from 'react';

interface Exam {
  id: string;
  name: string;
  date: string;
}

const ExamsPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [newExam, setNewExam] = useState({ name: '', date: '' });

  useEffect(() => {
    // Fetch exams
    const fetchExams = async () => {
      try {
        const response = await fetch('/api/assessments/exams');
        const data = await response.json();
        setExams(data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };

    fetchExams();
  }, []);

  const handleCreateExam = async () => {
    try {
      const response = await fetch('/api/assessments/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExam),
      });

      if (response.ok) {
        const createdExam: Exam = await response.json();
        setExams((prev) => [...prev, createdExam]);
        setNewExam({ name: '', date: '' });
      } else {
        console.error('Failed to create exam');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Exams</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Create New Exam</h2>
        <input
          type="text"
          placeholder="Exam Name"
          value={newExam.name}
          onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
          className="border p-2 rounded mr-2"
        />
        <input
          type="date"
          value={newExam.date}
          onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
          className="border p-2 rounded mr-2"
        />
        <button
          onClick={handleCreateExam}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Exam
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Upcoming Exams</h2>
        <ul>
          {exams.map((exam) => (
            <li key={exam.id} className="border p-2 mb-2 rounded">
              <p>Name: {exam.name}</p>
              <p>Date: {exam.date}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExamsPage;