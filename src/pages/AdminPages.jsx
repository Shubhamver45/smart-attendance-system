import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { BarChartIcon, DownloadIcon, TrashIcon, UsersIcon, ActivityIcon, BookOpenIcon, UserIcon, GraduationCapIcon, ShieldIcon, XIcon } from '../components/Icons.jsx';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// ═══════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════

const CARD = "bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 transition-all duration-300 hover:shadow-xl";
const CARD_HEADER = "flex items-center justify-between mb-4";
const CARD_TITLE = "text-base font-bold text-[#021024]";
const CARD_SUBTITLE = "text-xs text-[#5483B3] font-medium";
const BTN_PRIMARY = "flex items-center gap-2 px-4 py-2.5 bg-[#052659] text-white rounded-xl hover:bg-[#021024] transition-all text-sm font-semibold shadow-md hover:shadow-lg";
const BTN_SECONDARY = "flex items-center gap-2 px-4 py-2 bg-white/80 border border-[#C1E8FF] rounded-xl text-sm font-medium text-[#052659] hover:bg-[#C1E8FF]/50 transition-all";
const INPUT = "flex-1 px-4 py-2.5 rounded-xl border border-[#C1E8FF] text-sm outline-none focus:ring-2 focus:ring-[#052659]/30 bg-white/80 backdrop-blur-sm placeholder-[#7DA0CA]";
const TABLE_HEADER = "bg-gradient-to-r from-[#052659] to-[#0A3A7E] text-white";
const BADGE = (color) => `px-2.5 py-1 rounded-lg text-xs font-bold ${color}`;

