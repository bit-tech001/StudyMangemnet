/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './lib/firebase';
import { UserProfile, UserRole } from './types';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard';
import AssignmentForm from './views/AssignmentForm';
import ExamForm from './views/ExamForm';
import AssignmentList from './views/AssignmentList';
import ExamList from './views/ExamList';
import ExamRoom from './views/ExamRoom';
import AssignmentDetail from './views/AssignmentDetail';

import Profile from './views/Profile';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          // Get profile from Firestore
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Default check if they just logged in without role selection (Landing handles role selection)
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const signIn = async (role: UserRole) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      const profileData: UserProfile = {
        uid: result.user.uid,
        fullName: result.user.displayName || 'Unnamed User',
        email: result.user.email || '',
        role: role,
        department: 'General',
      };

      // Save to Firestore
      const docRef = doc(db, 'users', result.user.uid);
      await setDoc(docRef, profileData);
      setProfile(profileData);
      
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--kzu-orange)]"></div>
    </div>
  );
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomeLoader />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/assignments" element={<ProtectedRoute><AssignmentList /></ProtectedRoute>} />
            <Route path="/assignments/new" element={<ProtectedRoute><AssignmentForm /></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><ExamList /></ProtectedRoute>} />
            <Route path="/exams/new" element={<ProtectedRoute><ExamForm /></ProtectedRoute>} />
            <Route path="/exams/:examId" element={<ProtectedRoute><ExamRoom /></ProtectedRoute>} />
            <Route path="/assignments/:id" element={<ProtectedRoute><AssignmentDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

const HomeLoader = () => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--kzu-orange)]"></div>
    </div>
  );
  if (user) return <Navigate to="/dashboard" />;
  return <Landing />;
};
