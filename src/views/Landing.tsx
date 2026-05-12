import React, { useState } from 'react';
import { useAuth } from '../App';
import { GraduationCap, Users, ShieldCheck, ArrowRight, Mail, Lock, User, Building, IdCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';

export default function Landing() {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState<'selection' | 'login' | 'register'>('selection');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    department: '',
    studentId: '',
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAuthMode('login');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (authMode === 'login') {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register({ ...formData, role: selectedRole });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Users className="text-[var(--kzu-orange)]" />,
      title: "Teacher Portal",
      desc: "Manage assignments, schedule exams, and track student progress effortlessly.",
      role: 'teacher' as const
    },
    {
      icon: <GraduationCap className="text-[var(--kzu-navy)]" />,
      title: "Student Portal",
      desc: "Attend exams, submit assignments, and view your academic performance in real-time.",
      role: 'student' as const
    }
  ];

  if (authMode === 'selection') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mb-16"
        >
          <span className="text-[var(--kzu-orange)] font-bold tracking-widest uppercase mb-4 block">
            Knowledge Beyond Boundaries
          </span>
          <h1 className="text-5xl font-bold text-[var(--kzu-navy)] mb-6">
            Kaziranga University Academic Hub
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed text-balance">
            A centralized platform for students and educators to collaborate, assess, and excel in their academic journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="kzu-card flex flex-col items-center text-center p-10 hover:border-[var(--kzu-orange)] group cursor-default"
            >
              <div className="bg-gray-50 p-6 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(f.icon as React.ReactElement, { size: 48 })}
              </div>
              <h2 className="text-2xl font-bold text-[var(--kzu-navy)] mb-4">{f.title}</h2>
              <p className="text-gray-500 mb-8 flex-grow">{f.desc}</p>
              <button
                onClick={() => handleRoleSelect(f.role)}
                className="kzu-button-primary w-full flex items-center justify-center gap-2"
              >
                Access Portal
                <ArrowRight size={18} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-md"
      >
        <div className="bg-[var(--kzu-navy)] p-8 text-white">
          <button 
            onClick={() => setAuthMode('selection')}
            className="text-white/60 hover:text-white mb-6 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            ← Back to Selection
          </button>
          <h2 className="text-3xl font-bold mb-2">
            {authMode === 'login' ? 'Welcome Back' : 'Join as ' + selectedRole}
          </h2>
          <p className="text-white/60">
            {authMode === 'login' 
              ? 'Login to access your ' + selectedRole + ' dashboard' 
              : 'Create an account to get started'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {authMode === 'register' && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    className="kzu-input pl-11"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Department</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    className="kzu-input pl-11"
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              {selectedRole === 'student' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Student ID</label>
                  <div className="relative">
                    <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      className="kzu-input pl-11"
                      placeholder="e.g. STU12345"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                className="kzu-input pl-11"
                placeholder="you@kzu.ac.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                className="kzu-input pl-11"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="kzu-button-primary w-full py-4 mt-4 flex items-center justify-center gap-2 text-lg"
          >
            {loading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={20} />}
          </button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-sm font-bold text-[var(--kzu-navy)] hover:text-[var(--kzu-orange)] transition-colors"
            >
              {authMode === 'login' 
                ? "Don't have an account? Register here" 
                : "Already have an account? Login here"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
