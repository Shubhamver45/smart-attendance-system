

import React, { useState, useEffect } from 'react';
import { InputField } from '../components/InputField.jsx';
import { BookOpen, Plus, QrCode, Calendar, Download, BarChart, Users, Clock, CheckCircle, XCircle, ArrowLeft, Trash2, Mail, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

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
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(countdownInterval);
        };
    }, [activeLecture, token]);

    const endLecture = () => {
        setActiveLecture(null);
    };

    const handleDownloadLectureReport = async (lecture) => {
        try {
            const res = await fetch(`${API_URL}/teacher/lecture-report/${lecture.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch report');
            
            const headers = "Student ID,Roll Number,Enrollment Number,Name,Time Attended\n";
            let rows = "";

            if (data.length > 0) {
                rows = data.map(row => 
                    `${row.student_id},${row.roll_number || 'N/A'},${row.enrollment_number || 'N/A'},"${row.student_name}",${new Date(row.timestamp).toLocaleString()}`
                ).join('\n');
            } else {
                rows = "No students attended this lecture.";
            }
            
            downloadCSV(headers + rows, `lecture_${lecture.name.replace(/\s+/g, '_')}_report.csv`);

        } catch (error) {
            console.error("Failed to download report:", error);
            alert("Error downloading report.");
        }
    };

    return (
        <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h2>
                    <p className="text-slate-500">Manage your lectures and track attendance.</p>
                </div>
                <button 
                    onClick={() => setView('createLecture')} 
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" /> Create New Lecture
                </button>
            </div>

            {activeLecture ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
                >
                    <div className="bg-blue-600 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold">Live Session: {activeLecture.name}</h3>
                            </div>
                            <p className="text-blue-100">QR Code expires in: <span className="font-mono font-bold text-xl">{countdown}s</span> (Auto-regenerates)</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-lg">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`http://localhost:5173/?lectureId=${activeLecture.id}&t=${Math.floor(Date.now() / 5000)}`)}`} 
                                alt="Attendance QR Code" 
                                className="w-48 h-48 object-contain"
                            />
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-slate-500" />
                                Live Attendance ({liveAttendance.length})
                            </h4>
                            <button 
                                onClick={endLecture} 
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                            >
                                End Session
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {liveAttendance.map((student, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                                >
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                                        {student.student_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">{student.student_name}</p>
                                        <p className="text-xs text-slate-500">{new Date(student.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {liveAttendance.length === 0 && (
                                <div className="col-span-full text-center py-8 text-slate-500">
                                    Waiting for students to scan...
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lectures.map(lecture => (
                        <motion.div 
                            key={lecture.id}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                        {lecture.subject}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{lecture.name}</h3>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                    <Clock className="w-4 h-4" />
                                    {lecture.time}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setActiveLecture(lecture)} 
                                    className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <QrCode className="w-4 h-4" /> Start
                                </button>
                                <button 
                                    onClick={() => handleDownloadLectureReport(lecture)} 
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors"
                                    title="Download Report"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {lectures.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full text-slate-300 mb-4">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No lectures found</h3>
                            <p className="text-slate-500 mb-4">Create your first lecture to get started.</p>
                            <button 
                                onClick={() => setView('createLecture')} 
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Create Lecture
                            </button>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
};

export const AttendanceReportsPage = ({ teacherId, token, lectures, allStudents, attendanceRecords }) => {
    const [defaulters, setDefaulters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
                
                return { 
                    ...student, 
                    attended_count: attendedCount,
                    total_lectures: totalLectures,
                    percentage: percentage 
                };
            }).filter(student => student.percentage < 75);

            setDefaulters(defaulterList);
            setIsLoading(false);
        };
        
        calculateDefaulters();
    }, [lectures, allStudents, attendanceRecords]);

    const handleDownloadCSV = () => {
        const headers = "Student ID,Name,Roll Number,Enrollment Number,Attendance Percentage\n";
        let rows = "";

        if (defaulters.length === 0) {
            rows = "No defaulters found for this period.";
        } else {
            rows = defaulters.map(d => 
                `${d.id},"${d.name}",${d.roll_number || 'N/A'},${d.enrollment_number || 'N/A'},${d.percentage.toFixed(0)}%`
            ).join('\n');
        }
        downloadCSV(headers + rows, "monthly_defaulter_report.csv");
    };

    return (
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Attendance Reports</h1>
                    <p className="text-slate-500">Track student attendance and identify defaulters.</p>
                </div>
                <button 
                    onClick={handleDownloadCSV} 
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                    <Download className="w-5 h-5" /> Download Defaulter List
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Defaulter Students (Attendance &lt; 75%)
                    </h3>
                </div>
                
                {isLoading ? (
                    <div className="p-12 text-center text-slate-500">Loading report data...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll No.</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollment</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {defaulters.length > 0 ? (
                                    defaulters.map(student => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{student.name}</p>
                                                        <p className="text-xs text-slate-500">{student.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{student.roll_number || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{student.enrollment_number || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    {student.percentage.toFixed(0)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button 
                                                    onClick={() => alert(`Simulating: Email sent to mentor of ${student.name}`)} 
                                                    className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
                                                >
                                                    <Mail className="w-4 h-4" /> Notify
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                                                <p>No defaulters found! Everyone is attending classes.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
};

export const CreateLecturePage = ({ setView, addLecture, setActiveLecture }) => {
    const [lectureDetails, setLectureDetails] = useState({ 
        subject: '', 
        date: new Date().toISOString().split('T')[0], 
        time: '' 
    });
    const [qrImageUrl, setQrImageUrl] = useState('');
    const [createdLecture, setCreatedLecture] = useState(null);

    const handleInputChange = (e) => setLectureDetails(prev => ({ ...prev, [e.target.id]: e.target.value }));

    const handleGenerateQr = async (e) => {
        e.preventDefault();
        if (lectureDetails.subject && lectureDetails.date && lectureDetails.time) {
            const newLectureData = await addLecture(lectureDetails); 
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
        setView('teacherHome'); 
    };

    return (
        <main className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[80vh]">
            {qrImageUrl ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center"
                >
                    <div className="mb-6 flex justify-center">
                        <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Lecture Created!</h2>
                    <p className="text-slate-500 mb-6">Your QR code is ready for students to scan.</p>
                    
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm inline-block mb-6">
                        <img src={qrImageUrl} alt="Generated QR Code" className="w-48 h-48 object-contain" />
                    </div>
                    
                    <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                        <h3 className="font-bold text-slate-900">{lectureDetails.subject}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" /> {lectureDetails.date} at {lectureDetails.time}
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleActivateAndReturn} 
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        Activate Session & Return
                    </button>
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setView('teacherHome')} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-900">Create New Lecture</h2>
                    </div>
                    
                    <form className="space-y-6" onSubmit={handleGenerateQr}>
                        <InputField 
                            id="subject" 
                            label="Subject Name" 
                            type="text" 
                            placeholder="e.g., Advanced Database Systems" 
                            value={lectureDetails.subject} 
                            onChange={handleInputChange} 
                            icon={<BookOpen className="w-5 h-5"/>} 
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField 
                                id="date" 
                                label="Date" 
                                type="date" 
                                value={lectureDetails.date} 
                                onChange={handleInputChange} 
                                icon={<Calendar className="w-5 h-5"/>} 
                            />
                            <InputField 
                                id="time" 
                                label="Time" 
                                type="time" 
                                placeholder="e.g., 10:30" 
                                value={lectureDetails.time} 
                                onChange={handleInputChange} 
                                icon={<Clock className="w-5 h-5"/>} 
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            <QrCode className="w-5 h-5" /> Generate QR Code
                        </button>
                    </form>
                </motion.div>
            )}
        </main>
    );
};

