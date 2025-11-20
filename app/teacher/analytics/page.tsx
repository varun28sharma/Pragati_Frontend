"use client";

import React, { useState, useEffect } from 'react';

interface AnalyticsData {
  id: string;
  metric: string;
  value: string;
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    // Fetch analytics data
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/reports/attendance/teacher');
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/reports/attendance/teacher/pdf');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'attendance_report.pdf';
        link.click();
      } else {
        console.error('Failed to export PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Analytics</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Analytics Data</h2>
        <ul>
          {analytics.map((data) => (
            <li key={data.id} className="border p-2 mb-2 rounded">
              <p>Metric: {data.metric}</p>
              <p>Value: {data.value}</p>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleExportPDF}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Export PDF
      </button>
    </div>
  );
};

export default AnalyticsPage;