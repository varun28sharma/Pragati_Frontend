"use client";

import React, { useState, useEffect } from 'react';

interface Timetable {
  id: string;
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
}

const TimetablesPage = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);

  useEffect(() => {
    // Fetch timetables data
    const fetchTimetables = async () => {
      try {
        const response = await fetch('/api/timetables/teacher');
        const data = await response.json();
        setTimetables(data);
      } catch (error) {
        console.error('Error fetching timetables:', error);
      }
    };

    fetchTimetables();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Class Timetables</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timetables.map((timetable) => (
          <div key={timetable.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">{timetable.day}</h2>
            <p>Subject: {timetable.subject}</p>
            <p>Time: {timetable.startTime} - {timetable.endTime}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetablesPage;