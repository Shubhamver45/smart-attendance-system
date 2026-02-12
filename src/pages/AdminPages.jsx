import React, { useState, useEffect } from 'react';
import { BarChartIcon, DownloadIcon, TrashIcon, UsersIcon, ActivityIcon, BookOpenIcon, UserIcon, GraduationCapIcon, ShieldIcon } from '../components/Icons.jsx';

// ─── API URL (same logic as App.jsx) ───────────────────────
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// ─── Reusable Stat Card ────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        </div>
        <p className="text-3xl font-bold text-[#021024]">{value}</p>
        <p className="text-sm font-semibold text-[#052659] mt-1">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
);

// ─── Confirmation Modal ────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-fadeIn">
                <h3 className="text-xl font-bold text-[#021024] mb-2">{title}</h3>
                <p className="text-slate-600 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
                </div>
            </div>
        </div>
    );
};

// ─── Users Tab ─────────────────────────────────────────────
const UsersTab = ({ allUsers, onDelete, onDownload }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.roll_number?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-3 w-full md:w-auto">
                    <input type="text" placeholder="Search users..." className="flex-1 md:w-64 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#052659] focus:border-transparent outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    <select className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#052659] outline-none" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="teacher">Teachers</option>
                        <option value="student">Students</option>
                    </select>
                </div>
                <button onClick={onDownload} className="flex items-center gap-2 px-4 py-2 bg-[#052659] text-white rounded-lg hover:bg-[#021024] transition-colors">
                    <DownloadIcon className="w-4 h-4" /> Download CSV
                </button>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-white/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#052659] text-white">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold">Name</th>
                                <th className="px-6 py-3 text-sm font-semibold">Email</th>
                                <th className="px-6 py-3 text-sm font-semibold">Role</th>
                                <th className="px-6 py-3 text-sm font-semibold">Roll No.</th>
                                <th className="px-6 py-3 text-sm font-semibold">Joined</th>
                                <th className="px-6 py-3 text-sm font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#021024]">{user.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{user.roll_number || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => onDelete(user.id, user.name)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Delete user">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No users found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─── Lectures Tab ──────────────────────────────────────────
const LecturesTab = ({ allLectures, onDelete, onDownload }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLectures = allLectures.filter(lecture =>
        lecture.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lecture.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lecture.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <input type="text" placeholder="Search by subject, teacher..." className="flex-1 md:w-64 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#052659] focus:border-transparent outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <button onClick={onDownload} className="flex items-center gap-2 px-4 py-2 bg-[#052659] text-white rounded-lg hover:bg-[#021024] transition-colors">
                    <DownloadIcon className="w-4 h-4" /> Download CSV
                </button>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-white/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#052659] text-white">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold">Lecture Name</th>
                                <th className="px-6 py-3 text-sm font-semibold">Subject</th>
                                <th className="px-6 py-3 text-sm font-semibold">Teacher</th>
                                <th className="px-6 py-3 text-sm font-semibold">Date</th>
                                <th className="px-6 py-3 text-sm font-semibold">Attendance</th>
                                <th className="px-6 py-3 text-sm font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredLectures.map(lecture => (
                                <tr key={lecture.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#021024]">{lecture.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{lecture.subject}</td>
                                    <td className="px-6 py-4 text-slate-600">{lecture.teacher_name}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(lecture.date || lecture.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">{lecture.attendance_count || 0}</span></td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => onDelete(lecture.id, lecture.name)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Delete lecture">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredLectures.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No lectures found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─── Attendance Tab ────────────────────────────────────────
const AttendanceTab = ({ allAttendance, onDownload }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecords = allAttendance.filter(record =>
        record.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.lecture_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <input type="text" placeholder="Search by student, lecture..." className="flex-1 md:w-64 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#052659] focus:border-transparent outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <button onClick={onDownload} className="flex items-center gap-2 px-4 py-2 bg-[#052659] text-white rounded-lg hover:bg-[#021024] transition-colors">
                    <DownloadIcon className="w-4 h-4" /> Download CSV
                </button>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-white/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#052659] text-white">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold">Student</th>
                                <th className="px-6 py-3 text-sm font-semibold">Roll No.</th>
                                <th className="px-6 py-3 text-sm font-semibold">Lecture</th>
                                <th className="px-6 py-3 text-sm font-semibold">Subject</th>
                                <th className="px-6 py-3 text-sm font-semibold">Status</th>
                                <th className="px-6 py-3 text-sm font-semibold">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredRecords.slice(0, 100).map(record => (
                                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#021024]">{record.student_name}</td>
                                    <td className="px-6 py-4 text-slate-600">{record.roll_number || '-'}</td>
                                    <td className="px-6 py-4 text-slate-600">{record.lecture_name}</td>
                                    <td className="px-6 py-4 text-slate-600">{record.subject}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">{record.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(record.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                            {filteredRecords.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No attendance records found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredRecords.length > 100 && (
                    <p className="text-center text-slate-500 text-sm py-4">
                        Showing 100 of {filteredRecords.length} records. Download CSV for full data.
                    </p>
                )}
            </div>
        </div>
    );
};

// ─── Main Admin Dashboard ──────────────────────────────────
export const AdminDashboard = ({ user, token, setView }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ total_teachers: 0, total_students: 0, total_lectures: 0, total_attendance_records: 0 });
    const [allUsers, setAllUsers] = useState([]);
    const [allLectures, setAllLectures] = useState([]);
    const [allAttendance, setAllAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, usersRes, lecturesRes, attendanceRes] = await Promise.all([
                fetch(`${API_URL}/admin/dashboard-stats`, { headers }),
                fetch(`${API_URL}/admin/all-users`, { headers }),
                fetch(`${API_URL}/admin/all-lectures`, { headers }),
                fetch(`${API_URL}/admin/all-attendance`, { headers })
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (usersRes.ok) setAllUsers(await usersRes.json());
            if (lecturesRes.ok) setAllLectures(await lecturesRes.json());
            if (attendanceRes.ok) setAllAttendance(await attendanceRes.json());
        } catch (error) {
            console.error('Error fetching admin data:', error);
            showToast('Failed to load data', 'error');
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchAllData(); }, []);

    // ─── Delete Handlers ───────────────────────────────────
    const handleDeleteUser = (userId, userName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User',
            message: `Are you sure you want to delete "${userName}"? This will also remove all their related data (lectures, attendance).`,
            onConfirm: async () => {
                try {
                    const res = await fetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE', headers });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    showToast(data.message);
                    fetchAllData();
                } catch (error) {
                    showToast(error.message, 'error');
                }
                setConfirmModal({ isOpen: false });
            }
        });
    };

    const handleDeleteLecture = (lectureId, lectureName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Lecture',
            message: `Are you sure you want to delete "${lectureName}"? All attendance records for this lecture will be removed.`,
            onConfirm: async () => {
                try {
                    const res = await fetch(`${API_URL}/admin/lectures/${lectureId}`, { method: 'DELETE', headers });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    showToast(data.message);
                    fetchAllData();
                } catch (error) {
                    showToast(error.message, 'error');
                }
                setConfirmModal({ isOpen: false });
            }
        });
    };

    // ─── CSV Download Helpers ──────────────────────────────
    const downloadCSV = (data, filename, columns) => {
        const header = columns.map(c => c.label).join(',');
        const rows = data.map(row => columns.map(c => `"${(row[c.key] || '').toString().replace(/"/g, '""')}"`).join(','));
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    const downloadUsers = () => downloadCSV(allUsers, 'users.csv', [
        { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' },
        { key: 'roll_number', label: 'Roll No' }, { key: 'enrollment_number', label: 'Enrollment No' }, { key: 'created_at', label: 'Joined' }
    ]);

    const downloadLectures = () => downloadCSV(allLectures, 'lectures.csv', [
        { key: 'name', label: 'Lecture' }, { key: 'subject', label: 'Subject' }, { key: 'teacher_name', label: 'Teacher' },
        { key: 'date', label: 'Date' }, { key: 'attendance_count', label: 'Attendance' }
    ]);

    const downloadAttendance = () => downloadCSV(allAttendance, 'attendance.csv', [
        { key: 'student_name', label: 'Student' }, { key: 'roll_number', label: 'Roll No' }, { key: 'lecture_name', label: 'Lecture' },
        { key: 'subject', label: 'Subject' }, { key: 'status', label: 'Status' }, { key: 'timestamp', label: 'Time' }
    ]);

    // ─── Tab Config ────────────────────────────────────────
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <ActivityIcon className="w-4 h-4" /> },
        { id: 'users', label: 'Users', icon: <UsersIcon className="w-4 h-4" /> },
        { id: 'lectures', label: 'Lectures', icon: <BookOpenIcon className="w-4 h-4" /> },
        { id: 'attendance', label: 'Attendance', icon: <BarChartIcon className="w-4 h-4" /> }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#052659] mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white animate-fadeIn ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
                    {toast.message}
                </div>
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldIcon className="w-8 h-8 text-[#052659]" />
                    <h1 className="text-3xl font-bold text-[#021024]">Admin Panel</h1>
                </div>
                <p className="text-slate-600">Welcome back, {user.name}. Here's your system overview.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#052659] text-white shadow-lg' : 'bg-white/80 text-[#052659] hover:bg-[#C1E8FF]'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Teachers" value={stats.total_teachers} icon={<UserIcon className="w-6 h-6 text-blue-600" />} color="bg-blue-100" />
                        <StatCard title="Total Students" value={stats.total_students} icon={<GraduationCapIcon className="w-6 h-6 text-green-600" />} color="bg-green-100" />
                        <StatCard title="Total Lectures" value={stats.total_lectures} icon={<BookOpenIcon className="w-6 h-6 text-purple-600" />} color="bg-purple-100" />
                        <StatCard title="Attendance Records" value={stats.total_attendance_records} icon={<BarChartIcon className="w-6 h-6 text-orange-600" />} color="bg-orange-100" />
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/50">
                        <h2 className="text-xl font-bold text-[#021024] mb-4">Recent Attendance</h2>
                        <div className="space-y-3">
                            {allAttendance.slice(0, 5).map(record => (
                                <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-[#021024]">{record.student_name}</p>
                                        <p className="text-sm text-slate-500">{record.lecture_name} · {record.subject}</p>
                                    </div>
                                    <span className="text-sm text-slate-500">{new Date(record.timestamp).toLocaleString()}</span>
                                </div>
                            ))}
                            {allAttendance.length === 0 && <p className="text-slate-500 text-center py-4">No attendance records yet</p>}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && <UsersTab allUsers={allUsers} onDelete={handleDeleteUser} onDownload={downloadUsers} />}
            {activeTab === 'lectures' && <LecturesTab allLectures={allLectures} onDelete={handleDeleteLecture} onDownload={downloadLectures} />}
            {activeTab === 'attendance' && <AttendanceTab allAttendance={allAttendance} onDownload={downloadAttendance} />}
        </div>
    );
};
