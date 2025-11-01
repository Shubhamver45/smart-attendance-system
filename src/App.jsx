import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { TeacherLoginPage, TeacherRegisterPage, StudentLoginPage, StudentRegisterPage } from './pages/AuthPages';
import { TeacherDashboard, AttendanceReportsPage, CreateLecturePage } from './pages/TeacherPages';
// CORRECTED: We now import ScanQRCodePage, not MarkAttendancePage
import { StudentDashboard, ScanQRCodePage, ViewSchedulePage } from './pages/StudentPages';

// Use the Vercel environment variable, with a fallback for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function App() {
    // --- STATE MANAGEMENT ---
    const [user, setUser] = useState(null);
    const [view, setView] = useState('landing');
    const [lectures, setLectures] = useState([]);
    const [activeLecture, setActiveLecture] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [registeredStudents, setRegisteredStudents] = useState([]); // Used for teacher reports
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
    const [lectureNotification, setLectureNotification] = useState(null);

    // --- EFFECT HOOKS ---
    useEffect(() => {
        const initializeApp = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const urlParams = new URLSearchParams(window.location.search);
            const lectureIdFromUrl = urlParams.get('lectureId');

            if (storedToken && storedUser) {
                setUser(storedUser);
                setToken(storedToken);
                await fetchDataForUser(storedUser, storedToken, lectureIdFromUrl);
                // We let fetchDataForUser set the view
            } else if (lectureIdFromUrl) {
                localStorage.setItem('pendingLectureId', lectureIdFromUrl);
                setView('studentLogin');
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };
        initializeApp();
    }, []);
    
    useEffect(() => {
        if (user?.role === 'student' && notificationPermission === 'default') {
            Notification.requestPermission().then(setNotificationPermission);
        }
    }, [user, notificationPermission]);

    // --- DATA FETCHING LOGIC (COMPLETE) ---
    const fetchDataForUser = async (userData, userToken, lectureIdFromUrl = null) => {
        try {
            let lectureRes;
            if (userData.role === 'teacher') {
                lectureRes = await fetch(`${API_URL}/teacher/lectures/${userData.id}`, { headers: { 'Authorization': `Bearer ${userToken}` } });
            } else { // Student role
                // Fetch all available lectures
                lectureRes = await fetch(`${API_URL}/student/lectures`, { headers: { 'Authorization': `Bearer ${userToken}` } });
                
                // CORRECTED: Also fetch the student's personal attendance history
                const attendanceRes = await fetch(`${API_URL}/student/attendance/${userData.id}`, { headers: { 'Authorization': `Bearer ${userToken}` } });
                if (attendanceRes.ok) {
                    const attendanceData = await attendanceRes.json();
                    setAttendanceRecords(attendanceData);
                }
            }
            const lectureData = await lectureRes.json();
            if (!lectureRes.ok) throw new Error(lectureData.error || 'Failed to fetch lectures');
            setLectures(lectureData);

            // Handle QR code scan redirection after data is loaded
            if (lectureIdFromUrl && userData.role === 'student') {
                const lectureToAttend = lectureData.find(l => l.id === parseInt(lectureIdFromUrl));
                if (lectureToAttend) {
                    setLectureNotification(lectureToAttend);
                    setView('studentDashboard'); // Show notification on dashboard first
                } else {
                    setView('studentDashboard');
                }
            } else {
                setView(userData.role === 'teacher' ? 'teacherDashboard' : 'studentDashboard');
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Could not fetch initial data from the server.");
        }
    };
    
    // --- NOTIFICATION & API HANDLERS ---
    const showNotification = (lecture) => {
        if (notificationPermission === 'granted' && lecture) {
            new Notification(`Attendance Open: ${lecture.name}`, { body: `Tap to mark your presence.`, icon: '/vite.svg' }).onclick = () => {
                handleAttendFromNotification(lecture);
            };
        }
    };

    // CORRECTED: This now uses the role-specific login routes
    const handleLogin = async (email, password, role) => {
        try {
            const res = await fetch(`${API_URL}/auth/${role}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            
            const pendingLectureId = localStorage.getItem('pendingLectureId');
            await fetchDataForUser(data.user, data.token, pendingLectureId);
            if (pendingLectureId) localStorage.removeItem('pendingLectureId');
        } catch (error) {
            alert(`Login Failed: ${error.message}`);
        }
    };

    const handleRegister = async (formData) => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            alert('Registration successful! Please log in.');
            setView(formData.role === 'teacher' ? 'teacherLogin' : 'studentLogin');
        } catch (error) {
            alert(`Registration Failed: ${error.message}`);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setUser(null); setToken(null); setView('landing');
        setLectures([]); setActiveLecture(null); setAttendanceRecords([]);
        window.history.pushState({}, '', window.location.pathname);
    };

    const addLecture = async (lectureData) => {
        try {
            const res = await fetch(`${API_URL}/teacher/lectures`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ ...lectureData, teacher_id: user.id }) });
            const newLecture = await res.json();
            if (!res.ok) throw new Error(newLecture.error || 'Failed to create lecture');
            // Add teacher_name locally for immediate UI update
            setLectures(prev => [{ ...newLecture, teacher_name: user.name }, ...prev]);
            return newLecture;
        } catch (error) {
            alert(`Error: ${error.message}`);
            return null;
        }
    };
    
    // CORRECTED: This now takes only lectureId and has no geo-fencing.
    const markAttendance = async (lectureId) => {
        if (!lectureId) {
             alert("Invalid Lecture ID.");
             return false;
        }
        try {
            const res = await fetch(`${API_URL}/student/mark-attendance`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                // Send only the required data
                body: JSON.stringify({ lectureId: lectureId, studentId: user.id }) 
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to mark attendance');

            // Add to local state for immediate UI update
            setAttendanceRecords(prev => [...prev, { id: data.newRecordId, lectureId, studentId: user.id, status: 'present', timestamp: new Date().toISOString() }]);
            return true;
        } catch (error) {
            alert(`Attendance Failed: ${error.message}`);
            return false;
        }
    };

    const handleSetActiveLecture = (lecture) => {
        setActiveLecture(lecture);
        if (lecture) {
            setLectureNotification(lecture);
            showNotification(lecture);
        }
    };
    
    const handleAttendFromNotification = (lecture) => {
        if (lecture) {
            setActiveLecture(lecture);
            setView('scanQRCode'); // Go to the scanner page
        }
        setLectureNotification(null);
    };

    // --- RENDER LOGIC ---
    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-screen"><h1 className="text-2xl font-bold">Loading...</h1></div>;

        if (user) {
            switch (view) {
                case 'teacherDashboard': return <TeacherDashboard user={user} setView={setView} lectures={lectures} activeLecture={activeLecture} setActiveLecture={handleSetActiveLecture} token={token} allStudents={registeredStudents} />;
                case 'reports': return <AttendanceReportsPage setView={setView} lectures={lectures} teacherId={user.id} token={token} />;
                case 'createLecture': return <CreateLecturePage setView={setView} addLecture={addLecture} setActiveLecture={handleSetActiveLecture} />;
                
                // CORRECTED: Renders ScanQRCodePage, and passes filtered attendance records
                case 'studentDashboard': return <StudentDashboard user={user} setView={setView} lectures={lectures} attendanceRecords={attendanceRecords} lectureNotification={lectureNotification} onAttendNow={handleAttendFromNotification} />;
                case 'scanQRCode': return <ScanQRCodePage setView={setView} markAttendance={markAttendance} />;
                case 'viewSchedule': return <ViewSchedulePage setView={setView} lectures={lectures} />;
                
                default: setView(user.role === 'teacher' ? 'teacherDashboard' : 'studentDashboard'); return null;
            }
        }
        
        switch (view) {
            case 'teacherLogin': return <TeacherLoginPage setView={setView} onLogin={handleLogin} />;
            case 'teacherRegister': return <TeacherRegisterPage setView={setView} onRegister={handleRegister} />;
            case 'studentLogin': return <StudentLoginPage setView={setView} onLogin={handleLogin} />;
            case 'studentRegister': return <StudentRegisterPage setView={setView} onRegister={handleRegister} />;
            default: return <LandingPage setView={setView} />;
        }
    };

    return (
        <>
            <Navbar user={user} setView={setView} onLogout={handleLogout} />
            <div key={view} className="animate-fadeIn">
                {renderContent()}
            </div>
        </>
    );
}