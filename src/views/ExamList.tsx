import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Exam } from '../types';
import { BookOpen, Calendar, Clock, Lock, Play, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function ExamList() {
  const { profile } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      try {
        const examsCol = collection(db, 'exams');
        let q = query(examsCol, orderBy('createdAt', 'desc'));
        
        if (profile?.role === 'teacher') {
          q = query(examsCol, where('teacherId', '==', profile.uid), orderBy('createdAt', 'desc'));
        }
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as any
        })) as Exam[];
        setExams(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'exams');
      } finally {
        setLoading(false);
      }
    }
    if (profile) fetchExams();
  }, [profile]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--kzu-orange)]" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[var(--kzu-navy)]">Examination Portal</h1>
          <p className="text-gray-500 font-medium">Scheduled assessments and unit tests</p>
        </div>
        {profile?.role === 'teacher' && (
          <Link to="/exams/new" className="kzu-button-primary flex items-center gap-2">
            <Plus size={20} />
            Schedule New
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {exams.length > 0 ? exams.map((exam, i) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="kzu-card relative group overflow-hidden border-none shadow-md hover:shadow-xl transition-all"
          >
            <div className={`absolute top-0 left-0 w-full h-1 ${exam.status === 'active' ? 'bg-green-500' : 'bg-[var(--kzu-orange)]'}`} />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--kzu-orange)]">
                  {exam.courseName}
                </span>
                <h3 className="text-xl font-bold text-[var(--kzu-navy)] mt-1">{exam.title}</h3>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${exam.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {exam.status}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Clock size={16} />
                <span className="font-medium">Duration: {exam.durationMinutes} Minutes</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Calendar size={16} />
                <span className="font-medium">Questions: {exam.questions.length} Sets</span>
              </div>
            </div>

            {profile?.role === 'teacher' ? (
              <div className="flex gap-2">
                <button className="flex-grow kzu-button-secondary py-1.5 text-sm">Edit Paper</button>
                <button className="flex-grow kzu-button-primary py-1.5 text-sm">Analyze Results</button>
              </div>
            ) : (
              <button 
                disabled={exam.status !== 'active'}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                  exam.status === 'active' 
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg active:scale-95' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {exam.status === 'active' ? (
                  <>
                    <Play size={18} fill="currentColor" />
                    Attempt Exam Now
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Coming Soon
                  </>
                )}
              </button>
            )}
          </motion.div>
        )) : (
          <div className="md:col-span-2 text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No exams scheduled at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
