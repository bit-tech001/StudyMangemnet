/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseName: string;
  teacherId: string;
  dueDate: string;
  maxMarks: number;
}

export interface Exam {
  id: string;
  title: string;
  courseName: string;
  teacherId: string;
  startTime: string;
  durationMinutes: number;
  questions: ExamQuestion[];
  status: 'scheduled' | 'active' | 'completed';
}

export interface ExamQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string; // Only visible to teacher
  type: 'mcq' | 'subjective';
}

export interface Submission {
  id: string;
  taskId: string; // Assignment or Exam ID
  type: 'assignment' | 'exam';
  studentId: string;
  studentName: string;
  content: any; // Answers or File link
  submittedAt: string;
  marksObtained?: number;
  feedback?: string;
  isGraded: boolean;
}
