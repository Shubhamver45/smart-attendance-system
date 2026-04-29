import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode'; // Import the new scanner package
import { CalendarIcon, MapPinIcon, QrCodeIcon, CalendarDaysIcon } from '../components/Icons.jsx';
import { getCurrentLocation, isWithinGeofence, formatDistance, calculateDistance } from '../utils/geolocation.js';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

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

    // THIS IS THE FIX for the "N/A" bug.
    // We create a "Map" for instant lecture name lookups.
    const lectureMap = new Map(lectures.map(l => [l.id, l.name]));

    // Calculate absent count based on lectures that have passed
    const absentCount = lectures.length - presentCount;
    // Handle potential negative number if records load faster than lectures
    const finalAbsentCount = Math.max(0, absentCount);

    const attendanceRate = lectures.length > 0 ? Math.round((presentCount / lectures.length) * 100) : 0;

    return (
        <main className="p-4 md:p-8">
            {lectureNotification && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg mb-8 animate-fadeIn" role="alert">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div><p className="font-bold">Attendance is Open!</p><p>Your teacher has started attendance for: <strong>{lectureNotification.name}</strong>.</p></div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button onClick={() => onAttendNow(lectureNotification)} className="flex-1 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600">Scan Now</button>
                            <button onClick={() => onAttendNow(null)} className="font-bold text-2xl text-blue-500 hover:text-blue-700">&times;</button>
                        </div>
                    </div>
                </div>
            )}
            {/* UPDATED: Grid is now 3 columns, "Late" card is removed */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/80 p-6 rounded-2xl shadow-lg"><h3 className="font-semibold text-slate-500 mb-2">Attendance Rate</h3><p className="text-3xl font-bold text-[#052659]">{attendanceRate}%</p><div className="w-full bg-slate-200 rounded-full h-2.5 mt-2"><div className="bg-[#5483B3] h-2.5 rounded-full" style={{ width: `${attendanceRate}%` }}></div></div><p className="text-sm text-slate-400 mt-1">{presentCount} of {lectures.length} classes</p></div>
                <StatCard title="Present" value={presentCount} subtitle="On time" color="green" />
                <StatCard title="Absent" value={finalAbsentCount} subtitle="Missed classes" color="red" />
            </div>

            {/* REMOVED: The entire "Quick Actions" box is gone */}

            <div className="bg-white/80 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Attendance History</h3>
                {myRecords.length > 0 ? (
                    <ul className="space-y-3">{myRecords.map(record => {
                        // THIS IS THE FIX: We use the lectureMap to find the name
                        const lectureName = lectureMap.get(record.lecture_id) || 'Lecture Data Loading...';
                        return (
                            <li key={record.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold">{lectureName}</p>
                                    <p className="text-sm text-slate-500">{new Date(record.timestamp).toLocaleString()}</p>
                                </div>
                                <span className="font-bold text-green-600 capitalize">{record.status}</span>
                            </li>
                        );
                    })}</ul>
                ) : (
                    <div className="text-center p-12 flex flex-col items-center gap-4"><CalendarIcon className="w-16 h-16 text-slate-300" /><h4 className="text-xl font-semibold">No records found</h4><p className="text-slate-500">Your attendance history will appear here.</p></div>
                )}
            </div>
        </main>
    );
};

// CORRECTED: This is the in-app QR code scanner page with geofencing
export const ScanQRCodePage = ({ setView, markAttendance, lectures, token }) => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [locationStatus, setLocationStatus] = useState('');

    useEffect(() => {
        if (!isScanning) return;

        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: { width: 250, height: 250 },
            fps: 10,
            videoConstraints: {
                facingMode: "environment"
            }
        });

        const onScanSuccess = async (decodedText, decodedResult) => {
            if (!isScanning) return; // Prevent multiple scans
            setIsScanning(false); // Stop scanning

            try {
                // The decoded text is a URL, e.g., "https://.../attend?lectureId=123"
                const url = new URL(decodedText);
                const lectureId = url.searchParams.get('lectureId');

                if (lectureId) {
                    setScanResult(`Verifying location...`);
                    setLocationStatus('Getting your location...');

                    // Find the lecture details — try local cache first, then fetch fresh.
                    // A new lecture created after login won't be in the local list.
                    let lecture = lectures.find(l => l.id === parseInt(lectureId));

                    if (!lecture) {
                        setScanResult('Fetching lecture details...');
                        setLocationStatus('Loading lecture info...');
                        try {
                            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                            const freshRes = await fetch(`${API_URL}/student/lectures`, { headers });
                            if (freshRes.ok) {
                                const freshLectures = await freshRes.json();
                                lecture = freshLectures.find(l => l.id === parseInt(lectureId));
                            }
                        } catch (fetchErr) {
                            // Ignore, failure is handled below
                        }
                    }

                    if (!lecture) {
                        throw new Error("Lecture not found. It may have been removed.");
                    }

                    // Check if lecture has geofencing enabled
                    if (!lecture.latitude || !lecture.longitude) {
                        // No geofencing for this lecture, proceed normally
                        setScanResult(`Marking attendance...`);
                        const success = await markAttendance(lectureId);
                        if (success) {
                            setScanResult('✓ Attendance Marked Successfully!');
                            setTimeout(() => setView('studentHome'), 2000);
                        } else {
                            setTimeout(() => setView('studentHome'), 3000);
                        }
                        return;
                    }

                    // Get student's current location
                    try {
                        const studentLocation = await getCurrentLocation();
                        setLocationStatus('Checking if you are within range...');

                        // Calculate distance
                        const distance = calculateDistance(
                            studentLocation.latitude,
                            studentLocation.longitude,
                            lecture.latitude,
                            lecture.longitude
                        );

                        // Use Accuracy Value from the Browser API dynamically
                        const browserAccuracy = studentLocation.accuracy || 0;
                        const baseRadius = lecture.radius || 100;

                        // Check if within geofence by subtracting the browser's accuracy margin from the calculated distance.
                        // We cap the maximum allowed accuracy compensation (e.g., 200m) so a wildly inaccurate GPS (like 5000m) doesn't allow cheating.
                        const compensatedDistance = Math.max(0, distance - Math.min(browserAccuracy, 200));
                        const withinGeofence = compensatedDistance <= baseRadius;

                        if (withinGeofence) {
                            setScanResult(`Location verified! Marking attendance...`);
                            const success = await markAttendance(lectureId);
                            if (success) {
                                setScanResult(`✓ Attendance Marked Successfully!\n\nYou are ${formatDistance(distance)} from the lecture.\n(GPS Accuracy: ±${Math.round(browserAccuracy)}m)`);
                                setTimeout(() => setView('studentHome'), 2500);
                            } else {
                                setTimeout(() => setView('studentHome'), 3000);
                            }
                        } else {
                            setScanResult(`❌ Location Verification Failed\n\nYou are ${formatDistance(distance)} away from the lecture.\n\nRequired: Within ${baseRadius} meters\n(Your GPS Accuracy: ±${Math.round(browserAccuracy)}m)\n\nPlease move closer to mark attendance.`);
                            setTimeout(() => setView('studentHome'), 5000);
                        }
                    } catch (locationError) {
                        setScanResult(`❌ Location Access Required\n\n${locationError.message}\n\nPlease enable location services to mark attendance.`);
                        setTimeout(() => setView('studentHome'), 5000);
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
            // This function is called frequently, so we don't log anything here.
        };

        scanner.render(onScanSuccess, onScanFailure);

        // Cleanup function to stop the scanner
        return () => {
            // Check if scanner is still running before trying to clear
            if (scanner && scanner.getState() === 2) { // 2 = SCANNING
                scanner.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner.", error);
                });
            }
        };
    }, [isScanning, setView, markAttendance, lectures]); // Add dependencies

    return (
        <main className="p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-md bg-white/80 p-8 rounded-2xl shadow-lg text-center">
                <h2 className="text-2xl font-bold text-[#021024] mb-4">Scan Lecture QR Code</h2>

                {locationStatus && !scanResult && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <p className="text-sm text-blue-700 font-semibold">{locationStatus}</p>
                    </div>
                )}

                {scanResult ? (
                    <div className="my-8 min-h-[250px] flex items-center justify-center">
                        <p className="text-lg font-bold whitespace-pre-line" style={{
                            color: scanResult.includes('✓') ? '#16a34a' : scanResult.includes('❌') ? '#dc2626' : '#059669'
                        }}>{scanResult}</p>
                    </div>
                ) : (
                    // This div is the container where the camera view will be rendered
                    <div id="reader" className="w-full"></div>
                )}
                <button onClick={() => setView('studentHome')} className="mt-6 text-slate-600 hover:underline">
                    Back to Dashboard
                </button>
            </div>
        </main>
    );
};

