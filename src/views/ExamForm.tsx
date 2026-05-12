import React, { useState } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Trash2, Save, X, Clock } from 'lucide-react';
import { ExamQuestion } from '../types';

export default function ExamForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    courseName: '',
    durationMinutes: 60,
    startTime: ''
  });
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    { id: '1', question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '' }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now().toString(), question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '' }
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<ExamQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'exams'), {
        ...formData,
        questions,
        teacherId: profile?.uid,
        status: 'scheduled',
        createdAt: serverTimestamp(),
      });
      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'exams');
      alert("Failed to schedule exam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[var(--kzu-navy)] flex items-center gap-3">
          <BookOpen className="text-[var(--kzu-orange)]" />
          Schedule Examination
        </h1>
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <X />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="kzu-card grid md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-gray-500 uppercase">Exam Title</label>
            <input
              required
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--kzu-orange)] outline-none font-bold text-lg"
              placeholder="e.g. Mid-Term Examination 2026"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase">Course</label>
            <input
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
              placeholder="e.g. Operating Systems"
              value={formData.courseName}
              onChange={(e) => setFormData({...formData, courseName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
              <Clock size={14} /> Duration (Mins)
            </label>
            <input
              required
              type="number"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-[var(--kzu-navy)]">Question Paper</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="text-[var(--kzu-orange)] font-bold flex items-center gap-2 hover:underline"
            >
              <Plus size={18} /> Add Question
            </button>
          </div>

          {questions.map((q, idx) => (
            <div key={q.id} className="kzu-card space-y-4 border-l-4 border-l-[var(--kzu-navy)]">
              <div className="flex justify-between items-start">
                <span className="bg-[var(--kzu-navy)] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <textarea
                required
                className="w-full p-3 bg-gray-50 border-none rounded-lg outline-none focus:ring-2 focus:ring-orange-100 italic"
                placeholder="Enter question here..."
                value={q.question}
                onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
              />

              <div className="grid md:grid-cols-2 gap-4">
                {q.options?.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <input
                      required
                      className="flex-grow p-2 text-sm bg-gray-50 border-b border-gray-100 outline-none focus:border-[var(--kzu-orange)]"
                      placeholder={`Option ${optIdx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...(q.options || [])];
                        newOpts[optIdx] = e.target.value;
                        updateQuestion(q.id, { options: newOpts });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase">Correct Answer:</span>
                <select
                  className="bg-gray-50 border-none text-sm font-bold text-[var(--kzu-orange)] outline-none"
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                >
                  <option value="">Select Option</option>
                  {q.options?.map((_, i) => (
                    <option key={i} value={String.fromCharCode(65 + i)}>Option {String.fromCharCode(65 + i)}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-8 flex justify-center">
          <button
            disabled={loading}
            type="submit"
            className="kzu-button-primary scale-110 shadow-2xl flex items-center gap-3 px-12"
          >
            {loading ? 'Scheduling...' : (
              <>
                <Save size={20} />
                Schedule Exam
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
