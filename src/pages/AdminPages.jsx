import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { BarChartIcon, DownloadIcon, TrashIcon, UsersIcon, ActivityIcon, BookOpenIcon, UserIcon, GraduationCapIcon, ShieldIcon, XIcon, CalendarIcon, LockIcon } from '../components/Icons.jsx';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale);

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// ═══════════════════════════════════════════════════════════
// STYLES & ANIMATIONS
// ═══════════════════════════════════════════════════════════

const CARD = "bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 relative overflow-hidden";
const CARD_HEADER_STYLE = "flex items-center justify-between mb-6 relative z-10 px-6 pt-6";
const TITLE = "text-lg font-bold text-[#021024] tracking-tight";
const SUBTITLE = "text-xs font-semibold text-[#5483B3] uppercase tracking-wider mt-0.5";
const BADGE = (color) => `px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${color} shadow-sm`;
const BTN_PRIMARY = "flex items-center gap-2 px-4 py-2 bg-[#052659] text-white rounded-xl hover:bg-[#021024] transition-all text-xs font-bold uppercase tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5";
const INPUT = "flex-1 px-4 py-2.5 rounded-xl border border-[#C1E8FF] text-sm outline-none focus:ring-2 focus:ring-[#052659]/30 bg-white/80 backdrop-blur-sm placeholder-[#7DA0CA] transition-all focus:border-[#052659]";
const TABLE_HEADER = "bg-gradient-to-r from-[#052659] to-[#0A3A7E] text-white text-xs uppercase tracking-wider";

// Animation Config
const ANIMATION = {
    duration: 1500,
    easing: 'easeOutQuart',
};

// ═══════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════

const Toast = ({ toast, onClose }) => {
    if (!toast) return null;
    return (
        <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-white animate-fadeIn flex items-center gap-4 ${toast.type === 'error' ? 'bg-red-500/90 backdrop-blur-md border border-red-400' : 'bg-[#052659]/90 backdrop-blur-md border border-[#0A3A7E]'}`}>
            <span className="font-semibold text-sm tracking-wide">{toast.message}</span>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><XIcon className="w-4 h-4" /></button>
        </div>
    );
};

const HeaderStats = ({ label, value, icon, color, loading }) => (
    <div className={`${CARD} p-5 group`}>
        <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/50 group-hover:to-transparent rounded-bl-full transition-all duration-700"></div>
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-[10px] font-bold text-[#5483B3] tracking-widest uppercase mb-2 group-hover:text-[#052659] transition-colors">{label}</p>
                {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                    <p className="text-3xl font-black text-[#021024] tracking-tight group-hover:scale-105 transition-transform origin-left">{value}</p>
                )}
            </div>
            <div className={`p-3.5 rounded-xl bg-gradient-to-br ${color} shadow-lg shadow-${color.split('-')[1]}/30 group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}>
                {loading ? <div className="w-6 h-6 bg-white/30 rounded animate-pulse" /> : React.cloneElement(icon, { className: "w-6 h-6 text-white" })}
            </div>
        </div>
    </div>
);

const AtRiskStudent = ({ student, totalLectures }) => {
    const percentage = totalLectures > 0 ? Math.round((student.attendance_count / totalLectures) * 100) : 0;
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 hover:bg-red-50 border border-red-100 transition-colors group">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-110 transition-transform">{student.name?.[0]}</div>
                <div>
                    <p className="text-sm font-bold text-gray-900">{student.name}</p>
                    <p className="text-[10px] font-medium text-red-400">Attended: {student.attendance_count}/{totalLectures}</p>
                </div>
            </div>
            <div className="text-right">
                <span className="text-sm font-black text-red-600">{percentage}%</span>
                <p className="text-[9px] font-bold text-red-300 uppercase tracking-wider">Critical</p>
            </div>
        </div>
    );
};

const EmptyState = ({ icon, title, desc }) => (
    <div className="text-center py-16 animate-fadeIn">
        <div className="inline-block p-5 bg-[#C1E8FF]/30 rounded-2xl mb-4 animate-bounce">{icon}</div>
        <p className="font-bold text-[#052659] text-lg">{title}</p>
        <p className="text-sm text-[#7DA0CA] mt-2 max-w-xs mx-auto">{desc}</p>
    </div>
);

