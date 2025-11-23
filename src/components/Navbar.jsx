import React, { useState } from 'react';
import { BookOpen, LogOut, BarChart, CalendarDays, QrCode, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = ({ user, setView, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) return null;

    const navLinks = user.role === 'teacher' 
        ? [
            { name: 'My Lectures', view: 'teacherHome', icon: BookOpen }, 
            { name: 'Monthly Reports', view: 'reports', icon: BarChart }
          ]
        : [
            { name: 'My Attendance', view: 'studentHome', icon: BookOpen }, 
            { name: 'Schedule', view: 'viewSchedule', icon: CalendarDays },
            { name: 'Scan QR', view: 'scanQRCode', icon: QrCode, isPrimary: true }
          ];

    return (
        <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="bg-white/70 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(user.role === 'teacher' ? 'teacherHome' : 'studentHome')}>
                        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-600/20">
                            <BookOpen className="w-6 h-6"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AttendanceHub</h1>
                            <p className="text-xs text-slate-500 font-medium">Welcome, {user.name}</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        {navLinks.map(link => (
                            <button 
                                key={link.view} 
                                onClick={() => setView(link.view)} 
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                                    ${link.isPrimary 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5' 
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }
                                `}
                            >
                                <link.icon className="w-4 h-4" />
                                <span>{link.name}</span>
                            </button>
                        ))}
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                        <button 
                            onClick={onLogout} 
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {navLinks.map(link => (
                                <button 
                                    key={link.view} 
                                    onClick={() => {
                                        setView(link.view);
                                        setIsMobileMenuOpen(false);
                                    }} 
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                                        ${link.isPrimary 
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    <link.icon className="w-5 h-5" />
                                    <span>{link.name}</span>
                                </button>
                            ))}
                            <div className="border-t border-slate-100 my-2"></div>
                            <button 
                                onClick={onLogout} 
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};