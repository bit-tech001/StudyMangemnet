import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Target, Star, Award, BookCheck, ClipboardList, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Assignment, Exam, Submission } from '../types';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [activeExams, setActiveExams] = useState<Exam[]>([]);
  const [gradedSubmissions, setGradedSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!profile) return;
      try {
        // Fetch assignments
        const assignmentsSnap = await getDocs(query(collection(db, 'assignments'), limit(5)));
        const allAssignments = assignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }) as Assignment);

        // Fetch user submissions to filter pending
        const subSnap = await getDocs(query(collection(db, 'submissions'), where('studentId', '==', profile.uid)));
        const userSubmissions = subSnap.docs.map(doc => doc.data() as any as Submission);
        const submittedIds = userSubmissions.map(s => s.taskId);

        setPendingAssignments(allAssignments.filter(a => !submittedIds.includes(a.id)));
        setGradedSubmissions(userSubmissions.filter(s => s.isGraded));

        // Fetch active exams
        const examsSnap = await getDocs(query(
          collection(db, 'exams'), 
          where('status', '==', 'active'),
          limit(3)
        ));
        setActiveExams(examsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }) as Exam));

      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'multiple');
      }
    }
    fetchData();
  }, [profile]);

  const studentStats = [
    { label: 'Attendance', value: '92%', icon: <Target className="text-emerald-500" />, color: 'bg-emerald-50' },
    { label: 'Avg CGPA', value: '8.4', icon: <Star className="text-yellow-500" />, color: 'bg-yellow-50' },
    { label: 'Badges Earned', value: '12', icon: <Award className="text-blue-500" />, color: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-8">
      <header className="kzu-dashboard-header flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back, {profile?.fullName}</h1>
          <p className="text-white/80 font-medium">
            Enrollment ID: {profile?.studentId || 'Not Set'} • {profile?.department || 'General Department'}
          </p>
        </div>
        {(!profile?.studentId || !profile?.department) && (
          <Link 
            to="/profile"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-xl flex items-center gap-3 transition-all border border-white/20 group"
          >
            <div className="bg-[var(--kzu-orange)] p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Star className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Complete Your Profile</span>
          </Link>
        )}
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {studentStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`kzu-card border-none ${stat.color} flex items-center gap-6 p-8 group`}
          >
            <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:rotate-12 transition-transform">
              {React.cloneElement(stat.icon as React.ReactElement, { size: 32 })}
            </div>
            <div>
              <div className="text-3xl font-black text-gray-800">{stat.value}</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--kzu-navy)] flex items-center gap-2">
            <ClipboardList className="text-[var(--kzu-orange)]" />
            Pending Assignments
          </h2>
          <div className="space-y-4">
            {pendingAssignments.length > 0 ? pendingAssignments.map((assignment) => (
              <div key={assignment.id} className="kzu-card flex justify-between items-center group cursor-pointer hover:border-[var(--kzu-orange)]">
                <div>
                   <h3 className="font-bold text-[var(--kzu-navy)]">{assignment.courseName}</h3>
                   <p className="text-sm text-gray-500 font-medium mt-1">{assignment.title}</p>
                   <div className="flex items-center gap-3 mt-4 text-xs font-bold uppercase tracking-tight text-red-500">
                     <Timer size={14} />
                     Due: {assignment.dueDate}
                   </div>
                </div>
                <Link 
                  to={`/assignments/${assignment.id}`}
                  className="kzu-button-secondary py-1 px-4 text-sm whitespace-nowrap"
                >
                  Submit Now
                </Link>
              </div>
            )) : (
              <p className="p-8 text-center bg-gray-50 rounded-xl text-gray-400 font-medium">All caught up! No pending assignments.</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--kzu-navy)] flex items-center gap-2">
            <BookCheck className="text-[var(--kzu-orange)]" />
            Active Exams
          </h2>
          <div className="space-y-4">
            {activeExams.length > 0 ? activeExams.map((exam) => (
              <div key={exam.id} className="kzu-card bg-orange-50 border-orange-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 bg-[var(--kzu-orange)] text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-lg">
                  Live Now
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[var(--kzu-navy)] text-lg">{exam.title}</h3>
                    <p className="text-sm text-gray-600 font-medium">Duration: {exam.durationMinutes} Minutes • {exam.courseName}</p>
                    <Link to={`/exams/${exam.id}`} className="kzu-button-primary mt-6 inline-flex items-center gap-2">
                      Enter Exam Hall
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <p className="p-8 text-center bg-gray-50 rounded-xl text-gray-400 font-medium">No live exams at the moment.</p>
            )}
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--kzu-navy)]">Recently Graded</h2>
        <div className="kzu-card border-none bg-white p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Task Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Date Submitted</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Score</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {gradedSubmissions.length > 0 ? gradedSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-700">{sub.type === 'assignment' ? 'Assignment' : 'Exam Submission'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[var(--kzu-navy)]">{sub.marksObtained}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Graded</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-medium">
                      No recently graded tasks.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
