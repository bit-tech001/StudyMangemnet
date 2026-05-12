import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Assignment } from '../types';
import { FileText, Calendar, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function AssignmentList() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const assignmentsCol = collection(db, 'assignments');
        let q = query(assignmentsCol, orderBy('createdAt', 'desc'));
        
        if (profile?.role === 'teacher') {
          q = query(assignmentsCol, where('teacherId', '==', profile.uid), orderBy('createdAt', 'desc'));
        }
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as any
        })) as Assignment[];
        setAssignments(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'assignments');
      } finally {
        setLoading(false);
      }
    }
    if (profile) fetchAssignments();
  }, [profile]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--kzu-orange)]" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[var(--kzu-navy)]">Course Assignments</h1>
          <p className="text-gray-500 font-medium">Manage and track all academic assignments here</p>
        </div>
        {profile?.role === 'teacher' && (
          <Link to="/assignments/new" className="kzu-button-primary flex items-center gap-2">
            <Plus size={20} />
            Post New
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {assignments.length > 0 ? assignments.map((assignment, i) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="kzu-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[var(--kzu-navy)] group"
          >
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-[var(--kzu-navy)] group-hover:text-white transition-colors">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--kzu-navy)]">{assignment.title}</h3>
                <p className="text-sm text-gray-500 font-medium">{assignment.courseName}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={16} />
                <span className="text-sm font-bold uppercase tracking-wider">Due: {assignment.dueDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Max Marks:</span>
                <span className="font-bold text-[var(--kzu-navy)]">{assignment.maxMarks}</span>
              </div>
              <Link 
                to={`/assignments/${assignment.id}`}
                className="w-full md:w-auto kzu-button-secondary py-1 px-4 text-sm flex items-center justify-center gap-2"
              >
                {profile?.role === 'teacher' ? 'View Submissions' : 'View Details'}
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No assignments found for this department yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
