"use client";

import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState({ title: '', message: '' });

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/communications/notifications/active');
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleCreateNotification = async () => {
    try {
      const response = await fetch('/api/communications/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification),
      });

      if (response.ok) {
        const createdNotification: Notification = await response.json();
        setNotifications((prev) => [...prev, createdNotification]);
        setNewNotification({ title: '', message: '' });
      } else {
        console.error('Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Create New Notification</h2>
        <input
          type="text"
          placeholder="Title"
          value={newNotification.title}
          onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
          className="border p-2 rounded mr-2"
        />
        <input
          type="text"
          placeholder="Message"
          value={newNotification.message}
          onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
          className="border p-2 rounded mr-2"
        />
        <button
          onClick={handleCreateNotification}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Notification
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Active Notifications</h2>
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id} className="border p-2 mb-2 rounded">
              <p>Title: {notification.title}</p>
              <p>Message: {notification.message}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsPage;