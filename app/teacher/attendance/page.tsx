"use client";

import React, { useState, useEffect } from 'react';

const AttendancePage = () => {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({ date: '', classroomId: '' });

  useEffect(() => {
    // Fetch attendance sessions
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/attendance/classrooms/1'); // Replace with dynamic classroomId
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, []);

  const handleCreateSession = async () => {
    try {
      const response = await fetch('/api/attendance/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });

      if (response.ok) {
        const createdSession = await response.json();
        setSessions((prev) => [...prev, createdSession]);
        setNewSession({ date: '', classroomId: '' });
      } else {
        console.error('Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Attendance</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Create New Session</h2>
        <input
          type="date"
          value={newSession.date}
          onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
          className="border p-2 rounded mr-2"
        />
        <input
          type="text"
          placeholder="Classroom ID"
          value={newSession.classroomId}
          onChange={(e) => setNewSession({ ...newSession, classroomId: e.target.value })}
          className="border p-2 rounded mr-2"
        />
        <button
          onClick={handleCreateSession}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Session
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Attendance Sessions</h2>
        <ul>
          {sessions.map((session) => (
            <li key={session.id} className="border p-2 mb-2 rounded">
              <p>Date: {session.date}</p>
              <p>Classroom ID: {session.classroomId}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AttendancePage;