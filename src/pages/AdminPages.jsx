import React, { useState, useEffect, useMemo } from 'react';
import { BarChartIcon, DownloadIcon, TrashIcon, UsersIcon, ActivityIcon, BookOpenIcon, UserIcon, GraduationCapIcon, ShieldIcon, XIcon } from '../components/Icons.jsx';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// ════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ════════════════════════════════════════════════════════════

const Toast = ({ toast, onClose }) => {
    if (!toast) return null;
    return (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-white animate-fadeIn flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
            <span className="font-medium text-sm">{toast.message}</span>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg"><XIcon className="w-3 h-3" /></button>
        </div>
    );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDeleting }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-full"><TrashIcon className="w-5 h-5 text-red-600" /></div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium disabled:opacity-50">Cancel</button>
                    <button onClick={onConfirm} disabled={isDeleting} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                        {isDeleting ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>Deleting...</> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// CHART COMPONENTS (Pure CSS/SVG — no external libraries)
// ════════════════════════════════════════════════════════════

const MiniBarChart = ({ data, maxBars = 12 }) => {
    if (!data || data.length === 0) return <div className="text-gray-500 text-sm text-center py-8">No data available</div>;
    const displayData = data.slice(-maxBars);
    const maxVal = Math.max(...displayData.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-1.5 h-32 px-2">
            {displayData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400 font-medium">{d.count}</span>
                    <div className="w-full rounded-t-md bg-emerald-500 transition-all duration-500 hover:bg-emerald-400"
                        style={{ height: `${Math.max((d.count / maxVal) * 100, 4)}%`, minHeight: '4px' }}
                        title={`${d.date}: ${d.count} records`}></div>
                    <span className="text-[9px] text-gray-400 truncate w-full text-center">{new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                </div>
            ))}
        </div>
    );
};

