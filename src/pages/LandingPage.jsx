import React, { useState } from 'react';
import { Modal } from '../components/Modal.jsx'; 
import { User, GraduationCap, BookOpen, CheckCircle, Shield, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion'; 

const FeatureItem = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h4 className="font-semibold text-slate-900">{title}</h4>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </div>
  </div>
);

export const LandingPage = ({ setView }) => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-emerald-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-purple-200/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-600/20">
            <BookOpen className="w-6 h-6"/>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AttendanceHub</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => setShowFeaturesModal(true)} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Features</button>
          <button onClick={() => setShowAboutModal(true)} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">About</button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-12 pb-24 md:pt-20 md:pb-32 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Smart Attendance System
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
            Attendance made <span className="text-blue-600">effortless</span>.
          </h2>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Streamline your classroom management with our QR-based attendance system. Fast, secure, and real-time tracking for modern education.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
          {/* Teacher Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="group relative bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <User className="w-24 h-24 text-blue-600" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">For Teachers</h3>
              <p className="text-slate-600 mb-8">Create lectures, generate QR codes, and track student attendance in real-time with detailed analytics.</p>
              <button
                onClick={() => setView('teacherLogin')}
                className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
              >
                Teacher Login <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Student Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="group relative bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <GraduationCap className="w-24 h-24 text-emerald-600" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">For Students</h3>
              <p className="text-slate-600 mb-8">Scan QR codes to mark attendance, view your history, and keep track of your academic progress daily.</p>
              <button
                onClick={() => setView('studentLogin')}
                className="w-full py-3 px-6 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
              >
                Student Login <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={showFeaturesModal} onClose={() => setShowFeaturesModal(false)} title="Key Features">
        <div className="grid gap-4">
          <FeatureItem icon={Zap} title="Instant Marking" description="Mark attendance in seconds using secure QR codes." />
          <FeatureItem icon={Shield} title="Secure & Reliable" description="Location-based validation ensures authentic attendance." />
          <FeatureItem icon={CheckCircle} title="Real-time Analytics" description="Track attendance trends and generate reports instantly." />
        </div>
      </Modal>

      <Modal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} title="About AttendanceHub">
        <div className="space-y-4 text-slate-600">
          <p>AttendanceHub is a modern solution designed to simplify the attendance tracking process for educational institutions.</p>
          <p>By leveraging QR code technology, we eliminate manual roll calls, saving valuable class time and reducing errors.</p>
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">Version 2.0.0 • Built with React & Node.js</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};