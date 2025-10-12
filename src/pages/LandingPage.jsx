import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { UserIcon, GraduationCapIcon, BookOpenIcon } from '../components/Icons';

// This is a sub-component used only by LandingPage
const RoleCard = ({ icon, title, description, buttonText, onClick, isPrimary }) => (
  <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg text-center flex flex-col items-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out">
    <div className="mb-4">{icon}</div>
    <h3 className="text-2xl font-bold mb-2 text-[#021024]">{title}</h3>
    <p className="text-slate-600 mb-6 flex-grow">{description}</p>
    <button
      onClick={onClick}
      className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg ${isPrimary ? 'bg-[#052659] text-white hover:bg-[#021024]' : 'bg-[#7DA0CA] text-[#021024] hover:bg-[#5483B3]'}`}
    >
      {buttonText}
    </button>
  </div>
);

export const LandingPage = ({ setView }) => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);

  return (
    <>
      <div className="w-full text-gray-800">
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-[#021024] z-10">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-8 h-8"/>
            <h1 className="text-2xl font-bold">AttendanceHub</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-lg">
            <button onClick={() => setShowFeaturesModal(true)} className="hover:underline font-semibold">Features</button>
            <button onClick={() => setShowAboutModal(true)} className="hover:underline font-semibold">About</button>
          </nav>
        </header>
        
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center mb-12 text-[#021024]">
            <h2 className="text-5xl font-bold mb-4">Smart Attendance System</h2>
            <p className="text-xl text-[#052659]">Select your role to get started</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
            <RoleCard
              icon={<UserIcon className="w-12 h-12 mx-auto text-[#052659]"/>}
              title="Teacher"
              description="Manage lectures and track attendance"
              buttonText="Continue as Teacher"
              onClick={() => setView('teacherLogin')}
              isPrimary={true}
            />
            <RoleCard
              icon={<GraduationCapIcon className="w-12 h-12 mx-auto text-[#052659]"/>}
              title="Student"
              description="Mark your attendance quickly"
              buttonText="Continue as Student"
              onClick={() => setView('studentLogin')}
              isPrimary={false}
            />
          </div>
        </main>

        <footer className="absolute bottom-0 left-0 right-0 p-6 text-center text-[#052659]">
          <p>© 2025 Smart Attendance System. All rights reserved.</p>
        </footer>
      </div>
      
      <Modal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} title="About AttendanceHub">
        <p className="text-slate-600">
            AttendanceHub is a modern solution for educational institutions to streamline and automate the attendance process. It uses QR codes combined with geo-fencing technology to ensure students are physically present in the classroom, eliminating proxy attendance...
        </p>
      </Modal>

      <Modal isOpen={showFeaturesModal} onClose={() => setShowFeaturesModal(false)} title="Key Features">
        <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li><span className="font-semibold">Geo-fenced QR Codes:</span> Students can only mark attendance after scanning a QR code while being within a specified geographical area (the classroom).</li>
            <li><span className="font-semibold">Role-Based Dashboards:</span> Separate, intuitive dashboards for teachers and students.</li>
            <li><span className="font-semibold">Real-time Tracking & Reporting...</span></li>
        </ul>
      </Modal>
    </>
  );
};