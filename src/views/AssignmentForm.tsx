import React, { useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Save, X, Calendar, Book } from 'lucide-react';
import { assignmentApi } from '../lib/api';

export default function AssignmentForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseName: '',
    dueDate: '',
    maxMarks: 100
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assignmentApi.create({
        ...formData,
        subject: formData.courseName // Map courseName to subject for server
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[var(--kzu-navy)] flex items-center gap-3">
          <FilePlus className="text-[var(--kzu-orange)]" />
          Create New Assignment
        </h1>
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="kzu-card space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
              <Book size={14} />
              Course Name
            </label>
            <input
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--kzu-orange)] outline-none"
              placeholder="e.g. Data Structures"
              value={formData.courseName}
              onChange={(e) => setFormData({...formData, courseName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
              <Calendar size={14} />
              Due Date
            </label>
            <input
              required
              type="date"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--kzu-orange)] outline-none"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase">Assignment Title</label>
          <input
            required
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--kzu-orange)] outline-none font-bold"
            placeholder="e.g. Lab Report 1: Sorting Algorithms"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase">Description & Instructions</label>
          <textarea
            required
            rows={6}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--kzu-orange)] outline-none resize-none"
            placeholder="Describe the scope of the assignment..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-gray-500">MAX MARKS:</label>
            <input
              type="number"
              className="w-20 p-2 bg-gray-50 border border-gray-200 rounded outline-none font-bold text-center"
              value={formData.maxMarks}
              onChange={(e) => setFormData({...formData, maxMarks: parseInt(e.target.value)})}
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="kzu-button-primary flex items-center gap-2 min-w-[160px] justify-center"
          >
            {loading ? 'Publishing...' : (
              <>
                <Save size={18} />
                Publish Assignment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