// ═══════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-full"><TrashIcon className="w-5 h-5 text-red-600" /></div>
                    <h3 className="text-lg font-bold text-[#021024]">{title}</h3>
                </div>
                <p className="text-[#5483B3] text-sm mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium disabled:opacity-50">Cancel</button>
                    <button onClick={onConfirm} disabled={isDeleting} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                        {isDeleting ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>Deleting...</> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon, color, bgColor, subtitle }) => (
    <div className={CARD + " p-5 group hover:-translate-y-1"}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-bold text-[#7DA0CA] tracking-wider uppercase mb-1">{label}</p>
                <p className="text-3xl font-extrabold text-[#021024]">{value ?? '—'}</p>
                {subtitle && <p className="text-xs text-[#5483B3] mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-xl ${bgColor} shadow-lg group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
        </div>
    </div>
);

const EmptyState = ({ icon, title, desc }) => (
    <div className="text-center py-12">
        <div className="inline-block p-4 bg-[#C1E8FF]/30 rounded-2xl mb-3">{icon}</div>
        <p className="font-semibold text-[#052659]">{title}</p>
        <p className="text-sm text-[#7DA0CA] mt-1">{desc}</p>
    </div>
);

// ═══════════════════════════════════════════════════════════
// CHART THEME COLORS
// ═══════════════════════════════════════════════════════════

const CHART_COLORS = {
    primary: '#052659',
    secondary: '#5483B3',
    accent: '#7DA0CA',
    light: '#C1E8FF',
    bg: '#021024',
    palette: ['#052659', '#0E7C7B', '#17BEBB', '#5483B3', '#7DA0CA', '#FF6B6B', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'],
    gradientBlue: (ctx) => {
        if (!ctx?.chart?.ctx) return '#052659';
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
        gradient.addColorStop(0, 'rgba(5, 38, 89, 0.8)');
        gradient.addColorStop(1, 'rgba(5, 38, 89, 0.05)');
        return gradient;
    }
};

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { labels: { font: { family: 'Inter', size: 11, weight: '600' }, color: '#5483B3', padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
        tooltip: { backgroundColor: '#021024', titleFont: { family: 'Inter', size: 12, weight: '700' }, bodyFont: { family: 'Inter', size: 11 }, padding: 12, cornerRadius: 10, displayColors: true, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }
    }
};

// ═══════════════════════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════════════════════

const UsersTab = ({ allUsers, onDelete, onDownload }) => {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filtered = useMemo(() => allUsers.filter(u => {
        const q = search.toLowerCase();
        const match = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.id?.toLowerCase().includes(q) || u.roll_number?.toLowerCase().includes(q);
        return match && (roleFilter === 'all' || u.role === roleFilter);
    }), [allUsers, search, roleFilter]);

    return (
        <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-wrap gap-2">
                <span className={BADGE('bg-blue-100 text-blue-700')}>{allUsers.filter(u => u.role === 'teacher').length} Teachers</span>
                <span className={BADGE('bg-emerald-100 text-emerald-700')}>{allUsers.filter(u => u.role === 'student').length} Students</span>
                <span className={BADGE('bg-[#C1E8FF] text-[#052659]')}>{filtered.length} Shown</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Search by name, email, ID..." className={INPUT} value={search} onChange={e => setSearch(e.target.value)} />
                <select className={INPUT + " sm:max-w-[150px]"} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="all">All Roles</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                </select>
                <button onClick={onDownload} className={BTN_PRIMARY + " whitespace-nowrap"}><DownloadIcon className="w-4 h-4" />Export</button>
            </div>
            {filtered.length === 0 ? <EmptyState icon={<UsersIcon className="w-8 h-8 text-[#7DA0CA]" />} title="No users found" desc="Adjust your search or filter." /> : (
                <div className={CARD + " overflow-hidden"}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className={TABLE_HEADER}>
                                <th className="px-5 py-3.5 font-semibold">User</th>
                                <th className="px-5 py-3.5 font-semibold">Email</th>
                                <th className="px-5 py-3.5 font-semibold">Role</th>
                                <th className="px-5 py-3.5 font-semibold hidden md:table-cell">Roll/ID</th>
                                <th className="px-5 py-3.5 font-semibold hidden lg:table-cell">Joined</th>
                                <th className="px-5 py-3.5 font-semibold text-center w-16">⚙️</th>
                            </tr></thead>
                            <tbody className="divide-y divide-[#C1E8FF]/30">
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-[#C1E8FF]/20 transition-colors">
                                        <td className="px-5 py-3.5"><div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md ${u.role === 'teacher' ? 'bg-[#052659]' : 'bg-[#5483B3]'}`}>{u.name?.[0]?.toUpperCase()}</div>
                                            <span className="font-semibold text-[#021024]">{u.name}</span>
                                        </div></td>
                                        <td className="px-5 py-3.5 text-[#5483B3] text-xs">{u.email}</td>
                                        <td className="px-5 py-3.5"><span className={BADGE(u.role === 'teacher' ? 'bg-[#052659]/10 text-[#052659]' : 'bg-[#5483B3]/10 text-[#5483B3]')}>{u.role}</span></td>
                                        <td className="px-5 py-3.5 text-[#7DA0CA] font-mono text-xs hidden md:table-cell">{u.roll_number || u.id}</td>
                                        <td className="px-5 py-3.5 text-[#7DA0CA] text-xs hidden lg:table-cell">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}</td>
                                        <td className="px-5 py-3.5 text-center"><button onClick={() => onDelete(u.id, u.name)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><TrashIcon className="w-4 h-4" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-2.5 bg-[#C1E8FF]/20 border-t border-[#C1E8FF]/40 text-xs text-[#7DA0CA] font-medium">Showing {filtered.length} of {allUsers.length}</div>
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
        if (search) { const q = search.toLowerCase(); list = list.filter(l => l.name?.toLowerCase().includes(q) || l.subject?.toLowerCase().includes(q) || l.teacher_name?.toLowerCase().includes(q)); }
        return list;
    }, [activeLectures, archivedLectures, search, filter]);

    return (
        <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-wrap gap-2">
                <span className={BADGE('bg-emerald-100 text-emerald-700')}>{activeLectures.length} Active</span>
                <span className={BADGE('bg-amber-100 text-amber-700')}>{archivedLectures.length} Archived</span>
                <span className={BADGE('bg-[#C1E8FF] text-[#052659]')}>{all.length} Total</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Search lectures..." className={INPUT} value={search} onChange={e => setSearch(e.target.value)} />
                <select className={INPUT + " sm:max-w-[160px]"} value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="all">All Lectures</option>
                    <option value="active">Active Only</option>
                    <option value="archived">Archived Only</option>
                </select>
                <button onClick={onDownload} className={BTN_PRIMARY + " whitespace-nowrap"}><DownloadIcon className="w-4 h-4" />Export</button>
            </div>
            {filtered.length === 0 ? <EmptyState icon={<BookOpenIcon className="w-8 h-8 text-[#7DA0CA]" />} title="No lectures" desc="Lectures are preserved here even after auto-deletion." /> : (
                <div className={CARD + " overflow-hidden"}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className={TABLE_HEADER}>
                                <th className="px-5 py-3.5 font-semibold">Lecture</th>
                                <th className="px-5 py-3.5 font-semibold">Teacher</th>
                                <th className="px-5 py-3.5 font-semibold hidden md:table-cell">Date</th>
                                <th className="px-5 py-3.5 font-semibold text-center">Attend.</th>
                                <th className="px-5 py-3.5 font-semibold text-center">Status</th>
                                <th className="px-5 py-3.5 font-semibold text-center w-16">⚙️</th>
                            </tr></thead>
                            <tbody className="divide-y divide-[#C1E8FF]/30">
                                {filtered.map((l, i) => (
                                    <tr key={`${l.status}-${l.id}`} className="hover:bg-[#C1E8FF]/20 transition-colors">
                                        <td className="px-5 py-3.5"><div><p className="font-semibold text-[#021024]">{l.name}</p><p className="text-xs text-[#7DA0CA]">{l.subject || ''}</p></div></td>
                                        <td className="px-5 py-3.5 text-[#5483B3] text-xs">{l.teacher_name || '—'}</td>
                                        <td className="px-5 py-3.5 text-[#7DA0CA] text-xs hidden md:table-cell">{(l.date || l.created_at) ? new Date(l.date || l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}</td>
                                        <td className="px-5 py-3.5 text-center"><span className={BADGE((l.attendance_count || 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>{l.attendance_count || 0}</span></td>
                                        <td className="px-5 py-3.5 text-center"><span className={BADGE(l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>{l.status === 'active' ? '● Live' : '📦 Archived'}</span></td>
                                        <td className="px-5 py-3.5 text-center">{l.status === 'active' ? <button onClick={() => onDelete(l.id, l.name)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><TrashIcon className="w-4 h-4" /></button> : <span className="text-[#C1E8FF]">—</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-2.5 bg-[#C1E8FF]/20 border-t border-[#C1E8FF]/40 text-xs text-[#7DA0CA] font-medium">Showing {filtered.length} lectures</div>
                </div>
            )}
        </div>
    );
};

const AttendanceTab = ({ activeAttendance, archivedAttendance, onDownload }) => {
    const [search, setSearch] = useState('');
    const all = [...activeAttendance, ...archivedAttendance];
    const filtered = useMemo(() => {
        if (!search) return all;
        const q = search.toLowerCase();
        return all.filter(r => r.student_name?.toLowerCase().includes(q) || r.lecture_name?.toLowerCase().includes(q) || r.roll_number?.toLowerCase().includes(q));
    }, [activeAttendance, archivedAttendance, search]);

    return (
        <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-wrap gap-2">
                <span className={BADGE('bg-emerald-100 text-emerald-700')}>{activeAttendance.length} Active</span>
                <span className={BADGE('bg-amber-100 text-amber-700')}>{archivedAttendance.length} Archived</span>
                <span className={BADGE('bg-[#C1E8FF] text-[#052659]')}>{all.length} Total</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Search by student, lecture, roll no..." className={INPUT} value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={onDownload} className={BTN_PRIMARY + " whitespace-nowrap"}><DownloadIcon className="w-4 h-4" />Export</button>
            </div>
            {filtered.length === 0 ? <EmptyState icon={<BarChartIcon className="w-8 h-8 text-[#7DA0CA]" />} title="No records" desc="Records appear when students mark attendance." /> : (
                <div className={CARD + " overflow-hidden"}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className={TABLE_HEADER}>
                                <th className="px-5 py-3.5 font-semibold">Student</th>
                                <th className="px-5 py-3.5 font-semibold hidden md:table-cell">Roll No.</th>
                                <th className="px-5 py-3.5 font-semibold">Lecture</th>
                                <th className="px-5 py-3.5 font-semibold text-center">Status</th>
                                <th className="px-5 py-3.5 font-semibold hidden lg:table-cell">Time</th>
                            </tr></thead>
                            <tbody className="divide-y divide-[#C1E8FF]/30">
                                {filtered.slice(0, 200).map((r, i) => (
                                    <tr key={`${r.record_status}-${r.id}-${i}`} className="hover:bg-[#C1E8FF]/20 transition-colors">
                                        <td className="px-5 py-3.5"><div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-[#052659] flex items-center justify-center text-white text-xs font-bold shadow-md">{r.student_name?.[0]?.toUpperCase()}</div>
                                            <span className="font-medium text-[#021024]">{r.student_name}</span>
                                        </div></td>
                                        <td className="px-5 py-3.5 text-[#7DA0CA] font-mono text-xs hidden md:table-cell">{r.roll_number || '—'}</td>
                                        <td className="px-5 py-3.5 text-[#5483B3] text-xs">{r.lecture_name || '—'}</td>
                                        <td className="px-5 py-3.5 text-center"><span className={BADGE('bg-emerald-100 text-emerald-700')}>{r.status}</span></td>
                                        <td className="px-5 py-3.5 text-[#7DA0CA] text-xs hidden lg:table-cell">{r.timestamp ? new Date(r.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-2.5 bg-[#C1E8FF]/20 border-t border-[#C1E8FF]/40 text-xs text-[#7DA0CA] font-medium flex justify-between">
                        <span>Showing {Math.min(filtered.length, 200)} of {filtered.length}</span>
                        {filtered.length > 200 && <span className="text-[#052659] font-semibold">Export CSV for full data</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════

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

    // ─── Data Fetching ─────────────────────────────────────
    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const endpoints = [
                'dashboard-stats', 'all-users', 'combined-lectures',
                'combined-attendance', 'attendance-trend', 'top-students', 'attendance-by-subject'
            ];
            const results = await Promise.all(endpoints.map(ep => fetch(`${API_URL}/admin/${ep}`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null)));

            const [s, u, l, a, t, ts, sb] = results;
            if (s) setStats(s);
            if (u) setAllUsers(u);
            if (l) { setActiveLectures(l.active || []); setArchivedLectures(l.archived || []); }
            if (a) { setActiveAttendance(a.active || []); setArchivedAttendance(a.archived || []); }
            if (t) setTrendData(t);
            if (ts) setTopStudents(ts);
            if (sb) setSubjectData(sb);
        } catch (e) { showToast('Failed to load data', 'error'); }
        setIsLoading(false);
    };

    useEffect(() => { fetchAllData(); }, []);

    // ─── Delete Handlers ───────────────────────────────────
    const handleDeleteUser = (userId, userName) => {
        setConfirmModal({
            isOpen: true, title: 'Delete User', message: `Permanently delete "${userName}" and all related data?`,
            onConfirm: async () => {
                setIsDeleting(true);
                try { const r = await fetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE', headers }); const d = await r.json(); if (!r.ok) throw new Error(d.error); showToast(d.message); await fetchAllData(); } catch (e) { showToast(e.message, 'error'); }
                setIsDeleting(false); setConfirmModal({ isOpen: false });
            }
        });
    };

    const handleDeleteLecture = (lectureId, lectureName) => {
        setConfirmModal({
            isOpen: true, title: 'Delete Lecture', message: `Delete "${lectureName}"? It will be archived automatically.`,
            onConfirm: async () => {
                setIsDeleting(true);
                try { const r = await fetch(`${API_URL}/admin/lectures/${lectureId}`, { method: 'DELETE', headers }); const d = await r.json(); if (!r.ok) throw new Error(d.error); showToast(d.message); await fetchAllData(); } catch (e) { showToast(e.message, 'error'); }
                setIsDeleting(false); setConfirmModal({ isOpen: false });
            }
        });
    };

    // ─── CSV Helpers ───────────────────────────────────────
    const downloadCSV = (data, filename, cols) => {
        if (!data.length) { showToast('No data to export', 'error'); return; }
        const h = cols.map(c => c.label).join(',');
        const rows = data.map(r => cols.map(c => `"${(r[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(','));
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF' + [h, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' }));
        a.download = filename; a.click(); showToast(`Downloaded ${filename}`);
    };

    const downloadUsers = () => downloadCSV(allUsers, `users_${new Date().toISOString().slice(0, 10)}.csv`, [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'roll_number', label: 'Roll No' }, { key: 'created_at', label: 'Joined' }]);
    const downloadLectures = () => downloadCSV([...activeLectures, ...archivedLectures], `lectures_${new Date().toISOString().slice(0, 10)}.csv`, [{ key: 'name', label: 'Lecture' }, { key: 'subject', label: 'Subject' }, { key: 'teacher_name', label: 'Teacher' }, { key: 'date', label: 'Date' }, { key: 'attendance_count', label: 'Attendance' }, { key: 'status', label: 'Status' }]);
    const downloadAttendance = () => downloadCSV([...activeAttendance, ...archivedAttendance], `attendance_${new Date().toISOString().slice(0, 10)}.csv`, [{ key: 'student_name', label: 'Student' }, { key: 'roll_number', label: 'Roll No' }, { key: 'lecture_name', label: 'Lecture' }, { key: 'status', label: 'Status' }, { key: 'timestamp', label: 'Time' }]);

    // ─── Chart Data ────────────────────────────────────────
    const lineChartData = {
        labels: trendData.map(d => new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
        datasets: [{
            label: 'Attendance',
            data: trendData.map(d => d.count),
            borderColor: '#052659',
            backgroundColor: function (context) {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return 'rgba(5,38,89,0.1)';
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(5,38,89,0.3)');
                gradient.addColorStop(1, 'rgba(193,232,255,0.05)');
                return gradient;
            },
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#052659',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            pointHoverBorderWidth: 3
        }]
    };

    const lineChartOptions = {
        ...chartDefaults,
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10 }, color: '#7DA0CA', maxRotation: 45 } },
            y: { beginAtZero: true, grid: { color: 'rgba(193,232,255,0.3)' }, ticks: { font: { family: 'Inter', size: 10 }, color: '#7DA0CA', stepSize: 1 } }
        },
        plugins: { ...chartDefaults.plugins, legend: { display: false } }
    };

    const barChartData = {
        labels: subjectData.map(d => d.subject?.length > 12 ? d.subject.slice(0, 12) + '…' : d.subject),
        datasets: [{
            label: 'Attendance Count',
            data: subjectData.map(d => parseInt(d.attendance_count)),
            backgroundColor: CHART_COLORS.palette.slice(0, subjectData.length),
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 32,
            maxBarThickness: 40
        }]
    };

    const barChartOptions = {
        ...chartDefaults,
        indexAxis: 'x',
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10, weight: '600' }, color: '#5483B3' } },
            y: { beginAtZero: true, grid: { color: 'rgba(193,232,255,0.3)' }, ticks: { font: { family: 'Inter', size: 10 }, color: '#7DA0CA', stepSize: 1 } }
        },
        plugins: { ...chartDefaults.plugins, legend: { display: false } }
    };

    const pieChartData = {
        labels: ['Teachers', 'Students'],
        datasets: [{
            data: [stats.total_teachers || 0, stats.total_students || 0],
            backgroundColor: ['#052659', '#5483B3'],
            borderColor: ['#fff', '#fff'],
            borderWidth: 3,
            hoverOffset: 8,
            spacing: 2
        }]
    };

    const pieChartOptions = {
        ...chartDefaults,
        cutout: '0%',
        plugins: { ...chartDefaults.plugins, legend: { position: 'bottom', labels: { ...chartDefaults.plugins.legend.labels, padding: 20, boxWidth: 12, boxHeight: 12 } } }
    };

    const doughnutChartData = {
        labels: ['Active Lectures', 'Archived Lectures'],
        datasets: [{
            data: [stats.active_lectures || 0, stats.archived_lectures || 0],
            backgroundColor: ['#0E7C7B', '#7DA0CA'],
            borderColor: '#fff',
            borderWidth: 3,
            hoverOffset: 8,
            spacing: 2
        }]
    };

    const doughnutChartOptions = {
        ...chartDefaults,
        cutout: '65%',
        plugins: { ...chartDefaults.plugins, legend: { position: 'bottom', labels: { ...chartDefaults.plugins.legend.labels, padding: 20, boxWidth: 12, boxHeight: 12 } } }
    };

    // ─── Tab Config ────────────────────────────────────────
    const totalLectures = activeLectures.length + archivedLectures.length;
    const totalAttendance = activeAttendance.length + archivedAttendance.length;
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <ActivityIcon className="w-4 h-4" /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChartIcon className="w-4 h-4" /> },
        { id: 'users', label: `Users (${allUsers.length})`, icon: <UsersIcon className="w-4 h-4" /> },
        { id: 'lectures', label: `Lectures (${totalLectures})`, icon: <BookOpenIcon className="w-4 h-4" /> },
        { id: 'attendance', label: `Attendance (${totalAttendance})`, icon: <BarChartIcon className="w-4 h-4" /> }
    ];

    // ─── Loading State ─────────────────────────────────────
    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#C1E8FF] via-[#C1E8FF]/60 to-[#7DA0CA]/30">
            <div className="text-center">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-white/40 border-t-[#052659] mx-auto mb-4"></div>
                <p className="text-[#052659] font-bold text-lg">Loading Admin Panel</p>
                <p className="text-[#5483B3] text-sm mt-1">Fetching system data...</p>
            </div>
        </div>
    );

    // ─── Render ────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#C1E8FF] via-[#C1E8FF]/60 to-[#7DA0CA]/30">
            <Toast toast={toast} onClose={() => setToast(null)} />
            <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => !isDeleting && setConfirmModal({ isOpen: false })} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} isDeleting={isDeleting} />

            <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
                {/* ─── Header ──────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#052659] to-[#0A3A7E] rounded-2xl flex items-center justify-center shadow-xl shadow-[#052659]/30">
                            <ShieldIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-[#5483B3] text-sm font-medium">Welcome back 👋</p>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-[#021024]">{user.name}</h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchAllData} className={BTN_SECONDARY}>🔄 Refresh</button>
                    </div>
                </div>

                {/* ─── Tabs ────────────────────────────────── */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-[#052659] text-white shadow-lg shadow-[#052659]/30'
                                    : 'bg-white/80 text-[#052659] hover:bg-white border border-white/60 backdrop-blur-sm'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══ OVERVIEW TAB ═══ */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="TOTAL STUDENTS" value={stats.total_students || 0} subtitle="Enrolled" icon={<GraduationCapIcon className="w-6 h-6 text-white" />} bgColor="bg-gradient-to-br from-[#052659] to-[#0A3A7E]" />
                            <StatCard label="TOTAL TEACHERS" value={stats.total_teachers || 0} subtitle="Active" icon={<UserIcon className="w-6 h-6 text-white" />} bgColor="bg-gradient-to-br from-[#5483B3] to-[#7DA0CA]" />
                            <StatCard label="TOTAL LECTURES" value={stats.total_lectures || 0} subtitle={`${stats.active_lectures || 0} active · ${stats.archived_lectures || 0} archived`} icon={<BookOpenIcon className="w-6 h-6 text-white" />} bgColor="bg-gradient-to-br from-[#0E7C7B] to-[#17BEBB]" />
                            <StatCard label="ATTENDANCE RECORDS" value={stats.total_attendance_records || 0} subtitle="Marked" icon={<BarChartIcon className="w-6 h-6 text-white" />} bgColor="bg-gradient-to-br from-[#FF6B6B] to-[#FFA07A]" />
                        </div>

                        {/* Line Chart + Pie Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className={CARD + " p-5 lg:col-span-2"}>
                                <div className={CARD_HEADER}>
                                    <div><h3 className={CARD_TITLE}>Attendance Trend</h3><p className={CARD_SUBTITLE}>Last 30 days</p></div>
                                </div>
                                <div className="h-[280px]">
                                    {trendData.length > 0 ? <Line data={lineChartData} options={lineChartOptions} /> : <EmptyState icon={<ActivityIcon className="w-6 h-6 text-[#7DA0CA]" />} title="No trend data" desc="Data will appear as attendance records are created" />}
                                </div>
                            </div>
                            <div className={CARD + " p-5"}>
                                <div className={CARD_HEADER}>
                                    <div><h3 className={CARD_TITLE}>Users Distribution</h3><p className={CARD_SUBTITLE}>Teachers vs Students</p></div>
                                </div>
                                <div className="h-[280px] flex items-center justify-center">
                                    {(stats.total_teachers || stats.total_students) ? <Pie data={pieChartData} options={pieChartOptions} /> : <EmptyState icon={<UsersIcon className="w-6 h-6 text-[#7DA0CA]" />} title="No users" desc="" />}
                                </div>
                            </div>
                        </div>

                        {/* Top Students + Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className={CARD + " p-5"}>
                                <div className={CARD_HEADER}>
                                    <div><h3 className={CARD_TITLE}>Top Attendees</h3><p className={CARD_SUBTITLE}>By attendance count</p></div>
                                </div>
                                {topStudents.length === 0 ? <EmptyState icon={<GraduationCapIcon className="w-6 h-6 text-[#7DA0CA]" />} title="No data yet" desc="" /> : (
                                    <div className="space-y-2">
                                        {['🥇', '🥈', '🥉'].concat(Array(7).fill('')).slice(0, topStudents.length).map((medal, i) => {
                                            const s = topStudents[i]; if (!s) return null;
                                            return (
                                                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#C1E8FF]/30 transition-colors">
                                                    <span className="text-lg w-8 text-center">{medal || `${i + 1}.`}</span>
                                                    <div className="w-8 h-8 rounded-lg bg-[#052659] flex items-center justify-center text-white text-xs font-bold">{s.name?.[0]?.toUpperCase()}</div>
                                                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#021024] truncate">{s.name}</p><p className="text-xs text-[#7DA0CA]">{s.roll_number || s.id}</p></div>
                                                    <span className="text-xs font-bold text-[#052659] bg-[#C1E8FF] px-3 py-1 rounded-full">{s.attendance_count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className={CARD + " p-5"}>
                                <div className={CARD_HEADER}>
                                    <div><h3 className={CARD_TITLE}>Recent Activity</h3><p className={CARD_SUBTITLE}>Latest attendance records</p></div>
                                    {totalAttendance > 5 && <button onClick={() => setActiveTab('attendance')} className="text-xs text-[#052659] font-bold hover:underline">View all →</button>}
                                </div>
                                {totalAttendance === 0 ? <EmptyState icon={<ActivityIcon className="w-6 h-6 text-[#7DA0CA]" />} title="No activity" desc="Will update in real-time" /> : (
                                    <div className="space-y-2">
                                        {[...activeAttendance, ...archivedAttendance].slice(0, 6).map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-[#C1E8FF]/15 rounded-xl hover:bg-[#C1E8FF]/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#5483B3] flex items-center justify-center text-white text-xs font-bold">{r.student_name?.[0]?.toUpperCase()}</div>
                                                    <div><p className="text-sm font-semibold text-[#021024]">{r.student_name}</p><p className="text-xs text-[#7DA0CA]">{r.lecture_name}</p></div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={BADGE('bg-emerald-100 text-emerald-700')}>{r.status}</span>
                                                    <p className="text-[10px] text-[#7DA0CA] mt-1">{r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ ANALYTICS TAB ═══ */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Top Stats Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className={CARD + " p-4 text-center"}>
                                <p className="text-3xl font-extrabold text-[#052659]">{stats.total_students || 0}</p>
                                <p className="text-xs font-bold text-[#7DA0CA] mt-1">STUDENTS</p>
                            </div>
                            <div className={CARD + " p-4 text-center"}>
                                <p className="text-3xl font-extrabold text-[#052659]">{stats.total_teachers || 0}</p>
                                <p className="text-xs font-bold text-[#7DA0CA] mt-1">TEACHERS</p>
                            </div>
                            <div className={CARD + " p-4 text-center"}>
                                <p className="text-3xl font-extrabold text-[#0E7C7B]">{stats.total_lectures || 0}</p>
                                <p className="text-xs font-bold text-[#7DA0CA] mt-1">LECTURES</p>
                            </div>
                            <div className={CARD + " p-4 text-center"}>
                                <p className="text-3xl font-extrabold text-[#FF6B6B]">{stats.total_attendance_records || 0}</p>
                                <p className="text-xs font-bold text-[#7DA0CA] mt-1">ATTENDANCE</p>
                            </div>
                        </div>

                        {/* Line Chart Full Width */}
                        <div className={CARD + " p-6"}>
                            <div className={CARD_HEADER}>
                                <div><h3 className="text-lg font-bold text-[#021024]">📈 Attendance Trend Report</h3><p className={CARD_SUBTITLE}>Daily attendance over the last 30 days</p></div>
                            </div>
                            <div className="h-[320px]">
                                {trendData.length > 0 ? <Line data={lineChartData} options={lineChartOptions} /> : <EmptyState icon={<ActivityIcon className="w-8 h-8 text-[#7DA0CA]" />} title="No trend data yet" desc="Attendance trends will appear as records are created" />}
                            </div>
                        </div>

                        {/* Bar Chart + Doughnut */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className={CARD + " p-6 lg:col-span-2"}>
                                <div className={CARD_HEADER}>
                                    <div><h3 className="text-lg font-bold text-[#021024]">📊 Attendance by Subject</h3><p className={CARD_SUBTITLE}>Which subjects get the most attendance</p></div>
                                </div>
                                <div className="h-[300px]">
                                    {subjectData.length > 0 ? <Bar data={barChartData} options={barChartOptions} /> : <EmptyState icon={<BarChartIcon className="w-8 h-8 text-[#7DA0CA]" />} title="No subject data" desc="Create lectures with subjects to see breakdown" />}
                                </div>
                            </div>
                            <div className={CARD + " p-6"}>
                                <div className={CARD_HEADER}>
                                    <div><h3 className="text-lg font-bold text-[#021024]">🎯 Lecture Status</h3><p className={CARD_SUBTITLE}>Active vs Archived</p></div>
                                </div>
                                <div className="h-[300px] flex items-center justify-center">
                                    {(stats.active_lectures || stats.archived_lectures) ? <Doughnut data={doughnutChartData} options={doughnutChartOptions} /> : <EmptyState icon={<BookOpenIcon className="w-8 h-8 text-[#7DA0CA]" />} title="No lectures" desc="" />}
                                </div>
                            </div>
                        </div>

                        {/* Pie + Top Students */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className={CARD + " p-6"}>
                                <div className={CARD_HEADER}>
                                    <div><h3 className="text-lg font-bold text-[#021024]">👥 User Distribution</h3><p className={CARD_SUBTITLE}>By role</p></div>
                                </div>
                                <div className="h-[280px] flex items-center justify-center">
                                    {(stats.total_teachers || stats.total_students) ? <Pie data={pieChartData} options={pieChartOptions} /> : <EmptyState icon={<UsersIcon className="w-6 h-6 text-[#7DA0CA]" />} title="No users" desc="" />}
                                </div>
                            </div>
                            <div className={CARD + " p-6 lg:col-span-2"}>
                                <div className={CARD_HEADER}>
                                    <div><h3 className="text-lg font-bold text-[#021024]">🏆 Top Students Leaderboard</h3><p className={CARD_SUBTITLE}>Students with highest attendance</p></div>
                                </div>
                                {topStudents.length === 0 ? <EmptyState icon={<GraduationCapIcon className="w-8 h-8 text-[#7DA0CA]" />} title="No attendance data" desc="Leaderboard populates as students attend lectures" /> : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {topStudents.slice(0, 10).map((s, i) => (
                                            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#C1E8FF]/15 hover:bg-[#C1E8FF]/30 transition-colors">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md ${i < 3 ? 'bg-gradient-to-br from-[#052659] to-[#0A3A7E]' : 'bg-[#5483B3]'}`}>
                                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-[#021024] truncate">{s.name}</p>
                                                    <p className="text-xs text-[#7DA0CA]">{s.roll_number || ''}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-extrabold text-[#052659]">{s.attendance_count}</p>
                                                    <p className="text-[10px] text-[#7DA0CA]">classes</p>
                                                </div>
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
