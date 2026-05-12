import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../App';
import { Assignment, Submission } from '../types';
import { FileText, Calendar, Send, CheckCircle, Loader2, Award, User, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function AssignmentDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [grading, setGrading] = useState<Record<string, { marks: number, feedback: string }>>({});

  useEffect(() => {
    async function fetchData() {
      if (!id || !profile) return;
      try {
        // Fetch assignment
        const assignmentDoc = await getDoc(doc(db, 'assignments', id));
        if (assignmentDoc.exists()) {
          setAssignment({ id: assignmentDoc.id, ...assignmentDoc.data() } as Assignment);

          // Fetch submissions
          const submissionsCol = collection(db, 'submissions');
          let q;
          if (profile.role === 'teacher') {
            q = query(submissionsCol, where('taskId', '==', id));
          } else {
            q = query(submissionsCol, where('taskId', '==', id), where('studentId', '==', profile.uid));
          }
          
          const snapshot = await getDocs(q);
          const subData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) as Submission[];
          
          if (profile.role === 'teacher') {
            setSubmissions(subData);
          } else if (subData.length > 0) {
            setMySubmission(subData[0]);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `assignments/${id}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, profile]);

  const handleSubit = async () => {
    if (!id || !profile || !assignment) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'submissions'), {
        taskId: id,
        type: 'assignment',
        studentId: profile.uid,
        studentName: profile.fullName,
        content: content,
        isGraded: false,
        submittedAt: serverTimestamp(),
      });
      alert("Assignment submitted!");
      navigate('/dashboard');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'submissions');
      alert("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (subId: string) => {
    const data = grading[subId];
    if (!data) return;
    try {
      await updateDoc(doc(db, 'submissions', subId), {
        marksObtained: data.marks,
        feedback: data.feedback,
        isGraded: true
      });
      alert("Graded successfully!");
      setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, ...data, isGraded: true } : s));
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `submissions/${subId}`);
      alert("Grading failed.");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--kzu-orange)]" size={40} /></div>;
  if (!assignment) return <div>Assignment not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="kzu-card bg-white border-2 border-[var(--kzu-navy)]/10">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-[var(--kzu-navy)] rounded-full text-[10px] font-black uppercase tracking-widest">
                {assignment.courseName}
              </span>
              <span className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase">
                <Clock size={14} /> Due: {assignment.dueDate}
              </span>
            </div>
            <h1 className="text-4xl font-black text-[var(--kzu-navy)] mb-4">{assignment.title}</h1>
            <p className="text-gray-600 leading-relaxed text-lg max-w-3xl">{assignment.description}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl min-w-[200px]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Maximum Score</span>
            <span className="text-5xl font-black text-[var(--kzu-orange)]">{assignment.maxMarks}</span>
            <span className="text-xs font-bold text-gray-400 uppercase mt-2">Points</span>
          </div>
        </div>

        {profile?.role === 'student' && (
          <div className="pt-8 border-t">
            {mySubmission ? (
              <div className="bg-green-50 border border-green-100 p-8 rounded-2xl flex items-center gap-6">
                <div className="p-4 bg-white rounded-full text-green-500 shadow-sm">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800">Assignment Submitted</h3>
                  <p className="text-green-700/70 font-medium">Your work has been recorded. {mySubmission.isGraded ? 'Grading completed.' : 'Awaiting feedback from teacher.'}</p>
                  {mySubmission.isGraded && (
                    <div className="mt-4 flex gap-8">
                      <div>
                        <p className="text-xs font-bold text-green-700 uppercase">Score</p>
                        <p className="text-2xl font-black text-green-800">{mySubmission.marksObtained} / {assignment.maxMarks}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-700 uppercase">Feedback</p>
                        <p className="text-green-800 italic">"{mySubmission.feedback}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[var(--kzu-navy)]">Submit Your Work</h2>
                <textarea
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 min-h-[200px]"
                  placeholder="Type your response or paste links here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <button
                  disabled={!content || loading}
                  onClick={handleSubit}
                  className="kzu-button-primary w-full md:w-auto px-12 py-3"
                >
                  {loading ? 'Sending...' : 'Submit Assignment'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {profile?.role === 'teacher' && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Award className="text-[var(--kzu-orange)]" />
            <h2 className="text-2xl font-bold text-[var(--kzu-navy)]">Submissions ({submissions.length})</h2>
          </div>
          
          <div className="grid gap-6">
            {submissions.map((sub) => (
              <div key={sub.id} className="kzu-card grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="text-gray-400" />
                    <span className="font-bold text-lg">{sub.studentName}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-gray-700">
                    {sub.content}
                  </div>
                </div>
                <div className="space-y-4 border-l pl-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Assign Marks</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-white border border-gray-200 rounded outline-none font-bold"
                      placeholder="0"
                      disabled={sub.isGraded}
                      defaultValue={sub.marksObtained}
                      onChange={(e) => setGrading({...grading, [sub.id]: { ...grading[sub.id], marks: parseInt(e.target.value) }})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Feedback</label>
                    <textarea
                      className="w-full p-2 bg-white border border-gray-200 rounded outline-none h-20 text-sm"
                      placeholder="Add comments..."
                      disabled={sub.isGraded}
                      defaultValue={sub.feedback}
                      onChange={(e) => setGrading({...grading, [sub.id]: { ...grading[sub.id], feedback: e.target.value }})}
                    />
                  </div>
                  <button
                    disabled={sub.isGraded}
                    onClick={() => handleGrade(sub.id)}
                    className="w-full kzu-button-primary py-2 text-sm bg-[var(--kzu-navy)] hover:bg-navy-700"
                  >
                    {sub.isGraded ? 'Graded' : 'Submit Grade'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
