import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/app/store/useAppStore';
import { ThemeToggle } from '@/components/molecules/ThemeToggle';
import { Button } from '@/components/atoms/Button';
import { Home, Calendar, QrCode, User, LogOut, BookOpen } from 'lucide-react';
import { cn } from '@/utils/utils';

export const Navbar = () => {
    const { user, logout } = useAppStore();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = user?.role === 'teacher' ? [
        { label: 'Dashboard', path: '/teacher/dashboard', icon: <Home className="h-5 w-5" /> },
        { label: 'Reports', path: '/teacher/reports', icon: <BookOpen className="h-5 w-5" /> },
        { label: 'Create', path: '/teacher/create-lecture', icon: <QrCode className="h-5 w-5" /> },
    ] : user?.role === 'student' ? [
        { label: 'Home', path: '/student/dashboard', icon: <Home className="h-5 w-5" /> },
        { label: 'Schedule', path: '/student/schedule', icon: <Calendar className="h-5 w-5" /> },
        { label: 'Scan', path: '/student/scan', icon: <QrCode className="h-5 w-5" /> },
    ] : [];

    if (!user) {
        return (
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold text-primary">SmartAttend</Link>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link to="/login">
                            <Button variant="primary" size="sm">Login</Button>
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold text-primary">SmartAttend</Link>

                    <div className="flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link key={item.path} to={item.path}>
                                <Button
                                    variant={isActive(item.path) ? 'primary' : 'ghost'}
                                    size="sm"
                                    className="gap-2"
                                >
                                    {item.icon}
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium hidden lg:block">Hi, {user.name}</span>
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark backdrop-blur-lg pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => (
                        <Link key={item.path} to={item.path} className="flex-1">
                            <div className={cn(
                                "flex flex-col items-center justify-center h-full gap-1 transition-colors",
                                isActive(item.path) ? "text-primary" : "text-gray-500 dark:text-gray-400"
                            )}>
                                {item.icon}
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </div>
                        </Link>
                    ))}
                    <button onClick={logout} className="flex-1 flex flex-col items-center justify-center h-full gap-1 text-gray-500 dark:text-gray-400">
                        <LogOut className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Top Bar for Theme Toggle & Logo */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 px-4 flex items-center justify-between bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <span className="font-bold text-primary">SmartAttend</span>
                <ThemeToggle />
            </div>
        </>
    );
};
