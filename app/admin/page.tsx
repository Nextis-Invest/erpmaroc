'use client';

import { useEffect, useState } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Fetch user count
    async function fetchUserCount() {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUserCount(data.data?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch user count:', error);
      }
    }

    fetchUserCount();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <AdminDashboard userCount={userCount} />
    </div>
  );
}