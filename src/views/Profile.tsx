import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { authApi } from '../lib/api';
import { User, Save, GraduationCap, Building, Mail, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { profile, setProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    department: '',
    studentId: '',
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        department: profile.department || '',
        studentId: profile.studentId || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    setSuccess(false);
    try {
      const { data } = await authApi.updateProfile(formData);
      setProfile(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="bg-[var(--kzu-navy)] p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
              <User size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.fullName || 'User Profile'}</h1>
              <p className="text-white/60 font-medium uppercase tracking-wider text-xs mt-1">{profile.role}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <User size={16} className="text-[var(--kzu-navy)]" />
                Full Name
              </label>
              <input
                type="text"
                required
                className="kzu-input"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Mail size={16} className="text-[var(--kzu-navy)]" />
                Email Address
              </label>
              <input
                type="email"
                disabled
                className="kzu-input bg-gray-50 text-gray-500 cursor-not-allowed"
                value={profile.email}
              />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Building size={16} className="text-[var(--kzu-navy)]" />
                  Department
                </label>
                <input
                  type="text"
                  className="kzu-input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
              </div>

              {profile.role === 'student' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <GraduationCap size={16} className="text-[var(--kzu-navy)]" />
                    Student ID
                  </label>
                  <input
                    type="text"
                    className="kzu-input"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="e.g. STU12345"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between">
            {success && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-emerald-600 font-bold text-sm"
              >
                Profile updated successfully!
              </motion.span>
            )}
            <button
              type="submit"
              disabled={loading}
              className="kzu-button-primary w-full md:w-auto ml-auto px-8 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
