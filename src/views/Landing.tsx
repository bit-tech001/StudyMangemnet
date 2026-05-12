import React from 'react';
import { useAuth } from '../App';
import { GraduationCap, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  const { signIn } = useAuth();

  const features = [
    {
      icon: <Users className="text-[var(--kzu-orange)]" />,
      title: "Teacher Portal",
      desc: "Manage assignments, schedule exams, and track student progress effortlessly.",
      role: 'teacher' as const
    },
    {
      icon: <GraduationCap className="text-[var(--kzu-navy)]" />,
      title: "Student Portal",
      desc: "Attend exams, submit assignments, and view your academic performance in real-time.",
      role: 'student' as const
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mb-16"
      >
        <span className="text-[var(--kzu-orange)] font-bold tracking-widest uppercase mb-4 block">
          Knowledge Beyond Boundaries
        </span>
        <h1 className="text-5xl font-bold text-[var(--kzu-navy)] mb-6">
          Kaziranga University Academic Hub
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed text-balance">
          A centralized platform for students and educators to collaborate, assess, and excel in their academic journey.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="kzu-card flex flex-col items-center text-center p-10 hover:border-[var(--kzu-orange)] group cursor-default"
          >
            <div className="bg-gray-50 p-6 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
              {React.cloneElement(f.icon as React.ReactElement, { size: 48 })}
            </div>
            <h2 className="text-2xl font-bold text-[var(--kzu-navy)] mb-4">{f.title}</h2>
            <p className="text-gray-500 mb-8 flex-grow">{f.desc}</p>
            <button
              onClick={() => signIn(f.role)}
              className="kzu-button-primary w-full flex items-center justify-center gap-2"
            >
              Login as {f.role.charAt(0).toUpperCase() + f.role.slice(1)}
              <ArrowRight size={18} />
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-20 flex items-center gap-8 text-gray-400 grayscale opacity-70"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} />
          <span className="text-sm font-medium">Secure Authentication</span>
        </div>
        <div className="w-px h-4 bg-gray-300" />
        <span className="text-sm font-medium">Official University Portal</span>
      </motion.div>
    </div>
  );
}
