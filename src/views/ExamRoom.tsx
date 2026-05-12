import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../App';
import { Exam } from '../types';
import { Timer, AlertCircle, ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ExamRoom() {
  const { examId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    async function fetchExam() {
      if (!examId) return;
      try {
        const examDoc = await getDoc(doc(db, 'exams', examId));
        if (examDoc.exists()) {
          const data = { id: examDoc.id, ...examDoc.data() } as Exam;
          setExam(data);
          setTimeLeft(data.durationMinutes * 60);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `exams/${examId}`);
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async () => {
    if (!exam || !examId || !profile) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'submissions'), {
        taskId: examId,
        type: 'exam',
        studentId: profile.uid,
        studentName: profile.fullName,
        content: answers,
        isGraded: false,
        submittedAt: serverTimestamp(),
      });
      alert("Exam submitted successfully!");
      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
      alert("Failed to submit. Please contact support immediately.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !exam) return <div className="flex justify-center flex-col items-center py-20 gap-4">
    <Loader2 className="animate-spin text-[var(--kzu-orange)]" size={48} />
    <p className="font-bold text-gray-500">Entering Examination Hall...</p>
  </div>;

  if (!exam) return <div>Exam not found.</div>;

  const q = exam.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-xl sticky top-20 z-10">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl flex flex-col items-center min-w-[100px] ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-[var(--kzu-navy)]'}`}>
            <Timer size={20} />
            <span className="text-2xl font-black">{formatTime(timeLeft)}</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--kzu-navy)]">{exam.title}</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{exam.courseName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase">Progress</p>
          <p className="text-lg font-black text-[var(--kzu-navy)]">{currentQuestion + 1} / {exam.questions.length}</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="kzu-card min-h-[400px] flex flex-col pt-12 relative">
          <div className="absolute top-0 left-12 transform -translate-y-1/2 bg-[var(--kzu-navy)] text-white px-6 py-2 rounded-full font-bold shadow-lg">
            Question #{currentQuestion + 1}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow space-y-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 leading-relaxed px-4">
                {q.question}
              </h2>

              <div className="grid gap-4 mt-12">
                {q.options?.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = answers[q.id] === letter;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers({...answers, [q.id]: letter})}
                      className={`flex items-center gap-6 p-5 rounded-2xl border-2 transition-all text-left group ${
                        isSelected 
                          ? 'border-[var(--kzu-orange)] bg-orange-50 shadow-inner' 
                          : 'border-gray-100 bg-gray-50/50 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                        isSelected ? 'bg-[var(--kzu-orange)] text-white' : 'bg-white text-gray-400 group-hover:text-gray-600'
                      }`}>
                        {letter}
                      </div>
                      <span className={`text-lg font-medium ${isSelected ? 'text-[var(--kzu-navy)]' : 'text-gray-600'}`}>
                        {opt}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-auto pt-12 flex justify-between">
            <button
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="flex items-center gap-2 font-bold text-gray-400 hover:text-[var(--kzu-navy)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft /> Previous
            </button>
            <div className="flex gap-4">
              {currentQuestion < exam.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  className="kzu-button-secondary flex items-center gap-2"
                >
                  Next Question <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="kzu-button-primary bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  Submit Exam <Send size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-4">
          <AlertCircle className="text-blue-600 shrink-0" />
          <div className="text-sm text-blue-700 leading-relaxed font-medium">
            <p className="font-bold mb-1 uppercase tracking-wider">Instructions:</p>
            Do not refresh the page or navigate away during the examination. Your answers are saved automatically locally, but must be submitted before the timer expires.
          </div>
        </div>
      </div>
    </div>
  );
}