// NOTE: MarkAttendancePage has been removed as it is replaced by ScanQRCodePage.

export const ViewSchedulePage = ({ lectures, setView }) => (
    <main className="p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white/80 p-8 rounded-2xl shadow-lg">
            <div className="flex items-center justify-center gap-4 mb-6">
                <CalendarDaysIcon className="w-10 h-10 text-[#052659]" />
                <h2 className="text-3xl font-bold text-center">My Weekly Schedule</h2>
            </div>
            {/* Added back button for mobile-friendliness */}
            <button onClick={() => setView('studentHome')} className="mb-4 text-[#052659] hover:underline md:hidden">
                &larr; Back to Dashboard
            </button>
            {lectures.length > 0 ? (<div className="space-y-4">{lectures.map(lecture => (<div key={lecture.id} className="bg-slate-50 p-4 rounded-lg border-l-4 border-[#5483B3]"><h3 className="font-bold text-lg">{lecture.name} ({lecture.teacher_name})</h3><p className="text-slate-600">{lecture.subject}</p><p className="text-sm text-slate-500 mt-1">{lecture.time}</p></div>))}</div>) : (<p className="text-center text-slate-500">Your schedule is empty.</p>)}
        </div>
    </main>
);

export const StudentProfilePage = ({ setView, user, token }) => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        subject_teacher_email: '',
        parents_email: '',
        mentor_email: ''
    });
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/student/profile/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    setFormData({
                        subject_teacher_email: data.subject_teacher_email || '',
                        parents_email: data.parents_email || '',
                        mentor_email: data.mentor_email || ''
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        fetchProfile();
    }, [user.id, token]);

    const handleSave = async (e) => {
        e.preventDefault();
        setStatusMessage('Saving...');
        try {
            const res = await fetch(`${API_URL}/student/profile/${user.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setStatusMessage('Profile updated successfully!');
                setIsEditing(false);
                setProfile({ ...profile, ...formData });
            } else {
                setStatusMessage('Failed to update profile.');
            }
        } catch (error) {
            setStatusMessage('Error updating profile.');
            console.error(error);
        }
        setTimeout(() => setStatusMessage(''), 3000);
    };

    if (!profile) return <main className="p-8 text-center">Loading profile...</main>;

    return (
        <main className="p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white/80 p-8 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-[#052659]">My Profile</h2>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200">
                            Edit Contacts
                        </button>
                    )}
                </div>

                {statusMessage && (
                    <div className={`p-3 rounded-lg mb-6 text-center font-semibold ${statusMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {statusMessage}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Read-only primary info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Full Name</p>
                            <p className="text-lg font-bold">{profile.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Student ID</p>
                            <p className="text-lg font-bold">{profile.id}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Roll/Enrollment No.</p>
                            <p className="font-semibold">{profile.roll_number} / {profile.enrollment_number}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Primary Email</p>
                            <p className="font-semibold">{profile.email}</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-xl font-bold mb-4">Emergency & Academic Contacts</h3>
                        {isEditing ? (
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">Class Teacher Email</label>
                                    <input type="email" value={formData.subject_teacher_email} onChange={e => setFormData({...formData, subject_teacher_email: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Class Teacher's Email" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">Parents Email</label>
                                    <input type="email" value={formData.parents_email} onChange={e => setFormData({...formData, parents_email: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Parent's Email" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">Mentor Email</label>
                                    <input type="email" value={formData.mentor_email} onChange={e => setFormData({...formData, mentor_email: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Mentor's Email" />
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700">Save Changes</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 text-slate-700 font-bold py-2 rounded-lg hover:bg-slate-300">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                                    <span className="font-semibold text-slate-600">Class Teacher</span>
                                    <span className={`font-bold ${profile.subject_teacher_email ? 'text-black' : 'text-red-500'}`}>{profile.subject_teacher_email || 'Not provided'}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                                    <span className="font-semibold text-slate-600">Parents</span>
                                    <span className={`font-bold ${profile.parents_email ? 'text-black' : 'text-red-500'}`}>{profile.parents_email || 'Not provided'}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                                    <span className="font-semibold text-slate-600">Mentor</span>
                                    <span className={`font-bold ${profile.mentor_email ? 'text-black' : 'text-red-500'}`}>{profile.mentor_email || 'Not provided'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button onClick={() => setView('studentHome')} className="mt-8 text-[#052659] hover:underline flex items-center gap-2">
                    &larr; Back to Dashboard
                </button>
            </div>
        </main>
    );
};