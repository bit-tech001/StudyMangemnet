import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Assignment, Exam, Submission } from '../types';
import { Plus, FileText, BookOpen, Users, TrendingUp, Clock, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ assignments: 0, exams: 0, pendingGrading: 0 });
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);

  useEffect(() => {
    async function fetchStats() {
      if (!profile) return;
      try {
        const assignmentsCol = collection(db, 'assignments');
        const examsCol = collection(db, 'exams');
        const submissionsCol = collection(db, 'submissions');

        const [assignmentsSnap, examsSnap, submissionsSnap] = await Promise.all([
          getDocs(query(assignmentsCol, where('teacherId', '==', profile.uid))),
          getDocs(query(examsCol, where('teacherId', '==', profile.uid))),
          getDocs(query(submissionsCol, where('isGraded', '==', false)))
        ]);

        setStats({
          assignments: assignmentsSnap.size,
          exams: examsSnap.size,
          pendingGrading: submissionsSnap.size,
        });

        // Recent assignments
        const recentAssignmentsSnap = await getDocs(query(
          assignmentsCol, 
          where('teacherId', '==', profile.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        ));
        setRecentAssignments(recentAssignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }) as Assignment));

        // Upcoming exams
        const upcomingExamsSnap = await getDocs(query(
          examsCol,
          where('teacherId', '==', profile.uid),
          where('status', '==', 'scheduled'),
          limit(3)
        ));
        setUpcomingExams(upcomingExamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }) as Exam));

      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'multiple');
      }
    }
    fetchStats();
  }, [profile]);

  const quickStats = [
    { label: 'Active Assignments', value: stats.assignments, icon: <FileText className="text-blue-500" />, trend: 'Total Posted' },
    { label: 'Scheduled Exams', value: stats.exams, icon: <BookOpen className="text-purple-500" />, trend: 'Active Schedule' },
    { label: 'Pending Grading', value: stats.pendingGrading, icon: <Clock className="text-orange-500" />, trend: 'Action Required' },
    { label: 'Avg Class Score', value: '78%', icon: <TrendingUp className="text-green-500" />, trend: 'Mock Metric' },
  ];

  return (
    <div className="space-y-8">
      <header className="kzu-dashboard-header flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back, {profile?.fullName}</h1>
          <p className="text-white/80 font-medium flex items-center gap-2">
            <Calendar size={18} />
            Academic Portal • {profile?.department} Department
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/profile" className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" title="My Profile">
            <Users size={20} />
          </Link>
          <Link to="/exams/new" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all backdrop-blur-sm">
            <Plus size={20} />
            Schedule Exam
          </Link>
          <Link to="/assignments/new" className="bg-[var(--kzu-orange)] hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95">
            <Plus size={20} />
            Post Assignment
          </Link>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="kzu-card relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{stat.trend}</span>
            </div>
            <div className="text-3xl font-bold text-[var(--kzu-navy)]">{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-[var(--kzu-navy)]">Recent Assignments</h2>
            <Link to="/assignments" className="text-sm font-bold text-[var(--kzu-orange)] hover:underline">View All</Link>
          </div>
          <div className="kzu-card border-none bg-white p-0 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {recentAssignments.length > 0 ? recentAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">{assignment.title}</h3>
                    <p className="text-xs text-gray-400 font-medium uppercase mt-1">Due: {assignment.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link to={`/assignments/${assignment.id}`} className="text-[var(--kzu-navy)] font-bold text-sm hover:text-[var(--kzu-orange)]">
                      View
                    </Link>
                  </div>
                </div>
              )) : (
                <p className="p-8 text-center text-gray-400 font-medium">No assignments posted yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-[var(--kzu-navy)]">Upcoming Exams</h2>
            <Link to="/exams" className="text-sm font-bold text-[var(--kzu-orange)] hover:underline">Manage Schedule</Link>
          </div>
          <div className="kzu-card border-none bg-white p-0 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {upcomingExams.length > 0 ? upcomingExams.map((exam) => (
                <div key={exam.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="bg-orange-50 text-[var(--kzu-orange)] p-3 rounded-lg font-bold flex flex-col items-center min-w-[60px]">
                      <span className="text-xs uppercase">Exam</span>
                      <span className="text-xl leading-none">{exam.durationMinutes}m</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{exam.title}</h3>
                      <p className="text-xs text-gray-400 font-medium mt-1">{exam.courseName}</p>
                    </div>
                  </div>
                  <Link to="/exams" className="text-[var(--kzu-navy)] font-bold text-sm hover:text-[var(--kzu-orange)]">
                    Edit
                  </Link>
                </div>
              )) : (
                <p className="p-8 text-center text-gray-400 font-medium">No upcoming exams.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
