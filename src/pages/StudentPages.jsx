import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode'; // Import the new scanner package
import { CalendarIcon, MapPinIcon, QrCodeIcon, CalendarDaysIcon } from '../components/Icons';

// Internal sub-component for StudentDashboard stats
const StatCard = ({ title, value, subtitle, color }) => {
    const colorClasses = { green: 'text-green-600', orange: 'text-orange-500', red: 'text-red-600' };
    return (
        <div className="bg-white/80 p-6 rounded-2xl shadow-lg">
            <h3 className="font-semibold text-slate-500">{title}</h3>
            <p className={`text-4xl font-bold ${colorClasses[color]}`}>{value}</p>
            <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
    );
};

export const StudentDashboard = ({ setView, lectures, attendanceRecords, lectureNotification, onAttendNow }) => {
    const myRecords = attendanceRecords;
    const presentCount = myRecords.filter(rec => rec.status === 'present').length;
    const absentCount = lectures.length - presentCount;
    const attendanceRate = lectures.length > 0 ? Math.round((presentCount / lectures.length) * 100) : 0;

    return (
        <main className="p-4 md:p-8">
            {lectureNotification && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg mb-8 animate-fadeIn" role="alert">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div><p className="font-bold">Attendance is Open!</p><p>Your teacher has started attendance for: <strong>{lectureNotification.name}</strong>.</p></div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {/* THIS IS THE FIX: This now correctly sets the active lecture and changes the view */}
                            <button onClick={() => onAttendNow(lectureNotification)} className="flex-1 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600">Mark Now</button>
                            <button onClick={() => onAttendNow(null)} className="font-bold text-2xl text-blue-500 hover:text-blue-700">&times;</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/80 p-6 rounded-2xl shadow-lg"><h3 className="font-semibold text-slate-500 mb-2">Attendance Rate</h3><p className="text-3xl font-bold text-[#052659]">{attendanceRate}%</p><div className="w-full bg-slate-200 rounded-full h-2.5 mt-2"><div className="bg-[#5483B3] h-2.5 rounded-full" style={{width: `${attendanceRate}%`}}></div></div><p className="text-sm text-slate-400 mt-1">{presentCount} of {lectures.length} classes</p></div>
                <StatCard title="Present" value={presentCount} subtitle="On time" color="green" />
                <StatCard title="Late" value="0" subtitle="Late arrivals" color="orange" />
                <StatCard title="Absent" value={absentCount < 0 ? 0 : absentCount} subtitle="Missed classes" color="red" />
            </div>
            <div className="bg-white/80 p-6 rounded-2xl shadow-lg mb-8">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* THIS IS THE FIX: The "Mark Attendance" button now opens the scanner page */}
                    <button onClick={() => setView('scanQRCode')} className="flex-1 bg-[#052659] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#021024]">Scan QR Code</button>
                    <button onClick={() => setView('viewSchedule')} className="flex-1 bg-[#7DA0CA] text-[#021024] font-bold py-3 px-6 rounded-lg hover:bg-[#5483B3]">View Schedule</button>
                </div>
            </div>
            <div className="bg-white/80 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Attendance History</h3>
                {myRecords.length > 0 ? (
                    <ul className="space-y-3">{myRecords.map(record => { const lecture = lectures.find(l => l.id === record.lectureId); return (<li key={record.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg"><div><p className="font-semibold">{lecture?.name || 'N/A'}</p><p className="text-sm text-slate-500">{new Date(record.timestamp).toLocaleString()}</p></div><span className="font-bold text-green-600 capitalize">{record.status}</span></li>);})}</ul>
                ) : (
                    <div className="text-center p-12 flex flex-col items-center gap-4"><CalendarIcon className="w-16 h-16 text-slate-300" /><h4 className="text-xl font-semibold">No records found</h4><p className="text-slate-500">Your attendance history will appear here.</p></div>
                )}
            </div>
        </main>
    );
};

// NEW AND CORRECTED: This is the in-app QR code scanner page
export const ScanQRCodePage = ({ setView, markAttendance }) => {
    const [scanResult, setScanResult] = useState(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 250,
                height: 250,
            },
            fps: 5,
        });

        const onScanSuccess = async (decodedText, decodedResult) => {
            // Stop scanning once a valid code is found to prevent multiple submissions
            await scanner.clear();
            
            try {
                // The QR code contains a JSON string like {"lectureId": 123}
                const parsedData = JSON.parse(decodedText);
                
                if (parsedData.lectureId) {
                    setScanResult(`Scanned Lecture ID: ${parsedData.lectureId}. Submitting...`);
                    const success = await markAttendance(parsedData.lectureId); // Pass only the ID
                    if (success) {
                        setScanResult('Attendance Marked Successfully!');
                        setTimeout(() => setView('studentDashboard'), 2000); // Go back after 2s
                    } else {
                        // The markAttendance function in App.jsx shows an alert on failure
                        setView('studentDashboard');
                    }
                } else {
                    throw new Error("QR code does not contain a lecture ID.");
                }
            } catch (e) {
                console.error(e);
                setScanResult('Invalid QR Code. Please scan the official lecture QR code.');
                setTimeout(() => setView('studentDashboard'), 3000); // Go back after 3s
            }
        };

        const onScanFailure = (error) => {
            // This function is called frequently when no QR code is in view. We can ignore it.
        };

        scanner.render(onScanSuccess, onScanFailure);

        // Cleanup function to ensure the scanner is properly stopped when you leave the page
        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5-qrcode scanner.", error);
            });
        };
    }, []);

    return (
        <main className="p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-md bg-white/80 p-8 rounded-2xl shadow-lg text-center">
                <h2 className="text-2xl font-bold text-[#021024] mb-4">Scan Lecture QR Code</h2>
                {scanResult ? (
                    <div className="my-8">
                        <p className="text-green-600 font-bold text-lg">{scanResult}</p>
                    </div>
                ) : (
                    // This div is the container where the camera view will be rendered by the library
                    <div id="reader" className="w-full"></div>
                )}
                 <button onClick={() => setView('studentDashboard')} className="mt-6 text-slate-600 hover:underline">
                    Back to Dashboard
                </button>
            </div>
        </main>
    );
};

// NOTE: MarkAttendancePage has been removed as it is replaced by ScanQRCodePage.

export const ViewSchedulePage = ({ lectures }) => (
    <main className="p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white/80 p-8 rounded-2xl shadow-lg">
            <div className="flex items-center justify-center gap-4 mb-6"><CalendarDaysIcon className="w-10 h-10 text-[#052659]"/><h2 className="text-3xl font-bold text-center">My Weekly Schedule</h2></div>
            {lectures.length > 0 ? (<div className="space-y-4">{lectures.map(lecture => (<div key={lecture.id} className="bg-slate-50 p-4 rounded-lg border-l-4 border-[#5483B3]"><h3 className="font-bold text-lg">{lecture.name} ({lecture.teacher_name})</h3><p className="text-slate-600">{lecture.subject}</p><p className="text-sm text-slate-500 mt-1">{lecture.time}</p></div>))}</div>) : (<p className="text-center text-slate-500">Your schedule is empty.</p>)}
        </div>
    </main>
);