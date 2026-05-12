import React from 'react';
import { useAuth } from '../App';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[var(--kzu-orange)]" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Synchronizing Academic Data...</p>
      </div>
    );
  }

  if (!profile) return null;

  return profile.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
}
