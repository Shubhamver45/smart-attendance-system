import React, { useState, useEffect, useMemo } from 'react';
import { BarChartIcon, DownloadIcon, TrashIcon, UsersIcon, ActivityIcon, BookOpenIcon, UserIcon, GraduationCapIcon, ShieldIcon, XIcon } from '../components/Icons.jsx';

// ─── API URL (same logic as App.jsx) ───────────────────────
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// ─── Reusable Stat Card ────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon, color, borderColor }) => (
    <div className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 ${borderColor || 'border-blue-500'}`}>
        <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
            {subtitle && <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{subtitle}</span>}
        </div>
        <p className="text-3xl font-bold text-[#021024] mt-2">{value ?? '—'}</p>
        <p className="text-sm font-semibold text-[#052659] mt-1">{title}</p>
    </div>
);

// ─── Confirmation Modal ────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDeleting }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-full"><TrashIcon className="w-5 h-5 text-red-600" /></div>
                    <h3 className="text-xl font-bold text-[#021024]">{title}</h3>
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} disabled={isDeleting} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors font-medium disabled:opacity-50">Cancel</button>
                    <button onClick={onConfirm} disabled={isDeleting} className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2">
                        {isDeleting ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> Deleting...</> : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Toast Component ────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
    if (!toast) return null;
    return (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-white animate-fadeIn flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            <span className="font-medium">{toast.message}</span>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><XIcon className="w-4 h-4" /></button>
        </div>
    );
};

// ─── Empty State ────────────────────────────────────────────
const EmptyState = ({ icon, title, description }) => (
    <div className="text-center py-16">
        <div className="inline-block p-4 bg-slate-100 rounded-2xl mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-[#021024] mb-2">{title}</h3>
        <p className="text-slate-500 max-w-md mx-auto">{description}</p>
    </div>
);

// ─── Users Tab ─────────────────────────────────────────────
const UsersTab = ({ allUsers, onDelete, onDownload }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filteredUsers = useMemo(() => allUsers.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.roll_number?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    }), [allUsers, searchQuery, roleFilter]);

    const teacherCount = allUsers.filter(u => u.role === 'teacher').length;
    const studentCount = allUsers.filter(u => u.role === 'student').length;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Summary Bar */}
            <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold border border-blue-200">👨‍🏫 {teacherCount} Teachers</span>
                <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold border border-green-200">🎓 {studentCount} Students</span>
                <span className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200">📊 {filteredUsers.length} Shown</span>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="flex gap-3 flex-1">
                    <input type="text" placeholder="🔍 Search by name, email, ID..." className="flex-1 md:max-w-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#052659] focus:border-transparent outline-none bg-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    <select className="px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#052659] outline-none bg-white font-medium" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="teacher">Teachers</option>
                        <option value="student">Students</option>
                    </select>
                </div>
                <button onClick={onDownload} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#052659] text-white rounded-xl hover:bg-[#021024] transition-colors font-medium shadow-md hover:shadow-lg">
                    <DownloadIcon className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Table */}
            {filteredUsers.length === 0 ? (
                <EmptyState icon={<UsersIcon className="w-8 h-8 text-slate-400" />} title="No users found" description="Try adjusting your search or filter criteria." />
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gradient-to-r from-[#052659] to-[#0A3A7E] text-white">
                                    <th className="px-6 py-4 text-sm font-semibold">Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold">Email</th>
                                    <th className="px-6 py-4 text-sm font-semibold">Role</th>
                                    <th className="px-6 py-4 text-sm font-semibold hidden md:table-cell">ID</th>
                                    <th className="px-6 py-4 text-sm font-semibold hidden lg:table-cell">Roll No.</th>
                                    <th className="px-6 py-4 text-sm font-semibold hidden lg:table-cell">Joined</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user, idx) => (
                                    <tr key={user.id} className={`hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${user.role === 'teacher' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                                    {user.role === 'teacher' ? <UserIcon className="w-4 h-4 text-blue-600" /> : <GraduationCapIcon className="w-4 h-4 text-green-600" />}
                                                </div>
                                                <span className="font-semibold text-[#021024]">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm font-mono hidden md:table-cell">{user.id}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm hidden lg:table-cell">{user.roll_number || '—'}</td>
                                        <td className="px-6 py-4 text-slate-400 text-sm hidden lg:table-cell">{user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => onDelete(user.id, user.name)} className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all hover:shadow-sm" title={`Delete ${user.name}`}>
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-500 font-medium">
                        Showing {filteredUsers.length} of {allUsers.length} users
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Lectures Tab ──────────────────────────────────────────
const LecturesTab = ({ allLectures, onDelete, onDownload }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLectures = useMemo(() => allLectures.filter(lecture =>
        lecture.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lecture.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lecture.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [allLectures, searchQuery]);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold border border-purple-200">📚 {allLectures.length} Total Lectures</span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <input type="text" placeholder="🔍 Search by name, subject, teacher..." className="flex-1 md:max-w-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#052659] focus:border-transparent outline-none bg-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <button onClick={onDownload} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#052659] text-white rounded-xl hover:bg-[#021024] transition-colors font-medium shadow-md hover:shadow-lg">
                    <DownloadIcon className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {filteredLectures.length === 0 ? (
                <EmptyState icon={<BookOpenIcon className="w-8 h-8 text-slate-400" />} title="No lectures found" description={allLectures.length === 0 ? "No lectures have been created yet. Teachers can create lectures from their dashboard." : "Try adjusting your search criteria."} />
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gradient-to-r from-[#052659] to-[#0A3A7E] text-white">
                                    <th className="px-6 py-4 text-sm font-semibold">Lecture</th>
                                    <th className="px-6 py-4 text-sm font-semibold">Subject</th>
                                    <th className="px-6 py-4 text-sm font-semibold">Teacher</th>
                                    <th className="px-6 py-4 text-sm font-semibold hidden md:table-cell">Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-center">Attendance</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLectures.map((lecture, idx) => (
                                    <tr key={lecture.id} className={`hover:bg-purple-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-purple-100"><BookOpenIcon className="w-4 h-4 text-purple-600" /></div>
                                                <span className="font-semibold text-[#021024]">{lecture.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{lecture.subject || '—'}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-[#021024] text-sm">{lecture.teacher_name}</p>
                                                <p className="text-xs text-slate-400">{lecture.teacher_email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm hidden md:table-cell">
                                            {(lecture.date || lecture.created_at) ? new Date(lecture.date || lecture.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${(lecture.attendance_count || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {lecture.attendance_count || 0} students
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => onDelete(lecture.id, lecture.name)} className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all hover:shadow-sm" title={`Delete ${lecture.name}`}>
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-500 font-medium">
                        Showing {filteredLectures.length} of {allLectures.length} lectures
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Attendance Tab ────────────────────────────────────────
const AttendanceTab = ({ allAttendance, onDownload }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const DISPLAY_LIMIT = 200;

    const filteredRecords = useMemo(() => allAttendance.filter(record =>
        record.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.lecture_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [allAttendance, searchQuery]);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-semibold border border-orange-200">📋 {allAttendance.length} Total Records</span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <input type="text" placeholder="🔍 Search by student, lecture, roll number..." className="flex-1 md:max-w-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#052659] focus:border-transparent outline-none bg-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <button onClick={onDownload} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#052659] text-white rounded-xl hover:bg-[#021024] transition-colors font-medium shadow-md hover:shadow-lg">
                    <DownloadIcon className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {filteredRecords.length === 0 ? (
                <EmptyState icon={<BarChartIcon className="w-8 h-8 text-slate-400" />} title="No attendance records found" description={allAttendance.length === 0 ? "No attendance has been marked yet. Records will appear here once students start marking attendance." : "Try adjusting your search criteria."} />
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gradient-to-r from-[#052659] to-[#0A3A7E] text-white">
                                    <th className="px-6 py-4 text-sm font-semibold">Student</th>
                                    <th className="px-6 py-4 text-sm font-semibold hidden md:table-cell">Roll No.</th>
                                    <th className="px-6 py-4 text-sm font-semibold">Lecture</th>
                                    <th className="px-6 py-4 text-sm font-semibold hidden md:table-cell">Subject</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-center">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold hidden lg:table-cell">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRecords.slice(0, DISPLAY_LIMIT).map((record, idx) => (
                                    <tr key={record.id} className={`hover:bg-orange-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-100"><GraduationCapIcon className="w-4 h-4 text-emerald-600" /></div>
                                                <span className="font-semibold text-[#021024]">{record.student_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm font-mono hidden md:table-cell">{record.roll_number || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">{record.lecture_name}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm hidden md:table-cell">{record.subject || '—'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">{record.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm hidden lg:table-cell">
                                            {record.timestamp ? new Date(record.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-500 font-medium flex items-center justify-between">
                        <span>Showing {Math.min(filteredRecords.length, DISPLAY_LIMIT)} of {filteredRecords.length} records</span>
                        {filteredRecords.length > DISPLAY_LIMIT && <span className="text-[#052659] font-semibold">Download CSV for complete data →</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Admin Dashboard ──────────────────────────────────
export const AdminDashboard = ({ user, token, setView, initialTab = 'overview' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [stats, setStats] = useState({ total_teachers: 0, total_students: 0, total_lectures: 0, total_attendance_records: 0 });
    const [allUsers, setAllUsers] = useState([]);
    const [allLectures, setAllLectures] = useState([]);
    const [allAttendance, setAllAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Sync tab when initialTab changes (from Navbar navigation)
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
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

            if (!statsRes.ok || !usersRes.ok || !lecturesRes.ok || !attendanceRes.ok) {
                throw new Error('One or more API calls failed');
            }

            setStats(await statsRes.json());
            setAllUsers(await usersRes.json());
            setAllLectures(await lecturesRes.json());
            setAllAttendance(await attendanceRes.json());
        } catch (error) {
            console.error('Error fetching admin data:', error);
            showToast('Failed to load data. Please refresh.', 'error');
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchAllData(); }, []);

    // ─── Delete Handlers ───────────────────────────────────
    const handleDeleteUser = (userId, userName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User',
            message: `Are you sure you want to delete "${userName}"? This will permanently remove the user and all their related data (lectures, attendance records). This action cannot be undone.`,
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const res = await fetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE', headers });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    showToast(`✅ ${data.message}`);
                    await fetchAllData(); // Refresh all data
                } catch (error) {
                    showToast(`❌ ${error.message}`, 'error');
                }
                setIsDeleting(false);
                setConfirmModal({ isOpen: false });
            }
        });
    };

    const handleDeleteLecture = (lectureId, lectureName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Lecture',
            message: `Are you sure you want to delete "${lectureName}"? All attendance records for this lecture will also be permanently removed. This action cannot be undone.`,
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const res = await fetch(`${API_URL}/admin/lectures/${lectureId}`, { method: 'DELETE', headers });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    showToast(`✅ ${data.message}`);
                    await fetchAllData(); // Refresh all data
                } catch (error) {
                    showToast(`❌ ${error.message}`, 'error');
                }
                setIsDeleting(false);
                setConfirmModal({ isOpen: false });
            }
        });
    };

    // ─── CSV Download Helpers ──────────────────────────────
    const downloadCSV = (data, filename, columns) => {
        if (data.length === 0) {
            showToast('No data to export', 'error');
            return;
        }
        const header = columns.map(c => c.label).join(',');
        const rows = data.map(row => columns.map(c => {
            let val = row[c.key] ?? '';
            val = val.toString().replace(/"/g, '""');
            return `"${val}"`;
        }).join(','));
        const csv = '\uFEFF' + [header, ...rows].join('\n'); // BOM for Excel compatibility
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
        showToast(`📁 Downloaded ${filename} (${data.length} records)`);
    };

    const downloadUsers = () => downloadCSV(allUsers, `users_export_${new Date().toISOString().slice(0, 10)}.csv`, [
        { key: 'id', label: 'User ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' },
        { key: 'roll_number', label: 'Roll Number' }, { key: 'enrollment_number', label: 'Enrollment Number' }, { key: 'created_at', label: 'Date Joined' }
    ]);

    const downloadLectures = () => downloadCSV(allLectures, `lectures_export_${new Date().toISOString().slice(0, 10)}.csv`, [
        { key: 'id', label: 'Lecture ID' }, { key: 'name', label: 'Lecture Name' }, { key: 'subject', label: 'Subject' }, { key: 'teacher_name', label: 'Teacher' },
        { key: 'teacher_email', label: 'Teacher Email' }, { key: 'date', label: 'Date' }, { key: 'attendance_count', label: 'Attendance Count' }
    ]);

    const downloadAttendance = () => downloadCSV(allAttendance, `attendance_export_${new Date().toISOString().slice(0, 10)}.csv`, [
        { key: 'student_name', label: 'Student Name' }, { key: 'roll_number', label: 'Roll Number' }, { key: 'enrollment_number', label: 'Enrollment Number' },
        { key: 'lecture_name', label: 'Lecture' }, { key: 'subject', label: 'Subject' }, { key: 'status', label: 'Status' }, { key: 'timestamp', label: 'Date & Time' }
    ]);

    // ─── Tab Config ────────────────────────────────────────
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <ActivityIcon className="w-4 h-4" /> },
        { id: 'users', label: `Users (${allUsers.length})`, icon: <UsersIcon className="w-4 h-4" /> },
        { id: 'lectures', label: `Lectures (${allLectures.length})`, icon: <BookOpenIcon className="w-4 h-4" /> },
        { id: 'attendance', label: `Attendance (${allAttendance.length})`, icon: <BarChartIcon className="w-4 h-4" /> }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-[#052659] mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium text-lg">Loading admin panel...</p>
                    <p className="text-slate-400 text-sm mt-1">Fetching system data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1400px] mx-auto">
            {/* Toast */}
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => !isDeleting && setConfirmModal({ isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDeleting={isDeleting}
            />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[#052659] rounded-xl"><ShieldIcon className="w-6 h-6 text-white" /></div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#021024]">Admin Panel</h1>
                        <p className="text-slate-500 text-sm">Welcome back, {user.name} · System Administrator</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap text-sm ${activeTab === tab.id
                                ? 'bg-[#052659] text-white shadow-lg shadow-[#052659]/30'
                                : 'bg-white text-[#052659] hover:bg-[#C1E8FF] border border-slate-200'
                            }`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
                <button onClick={fetchAllData} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm bg-white text-slate-500 hover:bg-slate-100 border border-slate-200 ml-auto" title="Refresh data">
                    🔄 Refresh
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fadeIn">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Teachers" value={stats.total_teachers} subtitle="Active" icon={<UserIcon className="w-6 h-6 text-blue-600" />} color="bg-blue-100" borderColor="border-blue-500" />
                        <StatCard title="Total Students" value={stats.total_students} subtitle="Enrolled" icon={<GraduationCapIcon className="w-6 h-6 text-green-600" />} color="bg-green-100" borderColor="border-green-500" />
                        <StatCard title="Total Lectures" value={stats.total_lectures} subtitle="Created" icon={<BookOpenIcon className="w-6 h-6 text-purple-600" />} color="bg-purple-100" borderColor="border-purple-500" />
                        <StatCard title="Attendance Records" value={stats.total_attendance_records} subtitle="Marked" icon={<BarChartIcon className="w-6 h-6 text-orange-600" />} color="bg-orange-100" borderColor="border-orange-500" />
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onClick={() => setActiveTab('users')} className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-all text-left border border-slate-200 hover:border-blue-300 group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors"><UsersIcon className="w-5 h-5 text-blue-600" /></div>
                                <span className="font-bold text-[#021024]">Manage Users</span>
                            </div>
                            <p className="text-sm text-slate-500">View, search, and manage all teachers and students</p>
                        </button>
                        <button onClick={() => setActiveTab('lectures')} className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-all text-left border border-slate-200 hover:border-purple-300 group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors"><BookOpenIcon className="w-5 h-5 text-purple-600" /></div>
                                <span className="font-bold text-[#021024]">View Lectures</span>
                            </div>
                            <p className="text-sm text-slate-500">Browse all lectures across all teachers</p>
                        </button>
                        <button onClick={() => setActiveTab('attendance')} className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-all text-left border border-slate-200 hover:border-orange-300 group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors"><BarChartIcon className="w-5 h-5 text-orange-600" /></div>
                                <span className="font-bold text-[#021024]">Attendance Reports</span>
                            </div>
                            <p className="text-sm text-slate-500">View all records and export CSV reports</p>
                        </button>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-[#021024]">Recent Attendance</h2>
                            {allAttendance.length > 5 && (
                                <button onClick={() => setActiveTab('attendance')} className="text-sm text-[#052659] font-semibold hover:underline">View all →</button>
                            )}
                        </div>
                        {allAttendance.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="inline-block p-3 bg-slate-100 rounded-full mb-3"><BarChartIcon className="w-6 h-6 text-slate-400" /></div>
                                <p className="text-slate-500 font-medium">No attendance records yet</p>
                                <p className="text-slate-400 text-sm mt-1">Records will show here once students mark attendance</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {allAttendance.slice(0, 8).map(record => (
                                    <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg"><GraduationCapIcon className="w-4 h-4 text-green-600" /></div>
                                            <div>
                                                <p className="font-semibold text-[#021024] text-sm">{record.student_name}</p>
                                                <p className="text-xs text-slate-500">{record.lecture_name} {record.subject ? `· ${record.subject}` : ''}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">{record.status}</span>
                                            <p className="text-xs text-slate-400 mt-1">{new Date(record.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'users' && <UsersTab allUsers={allUsers} onDelete={handleDeleteUser} onDownload={downloadUsers} />}
            {activeTab === 'lectures' && <LecturesTab allLectures={allLectures} onDelete={handleDeleteLecture} onDownload={downloadLectures} />}
            {activeTab === 'attendance' && <AttendanceTab allAttendance={allAttendance} onDownload={downloadAttendance} />}
        </div>
    );
};