const SubjectBars = ({ data }) => {
    if (!data || data.length === 0) return <div className="text-gray-500 text-sm text-center py-8">No subject data</div>;
    const maxCount = Math.max(...data.map(d => parseInt(d.attendance_count)), 1);
    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-red-400'];
    return (
        <div className="space-y-3">
            {data.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-24 truncate font-medium" title={item.subject}>{item.subject}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-700 flex items-center justify-end pr-2`}
                            style={{ width: `${Math.max((parseInt(item.attendance_count) / maxCount) * 100, 8)}%` }}>
                            <span className="text-[10px] text-white font-bold">{item.attendance_count}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const TopStudentsList = ({ students }) => {
    if (!students || students.length === 0) return <div className="text-gray-500 text-sm text-center py-8">No attendance data yet</div>;
    const medals = ['🥇', '🥈', '🥉'];
    return (
        <div className="space-y-2">
            {students.slice(0, 6).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-base w-6 text-center">{medals[i] || `${i + 1}.`}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.roll_number || s.enrollment_number || s.id}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{s.attendance_count} classes</span>
                </div>
            ))}
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// TAB COMPONENTS
// ════════════════════════════════════════════════════════════

const UsersTab = ({ allUsers, onDelete, onDownload }) => {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filtered = useMemo(() => allUsers.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.id?.toLowerCase().includes(q) || u.roll_number?.toLowerCase().includes(q);
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    }), [allUsers, search, roleFilter]);

    const teachers = allUsers.filter(u => u.role === 'teacher').length;
    const students = allUsers.filter(u => u.role === 'student').length;

    return (
        <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-200">{teachers} Teachers</span>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">{students} Students</span>
                <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">{filtered.length} Shown</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Search by name, email, ID..." className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
                <select className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white font-medium" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="all">All Roles</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                </select>
                <button onClick={onDownload} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium whitespace-nowrap"><DownloadIcon className="w-4 h-4" />Export</button>
            </div>
            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <UsersIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No users found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className="bg-[#1a1d23] text-gray-300">
                                <th className="px-5 py-3 font-semibold">User</th>
                                <th className="px-5 py-3 font-semibold">Email</th>
                                <th className="px-5 py-3 font-semibold">Role</th>
                                <th className="px-5 py-3 font-semibold hidden md:table-cell">Roll/ID</th>
                                <th className="px-5 py-3 font-semibold hidden lg:table-cell">Joined</th>
                                <th className="px-5 py-3 font-semibold text-center w-16">⚙️</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((u, i) => (
                                    <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-5 py-3"><div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${u.role === 'teacher' ? 'bg-blue-500' : 'bg-emerald-500'}`}>{u.name?.[0]?.toUpperCase()}</div>
                                            <span className="font-semibold text-gray-800">{u.name}</span>
                                        </div></td>
                                        <td className="px-5 py-3 text-gray-500">{u.email}</td>
                                        <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${u.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{u.role}</span></td>
                                        <td className="px-5 py-3 text-gray-400 font-mono text-xs hidden md:table-cell">{u.roll_number || u.id}</td>
                                        <td className="px-5 py-3 text-gray-400 text-xs hidden lg:table-cell">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}</td>
                                        <td className="px-5 py-3 text-center"><button onClick={() => onDelete(u.id, u.name)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><TrashIcon className="w-4 h-4" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">Showing {filtered.length} of {allUsers.length} users</div>
                </div>
            )}
        </div>
    );
};

const LecturesTab = ({ activeLectures, archivedLectures, onDelete, onDownload }) => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const allLectures = [...activeLectures, ...archivedLectures];

    const filtered = useMemo(() => {
        let list = filter === 'active' ? activeLectures : filter === 'archived' ? archivedLectures : allLectures;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(l => l.name?.toLowerCase().includes(q) || l.subject?.toLowerCase().includes(q) || l.teacher_name?.toLowerCase().includes(q));
        }
        return list;
    }, [activeLectures, archivedLectures, search, filter]);

    return (
        <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">{activeLectures.length} Active</span>
                <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">{archivedLectures.length} Archived</span>
                <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">{allLectures.length} Total</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Search lectures..." className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
                <select className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white font-medium" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="all">All Lectures</option>
                    <option value="active">Active Only</option>
                    <option value="archived">Archived Only</option>
                </select>
                <button onClick={onDownload} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium whitespace-nowrap"><DownloadIcon className="w-4 h-4" />Export</button>
            </div>
            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <BookOpenIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">{allLectures.length === 0 ? 'No lectures created yet' : 'No matching lectures'}</p>
                    <p className="text-gray-400 text-xs mt-1">Lectures are preserved here even after auto-deletion</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className="bg-[#1a1d23] text-gray-300">
                                <th className="px-5 py-3 font-semibold">Lecture</th>
                                <th className="px-5 py-3 font-semibold">Teacher</th>
                                <th className="px-5 py-3 font-semibold hidden md:table-cell">Date</th>
                                <th className="px-5 py-3 font-semibold text-center">Attendance</th>
                                <th className="px-5 py-3 font-semibold text-center">Status</th>
                                <th className="px-5 py-3 font-semibold text-center w-16">⚙️</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((l, i) => (
                                    <tr key={`${l.status}-${l.id}`} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-5 py-3"><div>
                                            <p className="font-semibold text-gray-800">{l.name}</p>
                                            <p className="text-xs text-gray-400">{l.subject || '—'}</p>
                                        </div></td>
                                        <td className="px-5 py-3 text-gray-600 text-xs">{l.teacher_name || '—'}</td>
                                        <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{(l.date || l.created_at) ? new Date(l.date || l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}</td>
                                        <td className="px-5 py-3 text-center"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${(l.attendance_count || 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{l.attendance_count || 0}</span></td>
                                        <td className="px-5 py-3 text-center"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{l.status === 'active' ? '● Live' : '📦 Archived'}</span></td>
                                        <td className="px-5 py-3 text-center">{l.status === 'active' ? <button onClick={() => onDelete(l.id, l.name)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><TrashIcon className="w-4 h-4" /></button> : <span className="text-gray-300 text-xs">—</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">Showing {filtered.length} lectures</div>
                </div>
            )}
        </div>
    );
};

const AttendanceTab = ({ activeAttendance, archivedAttendance, onDownload }) => {
    const [search, setSearch] = useState('');
    const allRecords = [...activeAttendance, ...archivedAttendance];

    const filtered = useMemo(() => {
        if (!search) return allRecords;
        const q = search.toLowerCase();
        return allRecords.filter(r => r.student_name?.toLowerCase().includes(q) || r.lecture_name?.toLowerCase().includes(q) || r.roll_number?.toLowerCase().includes(q));
    }, [activeAttendance, archivedAttendance, search]);

    return (
        <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">{activeAttendance.length} Active</span>
                <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">{archivedAttendance.length} Archived</span>
                <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">{allRecords.length} Total</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Search by student, lecture, roll no..." className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={onDownload} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium whitespace-nowrap"><DownloadIcon className="w-4 h-4" />Export</button>
            </div>
            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <BarChartIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No attendance records</p>
                    <p className="text-gray-400 text-xs mt-1">Records appear here once students mark attendance</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className="bg-[#1a1d23] text-gray-300">
                                <th className="px-5 py-3 font-semibold">Student</th>
                                <th className="px-5 py-3 font-semibold hidden md:table-cell">Roll No.</th>
                                <th className="px-5 py-3 font-semibold">Lecture</th>
                                <th className="px-5 py-3 font-semibold text-center">Status</th>
                                <th className="px-5 py-3 font-semibold hidden lg:table-cell">Time</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.slice(0, 200).map((r, i) => (
                                    <tr key={`${r.record_status}-${r.id}-${i}`} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-5 py-3"><div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">{r.student_name?.[0]?.toUpperCase()}</div>
                                            <span className="font-medium text-gray-800">{r.student_name}</span>
                                        </div></td>
                                        <td className="px-5 py-3 text-gray-400 font-mono text-xs hidden md:table-cell">{r.roll_number || '—'}</td>
                                        <td className="px-5 py-3 text-gray-600 text-xs">{r.lecture_name || '—'}</td>
                                        <td className="px-5 py-3 text-center"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">{r.status}</span></td>
                                        <td className="px-5 py-3 text-gray-400 text-xs hidden lg:table-cell">{r.timestamp ? new Date(r.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                        <span>Showing {Math.min(filtered.length, 200)} of {filtered.length}</span>
                        {filtered.length > 200 && <span className="text-emerald-600 font-medium">Export CSV for full data</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════

export const AdminDashboard = ({ user, token, setView, initialTab = 'overview' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [stats, setStats] = useState({});
    const [allUsers, setAllUsers] = useState([]);
    const [activeLectures, setActiveLectures] = useState([]);
    const [archivedLectures, setArchivedLectures] = useState([]);
    const [activeAttendance, setActiveAttendance] = useState([]);
    const [archivedAttendance, setArchivedAttendance] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [topStudents, setTopStudents] = useState([]);
    const [subjectData, setSubjectData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
    const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 4000); };

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, usersRes, lecturesRes, attendanceRes, trendRes, topRes, subjectRes] = await Promise.all([
                fetch(`${API_URL}/admin/dashboard-stats`, { headers }),
                fetch(`${API_URL}/admin/all-users`, { headers }),
                fetch(`${API_URL}/admin/combined-lectures`, { headers }),
                fetch(`${API_URL}/admin/combined-attendance`, { headers }),
                fetch(`${API_URL}/admin/attendance-trend`, { headers }),
                fetch(`${API_URL}/admin/top-students`, { headers }),
                fetch(`${API_URL}/admin/attendance-by-subject`, { headers }),
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (usersRes.ok) setAllUsers(await usersRes.json());
            if (lecturesRes.ok) {
                const data = await lecturesRes.json();
                setActiveLectures(data.active || []);
                setArchivedLectures(data.archived || []);
            }
            if (attendanceRes.ok) {
                const data = await attendanceRes.json();
                setActiveAttendance(data.active || []);
                setArchivedAttendance(data.archived || []);
            }
            if (trendRes.ok) setTrendData(await trendRes.json());
            if (topRes.ok) setTopStudents(await topRes.json());
            if (subjectRes.ok) setSubjectData(await subjectRes.json());
        } catch (error) {
            console.error('Error fetching admin data:', error);
            showToast('Failed to load data', 'error');
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchAllData(); }, []);

    // Delete handlers
    const handleDeleteUser = (userId, userName) => {
        setConfirmModal({
            isOpen: true, title: 'Delete User', message: `Permanently delete "${userName}" and all their data?`,
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const res = await fetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE', headers });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    showToast(data.message); await fetchAllData();
                } catch (e) { showToast(e.message, 'error'); }
                setIsDeleting(false); setConfirmModal({ isOpen: false });
            }
        });
    };

    const handleDeleteLecture = (lectureId, lectureName) => {
        setConfirmModal({
            isOpen: true, title: 'Delete Lecture', message: `Delete "${lectureName}"? Data will be archived and preserved.`,
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const res = await fetch(`${API_URL}/admin/lectures/${lectureId}`, { method: 'DELETE', headers });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    showToast(data.message); await fetchAllData();
                } catch (e) { showToast(e.message, 'error'); }
                setIsDeleting(false); setConfirmModal({ isOpen: false });
            }
        });
    };

    // CSV helpers
    const downloadCSV = (data, filename, columns) => {
        if (!data.length) { showToast('No data to export', 'error'); return; }
        const h = columns.map(c => c.label).join(',');
        const rows = data.map(r => columns.map(c => `"${(r[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(','));
        const csv = '\uFEFF' + [h, ...rows].join('\n');
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        a.download = filename; a.click(); showToast(`Downloaded ${filename}`);
    };

    const downloadUsers = () => downloadCSV(allUsers, `users_${new Date().toISOString().slice(0, 10)}.csv`, [
        { key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'roll_number', label: 'Roll No' }, { key: 'enrollment_number', label: 'Enrollment No' }, { key: 'created_at', label: 'Joined' }
    ]);
    const downloadLectures = () => downloadCSV([...activeLectures, ...archivedLectures], `lectures_${new Date().toISOString().slice(0, 10)}.csv`, [
        { key: 'name', label: 'Lecture' }, { key: 'subject', label: 'Subject' }, { key: 'teacher_name', label: 'Teacher' }, { key: 'date', label: 'Date' }, { key: 'attendance_count', label: 'Attendance' }, { key: 'status', label: 'Status' }
    ]);
    const downloadAttendance = () => downloadCSV([...activeAttendance, ...archivedAttendance], `attendance_${new Date().toISOString().slice(0, 10)}.csv`, [
        { key: 'student_name', label: 'Student' }, { key: 'roll_number', label: 'Roll No' }, { key: 'lecture_name', label: 'Lecture' }, { key: 'status', label: 'Status' }, { key: 'timestamp', label: 'Time' }
    ]);

    // Tab config
    const totalLectures = activeLectures.length + archivedLectures.length;
    const totalAttendance = activeAttendance.length + archivedAttendance.length;
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <ActivityIcon className="w-4 h-4" /> },
        { id: 'users', label: `Users (${allUsers.length})`, icon: <UsersIcon className="w-4 h-4" /> },
        { id: 'lectures', label: `Lectures (${totalLectures})`, icon: <BookOpenIcon className="w-4 h-4" /> },
        { id: 'attendance', label: `Attendance (${totalAttendance})`, icon: <BarChartIcon className="w-4 h-4" /> }
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5]">
            <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading admin panel...</p></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f0f2f5]">
            <Toast toast={toast} onClose={() => setToast(null)} />
            <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => !isDeleting && setConfirmModal({ isOpen: false })} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} isDeleting={isDeleting} />

            <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <ShieldIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Welcome back 👋</p>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{user.name}</h1>
                        </div>
                    </div>
                    <button onClick={fetchAllData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm">🔄 Refresh Data</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#1a1d23] text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══ OVERVIEW TAB ═══ */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'TOTAL STUDENTS', value: stats.total_students || 0, color: 'bg-emerald-500', icon: <GraduationCapIcon className="w-5 h-5 text-white" />, sub: 'Enrolled' },
                                { label: 'TOTAL TEACHERS', value: stats.total_teachers || 0, color: 'bg-blue-500', icon: <UserIcon className="w-5 h-5 text-white" />, sub: 'Active' },
                                { label: 'TOTAL LECTURES', value: stats.total_lectures || 0, color: 'bg-purple-500', icon: <BookOpenIcon className="w-5 h-5 text-white" />, sub: `${stats.active_lectures || 0} active · ${stats.archived_lectures || 0} archived` },
                                { label: 'ATTENDANCE', value: stats.total_attendance_records || 0, color: 'bg-orange-500', icon: <BarChartIcon className="w-5 h-5 text-white" />, sub: 'Records marked' }
                            ].map((card, i) => (
                                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>{card.icon}</div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                                    <p className="text-xs font-bold text-gray-400 tracking-wider mt-1">{card.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-800">Attendance Trend</h3>
                                    <span className="text-xs text-gray-400">Last 30 days</span>
                                </div>
                                <MiniBarChart data={trendData} />
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-800">Attendance by Subject</h3>
                                    <span className="text-xs text-gray-400">{subjectData.length} subjects</span>
                                </div>
                                <SubjectBars data={subjectData} />
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-800">Top Attendees</h3>
                                    <span className="text-xs text-gray-400">By attendance count</span>
                                </div>
                                <TopStudentsList students={topStudents} />
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-800">Recent Activity</h3>
                                    {totalAttendance > 5 && <button onClick={() => setActiveTab('attendance')} className="text-xs text-emerald-600 font-semibold hover:underline">View all →</button>}
                                </div>
                                {totalAttendance === 0 ? (
                                    <div className="text-center py-8"><p className="text-gray-400 text-sm">No activity yet</p></div>
                                ) : (
                                    <div className="space-y-2">
                                        {[...activeAttendance, ...archivedAttendance].slice(0, 5).map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">{r.student_name?.[0]}</div>
                                                    <div><p className="text-sm font-medium text-gray-800">{r.student_name}</p><p className="text-xs text-gray-400">{r.lecture_name}</p></div>
                                                </div>
                                                <span className="text-xs text-gray-400">{r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && <UsersTab allUsers={allUsers} onDelete={handleDeleteUser} onDownload={downloadUsers} />}
                {activeTab === 'lectures' && <LecturesTab activeLectures={activeLectures} archivedLectures={archivedLectures} onDelete={handleDeleteLecture} onDownload={downloadLectures} />}
                {activeTab === 'attendance' && <AttendanceTab activeAttendance={activeAttendance} archivedAttendance={archivedAttendance} onDownload={downloadAttendance} />}
            </div>
        </div>
    );
};
