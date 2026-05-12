import React from 'react';
import { useAuth } from '../App';
import { GraduationCap, LogOut, User as UserIcon, BookOpen, FileText, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { profile, logout } = useAuth();

  return (
    <nav className="bg-[var(--kzu-navy)] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-white p-1.5 rounded-lg">
              <GraduationCap className="text-[var(--kzu-navy)] w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-bold text-xl tracking-tight">KZU HUB</span>
          </Link>

          {profile && (
            <div className="hidden md:flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2 hover:text-[var(--kzu-orange)] transition-colors">
                <LayoutDashboard size={18} />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link to="/assignments" className="flex items-center gap-2 hover:text-[var(--kzu-orange)] transition-colors">
                <FileText size={18} />
                <span className="font-medium">Assignments</span>
              </Link>
              <Link to="/exams" className="flex items-center gap-2 hover:text-[var(--kzu-orange)] transition-colors">
                <BookOpen size={18} />
                <span className="font-medium">Exams</span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4">
            {profile ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-2 hidden sm:flex">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--kzu-orange)]">
                    {profile.role}
                  </span>
                  <span className="text-sm font-medium">{profile.fullName}</span>
                </div>
                <Link 
                  to="/profile"
                  className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                  title="Profile Settings"
                >
                  <UserIcon className="w-5 h-5 group-hover:text-[var(--kzu-orange)]" />
                </Link>
                <button 
                  onClick={() => logout()}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 group-hover:text-[var(--kzu-orange)]" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <span className="text-sm font-medium text-white/70">Welcome to KZU Academic Portal</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
