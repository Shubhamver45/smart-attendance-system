import React from 'react';
import { BookOpenIcon, LogOutIcon } from './Icons';

export const Navbar = ({ user, setView, onLogout }) => {
    // This component will only render if a user is logged in.
    if (!user) {
        return null;
    }

    const navLinks = user.role === 'teacher' 
        ? [{ name: 'Dashboard', view: 'teacherDashboard' }, { name: 'Reports', view: 'reports' }]
        : [{ name: 'Dashboard', view: 'studentDashboard' }, { name: 'Schedule', view: 'viewSchedule' }];

    return (
        <header className="bg-white/80 backdrop-blur-md p-4 flex justify-between items-center shadow-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <BookOpenIcon className="w-8 h-8 text-[#052659]"/>
                <div>
                    <h1 className="text-xl font-bold text-[#021024]">AttendanceHub</h1>
                    {/* This now correctly says "Welcome, {user.name}" */}
                    <p className="text-sm text-slate-500">Welcome, {user.name}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {navLinks.map(link => (
                    <button 
                        key={link.view} 
                        onClick={() => setView(link.view)} 
                        className="font-semibold text-[#021024] px-4 py-2 rounded-lg hover:bg-[#C1E8FF] transition-colors"
                    >
                        {link.name}
                    </button>
                ))}
                <button onClick={onLogout} className="font-semibold flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors">
                    <LogOutIcon className="w-5 h-5" /> Logout
                </button>
            </div>
        </header>
    );
};