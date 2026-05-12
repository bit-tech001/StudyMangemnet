import React from 'react';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="bg-gray-100 border-t py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Kaziranga University. Academic Management System.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-[var(--kzu-navy)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--kzu-navy)] transition-colors">Support</a>
            <a href="#" className="hover:text-[var(--kzu-navy)] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
