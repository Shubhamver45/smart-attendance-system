import React from 'react';
import { BookOpenIcon, LogOutIcon, BarChartIcon, CalendarDaysIcon } from './Icons';

export const Navbar = ({ user, setView, onLogout }) => {
    // This component will only render if a user is logged in.
    if (!user) {
        return null;
    }

    // Updated navLinks to include icons for a responsive layout
    const navLinks = user.role === 'teacher' 
        ? [{ name: 'Dashboard', view: 'teacherDashboard', icon: <BookOpenIcon className="w-5 h-5"/> }, { name: 'Reports', view: 'reports', icon: <BarChartIcon className="w-5 h-5"/> }]
        : [{ name: 'Dashboard', view: 'studentDashboard', icon: <BookOpenIcon className="w-5 h-5"/> }, { name: 'Schedule', view: 'viewSchedule', icon: <CalendarDaysIcon className="w-5 h-5"/> }];

    return (
        <header className="bg-white/80 backdrop-blur-md p-4 flex justify-between items-center shadow-md sticky top-0 z-20">
            {/* Left side: App Name and Welcome Message */}
            <div className="flex items-center gap-3">
                <BookOpenIcon className="w-8 h-8 text-[#052659]"/>
                <div>
                    <h1 className="text-xl font-bold text-[#021024]">AttendanceHub</h1>
                    <p className="text-sm text-slate-500">Welcome, {user.name}</p>
                </div>
            </div>

            {/* Right side: Navigation Links and Logout (Updated for responsiveness) */}
            <div className="flex items-center gap-2 md:gap-4">
                {navLinks.map(link => (
                    <button 
                        key={link.view} 
                        onClick={() => setView(link.view)} 
                        className="font-semibold text-[#021024] p-2 rounded-lg hover:bg-[#C1E8FF] transition-colors flex items-center gap-2"
                    >
                        {link.icon}
                        {/* This span is hidden on small (mobile) screens */}
                        <span className="hidden md:inline">{link.name}</span>
                    </button>
                ))}
                <button onClick={onLogout} className="font-semibold flex items-center gap-2 p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors">
                    <LogOutIcon className="w-5 h-5" />
                    {/* This span is hidden on small (mobile) screens */}
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};