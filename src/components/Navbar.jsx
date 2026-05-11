import React from 'react';
// CORRECTED: Added .jsx extension
import { BookOpenIcon, LogOutIcon, BarChartIcon, CalendarDaysIcon, QrCodeIcon, ShieldIcon, UsersIcon, ActivityIcon, UserIcon } from './Icons.jsx';

export const Navbar = ({ user, setView, onLogout, isDarkMode, setIsDarkMode }) => {
    // UPDATED: Admin nav links
    const navLinks = !user ? [] : user.role === 'admin'
        ? [
            { name: 'Dashboard', view: 'adminHome', icon: <ActivityIcon className="w-5 h-5" /> },
            { name: 'Analytics', view: 'adminAnalytics', icon: <BarChartIcon className="w-5 h-5" /> },
            { name: 'Users', view: 'adminUsers', icon: <UsersIcon className="w-5 h-5" /> },
            { name: 'Reports', view: 'adminReports', icon: <BarChartIcon className="w-5 h-5" /> },
            { name: 'Leaves', view: 'adminLeaves', icon: <CalendarDaysIcon className="w-5 h-5" /> }
        ]
        : user.role === 'teacher'
            ? [
                { name: 'My Lectures', view: 'teacherHome', icon: <BookOpenIcon className="w-5 h-5" /> },
                { name: 'Master Reports', view: 'reports', icon: <BarChartIcon className="w-5 h-5" /> }
            ]
            : [
                { name: 'My Attendance', view: 'studentHome', icon: <BookOpenIcon className="w-5 h-5" /> },
                { name: 'Schedule', view: 'viewSchedule', icon: <CalendarDaysIcon className="w-5 h-5" /> },
                { name: 'Profile', view: 'studentProfile', icon: <UserIcon className="w-5 h-5" /> },
                // THIS IS THE NEW BUTTON FOR STUDENTS
                { name: 'Scan QR', view: 'scanQRCode', icon: <QrCodeIcon className="w-5 h-5" />, isPrimary: true }
            ];

    return (
        <header className="bg-white/80 backdrop-blur-md p-4 flex justify-between items-center shadow-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <BookOpenIcon className="w-8 h-8 text-[#052659] dark:text-sky-400" />
                <div>
                    <h1 className="text-xl font-bold text-[#052659] dark:text-white" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>AttendanceHub</h1>
                    {user && <p className="text-sm text-slate-500 dark:text-slate-300">Welcome, {user.name}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                {!user && (
                    <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#052659] dark:text-sky-400 mr-4">
                        <button onClick={() => setView('teacherLogin')} className="hover:opacity-80">Teacher Portal</button>
                        <button onClick={() => setView('studentLogin')} className="hover:opacity-80">Student Portal</button>
                    </nav>
                )}
                {navLinks.map(link => {
                    // Special styling for the "Scan QR" button
                    if (link.isPrimary) {
                        return (
                            <button key={link.view} onClick={() => setView(link.view)} className="font-semibold bg-[#052659] text-white p-2 rounded-lg hover:bg-[#021024] transition-colors flex items-center gap-2">
                                {link.icon}
                                <span className="hidden md:inline">{link.name}</span>
                            </button>
                        )
                    }
                    // Standard buttons
                    return (
                        <button key={link.view} onClick={() => setView(link.view)} className="font-semibold text-[#021024] p-2 rounded-lg hover:bg-[#C1E8FF] transition-colors flex items-center gap-2">
                            {link.icon}
                            <span className="hidden md:inline">{link.name}</span>
                        </button>
                    )
                })}
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="font-semibold flex items-center gap-2 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="text-xl">{isDarkMode ? '☀️' : '🌙'}</span>
                    <span className="hidden md:inline">{isDarkMode ? 'Mode' : 'Mode'}</span>
                </button>
                {user && (
                    <button onClick={onLogout} className="font-semibold flex items-center gap-2 p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors">
                        <LogOutIcon className="w-5 h-5" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                )}
            </div>
        </header>
    );
};