// ═══════════════════════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════════════════════

const UsersTab = ({ allUsers, onDelete, onDownload }) => {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filtered = useMemo(() => allUsers.filter(u => {
        const q = search.toLowerCase();
        const match = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.roll_number?.toLowerCase().includes(q);
        return match && (roleFilter === 'all' || u.role === roleFilter);
    }), [allUsers, search, roleFilter]);

    return (
        <div className="space-y-6 animate-fadeInUp">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl backdrop-blur-sm border border-white/40 shadow-sm">
                <div className="flex gap-2">
                    <span className={BADGE('bg-blue-100 text-blue-800 border border-blue-200')}>Teachers: {allUsers.filter(u => u.role === 'teacher').length}</span>
                    <span className={BADGE('bg-emerald-100 text-emerald-800 border border-emerald-200')}>Students: {allUsers.filter(u => u.role === 'student').length}</span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <input type="text" placeholder="Search users..." className={INPUT} value={search} onChange={e => setSearch(e.target.value)} />
                    <select className={INPUT + " sm:max-w-[140px]"} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="teacher">Teachers</option>
                        <option value="student">Students</option>
                    </select>
                    <button onClick={onDownload} className={BTN_PRIMARY}><DownloadIcon className="w-4 h-4" /> Export</button>
                </div>
            </div>

            {filtered.length === 0 ? <EmptyState icon={<UsersIcon className="w-10 h-10 text-[#7DA0CA]" />} title="No users found" desc="Try adjusting your search or filters." /> : (
                <div className={CARD + " overflow-visible"}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className={TABLE_HEADER}>
                                <th className="px-6 py-4 font-bold rounded-tl-xl">User</th>
                                <th className="px-6 py-4 font-bold">Role</th>
                                <th className="px-6 py-4 font-bold">Details</th>
                                <th className="px-6 py-4 font-bold">Joined</th>
                                <th className="px-6 py-4 font-bold text-center rounded-tr-xl">Action</th>
                            </tr></thead>
                            <tbody className="divide-y divide-blue-50">
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md transition-transform group-hover:scale-110 ${u.role === 'teacher' ? 'bg-gradient-to-br from-[#052659] to-[#0A3A7E]' : 'bg-gradient-to-br from-[#5483B3] to-[#7DA0CA]'}`}>
                                                    {u.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#021024]">{u.name}</p>
                                                    <p className="text-xs text-[#5483B3]">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><span className={BADGE(u.role === 'teacher' ? 'bg-[#052659]/10 text-[#052659] border border-[#052659]/20' : 'bg-[#5483B3]/10 text-[#5483B3] border border-[#5483B3]/20')}>{u.role}</span></td>
                                        <td className="px-6 py-4 text-[#5483B3] font-mono text-xs">{u.roll_number || u.enrollment_number || '—'}</td>
                                        <td className="px-6 py-4 text-[#7DA0CA] text-xs font-mono">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => onDelete(u.id, u.name)} className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"><TrashIcon className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const LecturesTab = ({ activeLectures, archivedLectures, onDelete, onDownload }) => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const all = [...activeLectures, ...archivedLectures];

    const filtered = useMemo(() => {
        let list = filter === 'active' ? activeLectures : filter === 'archived' ? archivedLectures : all;
        if (search) { const q = search.toLowerCase(); list = list.filter(l => l.name?.toLowerCase().includes(q) || l.subject?.toLowerCase().includes(q)); }
        return list;
    }, [activeLectures, archivedLectures, search, filter]);

    return (
        <div className="space-y-6 animate-fadeInUp">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl backdrop-blur-sm border border-white/40 shadow-sm">
                <div className="flex gap-2">
                    <span className={BADGE('bg-emerald-100 text-emerald-800')}>Active: {activeLectures.length}</span>
                    <span className={BADGE('bg-amber-100 text-amber-800')}>Archived: {archivedLectures.length}</span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <input type="text" placeholder="Search lectures..." className={INPUT} value={search} onChange={e => setSearch(e.target.value)} />
                    <select className={INPUT + " sm:max-w-[120px]"} value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option></select>
                    <button onClick={onDownload} className={BTN_PRIMARY}><DownloadIcon className="w-4 h-4" /> Export</button>
                </div>
            </div>
            {filtered.length === 0 ? <EmptyState icon={<BookOpenIcon className="w-10 h-10 text-[#7DA0CA]" />} title="No lectures found" desc="Create lectures to see them here." /> : (
                <div className={CARD + " overflow-visible"}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className={TABLE_HEADER}>
                                <th className="px-6 py-4 font-bold rounded-tl-xl">Lecture</th>
                                <th className="px-6 py-4 font-bold">Teacher</th>
                                <th className="px-6 py-4 font-bold text-center">Date</th>
                                <th className="px-6 py-4 font-bold text-center">Attd.</th>
                                <th className="px-6 py-4 font-bold text-center">Status</th>
                                <th className="px-6 py-4 font-bold text-center rounded-tr-xl">Action</th>
                            </tr></thead>
                            <tbody className="divide-y divide-blue-50">
                                {filtered.map(l => (
                                    <tr key={`${l.status}-${l.id}`} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4"><p className="font-bold text-[#021024]">{l.name}</p><p className="text-xs text-[#5483B3]">{l.subject}</p></td>
                                        <td className="px-6 py-4 text-[#5483B3] text-xs">{l.teacher_name}</td>
                                        <td className="px-6 py-4 text-center text-[#7DA0CA] font-mono text-xs">{new Date(l.date || l.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-center"><span className="font-bold text-[#052659] bg-[#C1E8FF] px-2 py-1 rounded-md">{l.attendance_count || 0}</span></td>
                                        <td className="px-6 py-4 text-center"><span className={BADGE(l.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{l.status}</span></td>
                                        <td className="px-6 py-4 text-center">{l.status === 'active' ? <button onClick={() => onDelete(l.id, l.name)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button> : <span className="text-gray-300">—</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const AttendanceTab = ({ activeAttendance, archivedAttendance, onDownload }) => {
    const [search, setSearch] = useState('');
    const all = [...activeAttendance, ...archivedAttendance];
    const filtered = all.filter(r => !search || r.student_name?.toLowerCase().includes(search.toLowerCase()) || r.lecture_name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6 animate-fadeInUp">
            <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl backdrop-blur-sm border border-white/40 shadow-sm">
                <span className={BADGE('bg-[#052659] text-white self-center')}>Total: {all.length}</span>
                <div className="flex gap-3">
                    <input type="text" placeholder="Search records..." className={INPUT} value={search} onChange={e => setSearch(e.target.value)} />
                    <button onClick={onDownload} className={BTN_PRIMARY}><DownloadIcon className="w-4 h-4" /> Export</button>
                </div>
            </div>
            {filtered.length === 0 ? <EmptyState icon={<ActivityIcon className="w-10 h-10 text-[#7DA0CA]" />} title="No records" desc="Attendance logs will appear here." /> : (
                <div className={CARD + " overflow-visible"}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className={TABLE_HEADER}>
                                <th className="px-6 py-4 font-bold rounded-tl-xl">Student</th>
                                <th className="px-6 py-4 font-bold">Lecture</th>
                                <th className="px-6 py-4 font-bold text-center">Status</th>
                                <th className="px-6 py-4 font-bold text-center rounded-tr-xl">Time</th>
                            </tr></thead>
                            <tbody className="divide-y divide-blue-50">
                                {filtered.slice(0, 100).map((r, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4"><p className="font-bold text-[#021024]">{r.student_name}</p><p className="text-xs text-[#5483B3] font-mono">{r.roll_number}</p></td>
                                        <td className="px-6 py-4 text-[#5483B3] text-xs">{r.lecture_name}</td>
                                        <td className="px-6 py-4 text-center"><span className={BADGE('bg-emerald-100 text-emerald-700')}>{r.status}</span></td>
                                        <td className="px-6 py-4 text-center text-[#7DA0CA] text-xs font-mono">{new Date(r.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export const AdminDashboard = ({ user, token, setView, initialTab = 'overview' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [data, setData] = useState({ stats: {}, users: [], lectures: [], attendance: [], trend: [], topStudents: [], subjects: [] });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const headers = { 'Authorization': `Bearer ${token}` };
    const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 4000); };

    useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const endpoints = ['dashboard-stats', 'all-users', 'combined-lectures', 'combined-attendance', 'attendance-trend', 'top-students', 'attendance-by-subject'];
            const responses = await Promise.all(endpoints.map(ep => fetch(`${API_URL}/admin/${ep}`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null)));

            const [stats, users, lectures, attendance, trend, topStudents, subjects] = responses;
            setData({
                stats: stats || {},
                users: users || [],
                lectures: lectures ? [...(lectures.active || []), ...(lectures.archived || [])] : [],
                attendance: attendance ? [...(attendance.active || []), ...(attendance.archived || [])] : [],
                trend: trend || [],
                topStudents: topStudents || [],
                subjects: subjects || []
            });
        } catch (e) { showToast('Failed to load data', 'error'); }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    // Handlers
    const handleDeleteUser = async (id, name) => {
        if (!confirm(`Delete user ${name}? This cannot be undone.`)) return;
        try {
            const res = await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE', headers });
            if (res.ok) { showToast('User deleted'); loadData(); }
            else showToast('Failed to delete', 'error');
        } catch (e) { showToast('Error deleting user', 'error'); }
    };

    const handleDeleteLecture = async (id, name) => {
        if (!confirm(`Delete lecture ${name}? It will be archived.`)) return;
        try {
            const res = await fetch(`${API_URL}/admin/lectures/${id}`, { method: 'DELETE', headers });
            if (res.ok) { showToast('Lecture archived'); loadData(); }
            else showToast('Failed to delete', 'error');
        } catch (e) { showToast('Error deleting lecture', 'error'); }
    };

    const downloadCSV = (dataItems, filename) => {
        if (!dataItems.length) { showToast('No data to export', 'error'); return; }
        const headers = Object.keys(dataItems[0]).join(',');
        const rows = dataItems.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    };

    // Derived Analytics & Charts
    const totalLectures = data.lectures.filter(l => l.status === 'active').length + data.lectures.filter(l => l.status === 'archived').length || 1;
    const atRiskStudents = data.topStudents.filter(s => (parseInt(s.attendance_count) / totalLectures) < 0.75).slice(0, 5);

    const gradient = (ctx, colorStart, colorEnd) => {
        const g = ctx.createLinearGradient(0, 0, 0, 400);
        g.addColorStop(0, colorStart); g.addColorStop(1, colorEnd);
        return g;
    };

    const lineData = {
        labels: data.trend.map(d => new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
        datasets: [{
            label: 'Attendance Velocity',
            data: data.trend.map(d => d.count),
            backgroundColor: (ctx) => gradient(ctx.chart.ctx, 'rgba(5, 38, 89, 0.4)', 'rgba(5, 38, 89, 0.0)'),
            borderColor: '#052659',
            borderWidth: 3,
            pointBackgroundColor: '#fff',
            fill: true,
            tension: 0.4
        }]
    };

    const barData = {
        labels: data.subjects.slice(0, 6).map(s => s.subject?.substring(0, 10) + '...'),
        datasets: [{
            label: 'Avg Attendance',
            data: data.subjects.slice(0, 6).map(s => s.attendance_count),
            backgroundColor: ['#052659', '#0E7C7B', '#17BEBB', '#5483B3', '#7DA0CA', '#FF6B6B'],
            borderRadius: 6,
            barThickness: 30
        }]
    };

    // ─── RENDER ───────────────────────────────────────────────

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#C1E8FF] via-[#E8F6FF] to-[#7DA0CA]/20">
            <div className="w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-md shadow-xl flex items-center justify-center animate-bounce mb-4">
                <ShieldIcon className="w-8 h-8 text-[#052659]" />
            </div>
            <p className="text-[#052659] font-bold text-lg animate-pulse">Loading Analytics Engine...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#C1E8FF] via-[#E8F6FF] to-[#7DA0CA]/20 p-4 md:p-8">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Header */}
            <div className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fadeInDown">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#052659] to-[#0A3A7E] flex items-center justify-center shadow-2xl shadow-[#052659]/30 text-white transform rotate-3 hover:rotate-0 transition-all duration-500">
                        <ShieldIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[#5483B3] font-bold text-xs uppercase tracking-widest mb-1">System Admin</p>
                        <h1 className="text-3xl font-black text-[#021024] tracking-tight">{user.name}</h1>
                    </div>
                </div>

                <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50">
                    {['overview', 'analytics', 'users', 'lectures', 'attendance'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab
                                ? 'bg-[#052659] text-white shadow-lg shadow-[#052659]/30 scale-105'
                                : 'text-[#5483B3] hover:bg-white/50'}`}>
                            {tab}
                        </button>
                    ))}
                    <button onClick={loadData} className="ml-2 px-3 hover:bg-white/50 rounded-xl" title="Refresh"><ActivityIcon className="w-4 h-4 text-[#052659]" /></button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto animate-fadeInUp">

                {/* ═══ OVERVIEW ═══ */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <HeaderStats label="Total Students" value={data.stats.total_students} icon={<GraduationCapIcon />} color="from-[#052659] to-[#0A3A7E]" loading={loading} />
                            <HeaderStats label="Total Teachers" value={data.stats.total_teachers} icon={<UserIcon />} color="from-[#0E7C7B] to-[#17BEBB]" loading={loading} />
                            <HeaderStats label="Lectures Delivered" value={data.stats.total_lectures} icon={<BookOpenIcon />} color="from-[#6A0572] to-[#AB0A8E]" loading={loading} />
                            <HeaderStats label="Attendance Logs" value={data.stats.total_attendance_records} icon={<ActivityIcon />} color="from-[#FF6B6B] to-[#FF8E53]" loading={loading} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className={`${CARD} lg:col-span-2 p-6`}>
                                <div className={CARD_HEADER_STYLE}>
                                    <div><h2 className={TITLE}>Attendance Velocity</h2><p className={SUBTITLE}>30-Day Performance Trend</p></div>
                                    <div className="flex gap-2"><button className="p-2 hover:bg-gray-100 rounded-lg"><CalendarIcon className="w-4 h-4 text-gray-500" /></button></div>
                                </div>
                                <div className="h-[350px] w-full"><Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { borderDash: [4, 4], color: '#e5e7eb' }, ticks: { padding: 10 } }, x: { grid: { display: false } } }, animation: ANIMATION }} /></div>
                            </div>
                            <div className="space-y-6">
                                <div className={`${CARD} p-6`}>
                                    <div className={CARD_HEADER_STYLE}><div><h2 className={TITLE}>Subject Leaderboard</h2><p className={SUBTITLE}>Avg Attendance</p></div></div>
                                    <div className="h-[200px]"><Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, animation: { ...ANIMATION, delay: 500 } }} /></div>
                                </div>
                                <div className={`${CARD} p-6 bg-red-50/30 border-red-100`}>
                                    <div className={CARD_HEADER_STYLE}>
                                        <div><h2 className={TITLE} style={{ color: '#991B1B' }}>At-Risk Students</h2><p className={SUBTITLE} style={{ color: '#F87171' }}>&lt; 75% Attendance</p></div>
                                        <ShieldIcon className="w-5 h-5 text-red-500 animate-pulse" />
                                    </div>
                                    <div className="space-y-3">
                                        {atRiskStudents.length > 0 ? atRiskStudents.map(s => <AtRiskStudent key={s.id} student={s} totalLectures={totalLectures} />) : <p className="text-center text-gray-400 text-sm py-4">All students are performing well! 🎉</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ OTHER TABS ═══ */}
                {activeTab === 'analytics' && <div className="text-center py-20 text-gray-400">Detailed Full-Screen Analytics Module Coming Soon</div>}
                {activeTab === 'users' && <UsersTab allUsers={data.users} onDelete={handleDeleteUser} onDownload={() => downloadCSV(data.users, 'users.csv')} />}
                {activeTab === 'lectures' && <LecturesTab activeLectures={data.lectures.filter(l => l.status === 'active')} archivedLectures={data.lectures.filter(l => l.status === 'archived')} onDelete={handleDeleteLecture} onDownload={() => downloadCSV(data.lectures, 'lectures.csv')} />}
                {activeTab === 'attendance' && <AttendanceTab activeAttendance={data.attendance} archivedAttendance={[]} onDownload={() => downloadCSV(data.attendance, 'attendance.csv')} />}

            </div>
        </div>
    );
};
