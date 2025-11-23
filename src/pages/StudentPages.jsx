import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Calendar, MapPin, QrCode, CalendarDays, CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, color, icon: Icon }) => {
    const colorClasses = { 
        green: 'text-emerald-600 bg-emerald-50', 
        orange: 'text-orange-500 bg-orange-50', 
        red: 'text-red-600 bg-red-50',
        blue: 'text-blue-600 bg-blue-50'
    };
    
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-medium text-slate-500 text-sm">{title}</h3>
                    <p className={`text-3xl font-bold mt-1 ${colorClasses[color].split(' ')[0]}`}>{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
        </motion.div>
    );
};

export const StudentDashboard = ({ setView, lectures, attendanceRecords, lectureNotification, onAttendNow }) => {
    const myRecords = attendanceRecords;
    const presentCount = myRecords.filter(rec => rec.status === 'present').length;
    const lectureMap = new Map(lectures.map(l => [l.id, l.name]));
    const absentCount = Math.max(0, lectures.length - presentCount);
    const attendanceRate = lectures.length > 0 ? Math.round((presentCount / lectures.length) * 100) : 0;

    return (
        <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {lectureNotification && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-blue-900">Attendance is Open!</p>
                                <p className="text-blue-700 text-sm">Your teacher has started attendance for: <strong>{lectureNotification.name}</strong>.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button onClick={() => onAttendNow(lectureNotification)} className="flex-1 md:flex-none bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Scan Now</button>
                            <button onClick={() => onAttendNow(null)} className="p-2 text-blue-400 hover:text-blue-600 transition-colors"><XCircle className="w-6 h-6" /></button>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-medium text-slate-500 text-sm">Attendance Rate</h3>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{attendanceRate}%</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${attendanceRate}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="bg-blue-500 h-full rounded-full"
                        ></motion.div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{presentCount} of {lectures.length} classes attended</p>
                </motion.div>
                
                <StatCard title="Present" value={presentCount} subtitle="Classes attended on time" color="green" icon={CheckCircle} />
                <StatCard title="Absent" value={absentCount} subtitle="Classes missed" color="red" icon={AlertCircle} />
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lecture</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {myRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No attendance records found.</td>
                                </tr>
                            ) : (
                                myRecords.slice().reverse().map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {new Date(record.timestamp).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {lectureMap.get(record.lecture_id) || 'Unknown Lecture'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                record.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {record.status === 'present' ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
};

export const ScanQRCodePage = ({ setView, markAttendance }) => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        if (!isScanning) return;

        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: { width: 250, height: 250 },
            fps: 5,
        });

        const onScanSuccess = async (decodedText, decodedResult) => {
            if (!isScanning) return; 
            setIsScanning(false); 
            
            try {
                const url = new URL(decodedText);
                const lectureId = url.searchParams.get('lectureId');
                
                if (lectureId) {
                    setScanResult(`Scanned lecture ${lectureId}. Submitting...`);
                    const success = await markAttendance(lectureId); 
                    if (success) {
                        setScanResult('Attendance Marked Successfully!');
                        setTimeout(() => setView('studentHome'), 2000);
                    } else {
                        setTimeout(() => setView('studentHome'), 3000);
                    }
                } else {
                    throw new Error("QR code does not contain a valid lecture ID.");
                }
            } catch (e) {
                console.error(e);
                setScanResult('Invalid QR Code. Please scan the official lecture QR code.');
                setTimeout(() => setView('studentHome'), 3000);
            }
        };

        const onScanFailure = (error) => {
        };

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            if (scanner && scanner.getState() === 2) { 
                scanner.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner.", error);
                });
            }
        };
    }, [isScanning, setView, markAttendance]); 

    return (
        <main className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                        <QrCode className="w-8 h-8" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Scan QR Code</h2>
                <p className="text-slate-500 mb-6">Align the QR code within the frame to mark your attendance.</p>
                
                {scanResult ? (
                    <div className="my-8 h-[250px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-emerald-600 font-bold text-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> {scanResult}
                        </p>
                    </div>
                ) : (
                    <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-slate-200"></div>
                )}
                 <button 
                    onClick={() => setView('studentHome')} 
                    className="mt-6 text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
            </div>
        </main>
    );
};

export const ViewSchedulePage = ({ lectures, setView }) => (
    <main className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <CalendarDays className="w-8 h-8"/>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">My Weekly Schedule</h2>
                </div>
                <button onClick={() => setView('studentHome')} className="text-slate-500 hover:text-blue-600 transition-colors md:hidden">
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>
            
            {lectures.length > 0 ? (
                <div className="grid gap-4">
                    {lectures.map(lecture => (
                        <div key={lecture.id} className="group bg-slate-50 p-5 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">{lecture.name}</h3>
                                <p className="text-slate-600 text-sm">{lecture.subject} • {lecture.teacher_name}</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600">
                                    <Clock className="w-3 h-3" /> {lecture.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full text-slate-300 mb-4">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <p className="text-slate-500">Your schedule is empty.</p>
                </div>
            )}
        </div>
    </main>
);