import React, { useState, useEffect } from 'react';
import { InputField } from '../components/InputField.jsx';
import { LocationPicker } from '../components/LocationPicker.jsx';
import { BookOpenIcon, PlusIcon, QrCodeIcon, CalendarIcon, DownloadIcon, BarChartIcon, MapPinIcon } from '../components/Icons.jsx';

// Define the API_URL at the top of the file to be used by all components
const API_URL = "https://attendence-backend-tfw2.onrender.com/api";

// --- Helper function to trigger CSV download ---
const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const TeacherDashboard = ({ user, setView, lectures, activeLecture, setActiveLecture, token, allStudents }) => {
    const [liveAttendance, setLiveAttendance] = useState([]);
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        if (!activeLecture) {
            setLiveAttendance([]);
            return;
        }
        setCountdown(30);

        const fetchLiveAttendance = async () => {
            try {
                // THIS IS THE FIX: Use the API_URL variable
                const res = await fetch(`${API_URL}/teacher/lectures/${activeLecture.id}/attendance`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setLiveAttendance(data);
            } catch (error) {
                console.error("Failed to fetch live attendance:", error);
            }
        };

        fetchLiveAttendance();
        const pollInterval = setInterval(fetchLiveAttendance, 5000);
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    clearInterval(pollInterval);
                    setActiveLecture(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => { clearInterval(pollInterval); clearInterval(countdownInterval); };
    }, [activeLecture, token, setActiveLecture]);

    const handleDownloadLectureReport = async (lecture) => {
        try {
            const res = await fetch(`${API_URL}/teacher/lecture-report/${lecture.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch report');

            const headers = "Sr. No,Roll Number,Enrollment Number,Name,Time Attended,Status\n";
            let rows = "";

            if (data.length > 0) {
                rows = data.map((row, index) => {
                    const status = row.timestamp ? 'Present' : 'Absent';
                    const time = row.timestamp ? new Date(row.timestamp).toLocaleString() : 'N/A';
                    return `${index + 1},${row.roll_number || 'N/A'},${row.enrollment_number || 'N/A'},"${row.student_name}",${time},${status}`;
                }).join('\n');
            } else {
                rows = "No students found in the system.";
            }

            downloadCSV(headers + rows, `lecture_${lecture.name.replace(/\s+/g, '_')}_report.csv`);

        } catch (error) {
            console.error("Failed to download report:", error);
            alert("Error downloading report.");
        }
    };

    return (
        <main className="p-4 md:p-8">
            {activeLecture ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/80 p-6 rounded-2xl shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-2 text-green-600">Lecture is Active!</h2>
                        <p className="text-slate-500 mb-2">QR code will expire in:</p>
                        <p className="text-4xl font-bold text-red-600 mb-4">{countdown}s</p>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeLecture.qrUrl)}`}
                            alt="Active QR Code"
                            className="mx-auto rounded-lg shadow-md"
                        />
                        <div className="mt-4 text-left bg-slate-50 p-4 rounded-lg">
                            <h3 className="font-bold text-lg">{activeLecture.name}</h3>
                            <p className="text-sm text-slate-500">{activeLecture.time}</p>
                        </div>
                        <button onClick={() => setActiveLecture(null)} className="mt-4 w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600">
                            Deactivate Manually
                        </button>
                    </div>
                    <div className="bg-white/80 p-6 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Live Attendance ({liveAttendance.length})</h3>
                        <div className="space-y-3 h-96 overflow-y-auto">
                            {liveAttendance.length > 0 ? liveAttendance.map(record => (
                                <div key={record.id} className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                                    <p className="font-semibold">{record.student_name}</p>
                                    <span className="text-sm text-green-700">{new Date(record.timestamp).toLocaleTimeString()}</span>
                                </div>
                            )) : <p className="text-slate-500 text-center mt-16">Waiting for students...</p>}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center bg-white/80 rounded-2xl p-8 md:p-12 mb-8">
                    <h2 className="text-2xl font-bold">No Active Lecture</h2>
                    <p className="text-slate-500 mt-2">Select a lecture from the list below.</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#021024]">My Lectures</h2>
                    <p className="text-slate-600">Activate a lecture or download a past report.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button onClick={() => setView('reports')} className="w-full sm:w-auto bg-blue-100 text-blue-800 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-200">
                        <BarChartIcon className="w-5 h-5" /> Go to Master Register
                    </button>
                    <button onClick={() => setView('createLecture')} className="w-full sm:w-auto bg-[#052659] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                        <PlusIcon className="w-5 h-5" /> Create New Lecture
                    </button>
                </div>
            </div>

            {lectures.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lectures.map(lecture => (
                        <div key={lecture.id} className={`bg-white/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between border-2 ${activeLecture?.id === lecture.id ? 'border-green-500' : 'border-transparent'}`}>
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-xl">{lecture.name}</h3>
                                    {lecture.latitude && lecture.longitude && (
                                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                                            <MapPinIcon className="w-3 h-3" />
                                            {lecture.radius}m
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-500">{lecture.subject}</p>
                                <p className="text-sm text-slate-400 mt-2">{lecture.time}</p>
                                {lecture.latitude && lecture.longitude && (
                                    <p className="text-xs text-green-600 mt-2 font-medium">
                                        📍 Geofencing enabled
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setActiveLecture(lecture)} disabled={!!activeLecture} className="w-1/2 bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 disabled:bg-slate-400">
                                    Set Active
                                </button>
                                <button onClick={() => handleDownloadLectureReport(lecture)} disabled={!!activeLecture} className="w-1/2 bg-blue-500 text-white font-semibold py-2 px-2 rounded-lg hover:bg-blue-600 disabled:bg-slate-400 flex items-center justify-center gap-1">
                                    <DownloadIcon className="w-4 h-4" /> Report
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white/80 rounded-2xl p-16 flex flex-col items-center gap-6">
                    <div className="bg-[#C1E8FF] p-4 rounded-full"><QrCodeIcon className="w-16 h-16 text-[#052659]" /></div>
                    <h3 className="text-2xl font-bold">No lectures yet</h3>
                    <p className="text-slate-500 max-w-sm">Create your first lecture to get started.</p>
                </div>
            )}
        </main>
    );
};

// --- UPGRADED REPORTS PAGE ---
export const AttendanceReportsPage = ({ teacherId, token, lectures, allStudents, attendanceRecords }) => {
    const [defaulters, setDefaulters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // Month-wise report state
    const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
    const [isDownloadingMonthly, setIsDownloadingMonthly] = useState(false);
    const [isDownloadingCumulative, setIsDownloadingCumulative] = useState(false);

    const MONTHS = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' },
    ];

    const currentYear = new Date().getFullYear();
    const YEARS = Array.from({ length: 4 }, (_, i) => String(currentYear - i));

    useEffect(() => {
        const calculateDefaulters = () => {
            setIsLoading(true);
            if (!allStudents || allStudents.length === 0 || !lectures || lectures.length === 0) {
                setIsLoading(false);
                setDefaulters([]);
                return;
            }
            const totalLectures = lectures.length;
            const defaulterList = allStudents.map(student => {
                const studentRecords = attendanceRecords.filter(rec => rec.student_id === student.id);
                const attendedCount = lectures.filter(lecture =>
                    studentRecords.some(rec => rec.lecture_id === lecture.id && rec.status === 'present')
                ).length;
                const percentage = (attendedCount / totalLectures) * 100;
                return { ...student, attended_count: attendedCount, total_lectures: totalLectures, percentage };
            }).filter(student => student.percentage < 75);
            setDefaulters(defaulterList);
            setIsLoading(false);
        };
        calculateDefaulters();
    }, [lectures, allStudents, attendanceRecords]);

    // Shared helper: build CSV from report data
    const buildReportCSV = (students, lectures, records, reportLabel) => {
        if (!lectures || lectures.length === 0) {
            return null;
        }
        const attendanceLookup = {};
        records.forEach(rec => {
            if (!attendanceLookup[rec.student_id]) attendanceLookup[rec.student_id] = new Set();
            attendanceLookup[rec.student_id].add(rec.lecture_id);
        });

        // Header row with dates and subject names
        const dateHeaders = lectures.map(l => {
            const d = new Date(l.date);
            const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            return `"${dateStr}\\n${l.subject}"`;
        }).join(',');
        const headerRow = `Sr. No,Roll Number,Enrollment Number,Name,${dateHeaders},Total Present,Total Lectures,Percentage\n`;

        const rows = students.map((student, index) => {
            const attendedSet = attendanceLookup[student.id] || new Set();
            let attendedCount = 0;
            const statusCells = lectures.map(lecture => {
                const isPresent = attendedSet.has(lecture.id);
                if (isPresent) attendedCount++;
                return isPresent ? 'P' : 'A';
            }).join(',');
            const pct = lectures.length > 0 ? ((attendedCount / lectures.length) * 100).toFixed(2) : '0.00';
            return `${index + 1},${student.roll_number || 'N/A'},${student.enrollment_number || 'N/A'},"${student.name}",${statusCells},${attendedCount},${lectures.length},${pct}%`;
        }).join('\n');

        return headerRow + rows;
    };

    // Download ALL TIME cumulative report
    const handleDownloadCumulativeReport = async () => {
        setIsDownloadingCumulative(true);
        try {
            const res = await fetch(`${API_URL}/teacher/reports/cumulative/${teacherId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const { students, lectures, records } = await res.json();
            if (!lectures || lectures.length === 0) {
                alert('No lecture data found in the database. Create a lecture first.');
                return;
            }
            const csv = buildReportCSV(students, lectures, records, 'All Time');
            if (csv) downloadCSV(csv, `master_attendance_ALL_TIME.csv`);
        } catch (error) {
            console.error('Failed to generate cumulative report:', error);
            alert('Error generating report. Please try again.');
        } finally {
            setIsDownloadingCumulative(false);
        }
    };

    // Download MONTH-WISE report
    const handleDownloadMonthlyReport = async () => {
        setIsDownloadingMonthly(true);
        try {
            const monthName = MONTHS.find(m => m.value === selectedMonth)?.label || selectedMonth;
            const res = await fetch(
                `${API_URL}/teacher/reports/monthly/${teacherId}?month=${selectedMonth}&year=${selectedYear}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const { students, lectures, records } = await res.json();
            if (!lectures || lectures.length === 0) {
                alert(`No lectures found for ${monthName} ${selectedYear}. Try a different month/year.`);
                return;
            }
            const csv = buildReportCSV(students, lectures, records, `${monthName} ${selectedYear}`);
            if (csv) downloadCSV(csv, `attendance_${monthName}_${selectedYear}.csv`);
        } catch (error) {
            console.error('Failed to generate monthly report:', error);
            alert('Error generating report. Please try again.');
        } finally {
            setIsDownloadingMonthly(false);
        }
    };

    return (
        <main className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#021024]">Attendance Master Register</h1>
                    <p className="text-slate-500 text-sm mt-1">All data is permanently stored — reports are generated from full database history.</p>
                </div>
            </div>

            {/* ── CARD 1: All-Time Master Excel ── */}
            <div className="bg-white/90 border-2 border-blue-200 p-6 rounded-2xl shadow-lg mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <DownloadIcon className="w-7 h-7 text-blue-700" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#021024]">📊 Cumulative Master Register (All Time)</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Complete attendance sheet from <strong>Day 1</strong> with all students, all dates, P/A per lecture, totals &amp; percentages.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadCumulativeReport}
                        disabled={isDownloadingCumulative}
                        className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-wait"
                    >
                        {isDownloadingCumulative ? '⏳ Generating...' : <><DownloadIcon className="w-5 h-5" /> Download All-Time Excel</>}
                    </button>
                </div>
            </div>

            {/* ── CARD 2: Month-wise Excel ── */}
            <div className="bg-white/90 border-2 border-green-200 p-6 rounded-2xl shadow-lg mb-8">
                <div className="flex items-start gap-4 mb-5">
                    <div className="bg-green-100 p-3 rounded-xl">
                        <CalendarIcon className="w-7 h-7 text-green-700" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#021024]">📅 Month-Wise Attendance Register</h2>
                        <p className="text-slate-500 text-sm mt-1">
                            Select a month &amp; year to download that month's attendance register with P/A for each class.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Month</label>
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-400"
                        >
                            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Year</label>
                        <select
                            value={selectedYear}
                            onChange={e => setSelectedYear(e.target.value)}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-400"
                        >
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleDownloadMonthlyReport}
                        disabled={isDownloadingMonthly}
                        className="w-full bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-all disabled:opacity-60 disabled:cursor-wait"
                    >
                        {isDownloadingMonthly ? '⏳ Generating...' : <><DownloadIcon className="w-5 h-5" /> Download Month Excel</>}
                    </button>
                </div>
            </div>

            {/* ── CARD 3: Defaulter List ── */}
            <div className="bg-white/80 p-6 rounded-2xl shadow-lg mb-8">
                <h3 className="text-xl font-bold mb-4">⚠️ Defaulter Students (Attendance &lt; 75%)</h3>
                {isLoading ? <p className="text-center p-4">Calculating...</p> : (defaulters.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-red-50 border-b-2 border-red-200">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Roll No.</th>
                                    <th className="p-3">Enrollment No.</th>
                                    <th className="p-3">Attended</th>
                                    <th className="p-3">Attendance %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {defaulters.map(student => (
                                    <tr key={student.id} className="border-b hover:bg-slate-50">
                                        <td className="p-3 font-semibold">{student.name}</td>
                                        <td className="p-3">{student.roll_number || 'N/A'}</td>
                                        <td className="p-3">{student.enrollment_number || 'N/A'}</td>
                                        <td className="p-3">{student.attended_count}/{student.total_lectures}</td>
                                        <td className="p-3 font-bold text-red-600">{student.percentage.toFixed(0)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-slate-500 text-center py-8">🎉 No defaulters found! All students have attendance above 75%.</p>)}
            </div>
        </main>
    );
};

// --- THIS COMPONENT IS NOW FULLY CORRECTED ---
export const CreateLecturePage = ({ setView, addLecture, setActiveLecture }) => {
    // UPDATED: State now matches the new form + geofencing
    const [lectureDetails, setLectureDetails] = useState({
        subject: '',
        date: new Date().toISOString().split('T')[0], // Defaults to today's date
        time: ''
    });
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [radius, setRadius] = useState(100); // Default 100 meters
    const [qrImageUrl, setQrImageUrl] = useState('');
    const [createdLecture, setCreatedLecture] = useState(null);

    const handleInputChange = (e) => setLectureDetails(prev => ({ ...prev, [e.target.id]: e.target.value }));

    const handleGenerateQr = async (e) => {
        e.preventDefault();
        // UPDATED: Check for new fields including location
        if (lectureDetails.subject && lectureDetails.date && lectureDetails.time) {
            if (!location.latitude || !location.longitude) {
                alert('Please set the lecture location for geofencing');
                return;
            }

            // Include location and radius in lecture data
            const lectureDataWithLocation = {
                ...lectureDetails,
                latitude: location.latitude,
                longitude: location.longitude,
                radius: radius
            };

            const newLectureData = await addLecture(lectureDataWithLocation); // This function is passed from App.jsx
            if (newLectureData && newLectureData.qrUrl) {
                setCreatedLecture(newLectureData);
                setQrImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(newLectureData.qrUrl)}`);
            }
        } else {
            alert('Please fill all fields');
        }
    };

    const handleActivateAndReturn = () => {
        setActiveLecture(createdLecture);
        setView('teacherHome'); // Go to teacherHome
    };

    return (
        <main className="p-4 md:p-8 flex flex-col items-center">
            {qrImageUrl ? (
                <div className="w-full max-w-md bg-white/80 p-8 rounded-2xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold mb-2">QR Code Generated!</h2><p className="text-slate-500 mb-6">Students can scan this with their phone camera.</p>
                    <img src={qrImageUrl} alt="Generated QR Code" className="mx-auto rounded-lg shadow-md" />
                    {/* UPDATED: Show the new details */}
                    <div className="mt-6 text-left bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-bold text-lg">{lectureDetails.subject}</h3>
                        <p className="text-sm text-slate-500">{lectureDetails.date} at {lectureDetails.time}</p>
                    </div>
                    <button onClick={handleActivateAndReturn} className="mt-6 w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600">Activate and Return</button>
                </div>
            ) : (
                <div className="w-full max-w-2xl bg-white/80 p-8 rounded-2xl shadow-lg">
                    <h2 className="text-3xl font-bold text-center mb-6">Create New Lecture</h2>
                    {/* UPDATED: The form now matches your request */}
                    <form className="space-y-4" onSubmit={handleGenerateQr}>
                        <InputField id="subject" label="Subject" type="text" placeholder="e.g., Data Structures" value={lectureDetails.subject} onChange={handleInputChange} icon={<BookOpenIcon className="w-5 h-5" />} />
                        <InputField id="date" label="Date" type="date" value={lectureDetails.date} onChange={handleInputChange} icon={<CalendarIcon className="w-5 h-5" />} />
                        <InputField id="time" label="Time" type="time" placeholder="e.g., 10:30" value={lectureDetails.time} onChange={handleInputChange} icon={<CalendarIcon className="w-5 h-5" />} />

                        {/* Geofencing Location Picker */}
                        <LocationPicker
                            location={location}
                            radius={radius}
                            onLocationChange={setLocation}
                            onRadiusChange={setRadius}
                        />

                        <button type="submit" className="w-full bg-[#052659] text-white font-bold py-3 rounded-lg hover:bg-[#021024] mt-4">Generate QR Code</button>
                    </form>
                </div>
            )}
        </main>
    );
};