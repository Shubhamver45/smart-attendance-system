import React, { useState } from 'react';
// CORRECTED: Added .jsx extension
import { InputField } from '../components/InputField.jsx';
import {
    ArrowLeftIcon,
    UserIcon,
    MailIcon,
    LockIcon,
    BookOpenIcon,
    GraduationCapIcon,
    ShieldIcon
} from '../components/Icons.jsx';
import { FaceCapture } from '../components/FaceCapture.jsx';

// Reusable component for the form container
// CORRECTED: Added responsive padding (p-6 for mobile, p-8 for desktop)
const AuthFormContainer = ({ children, title, subtitle, icon }) => (
    <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
        <div className="text-center space-y-4">
            <div className="inline-block bg-slate-100 p-3 rounded-full text-[#052659]">{icon}</div>
            <h1 className="text-2xl font-bold text-[#021024]">{title}</h1>
            {subtitle && <p className="text-slate-500">{subtitle}</p>}
        </div>
        {children}
    </div>
);

// Reusable component for the page layout with a back button
const AuthPageWrapper = ({ setView, children }) => (
    <div className="w-full flex flex-col items-center justify-center min-h-screen p-4">
        <header className="absolute top-0 left-0 p-6 text-[#021024]">
            <button onClick={() => setView('landing')} className="flex items-center gap-2 text-lg hover:underline font-semibold">
                <ArrowLeftIcon /> Back to Home
            </button>
        </header>
        <main className="w-full flex justify-center py-12">{children}</main>
    </div>
);

// --- TEACHER AUTHENTICATION ---

export const TeacherLoginPage = ({ setView, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        await onLogin(email, password, 'teacher');
        setIsSubmitting(false);
    };

    return (
        <AuthPageWrapper setView={setView}>
            <AuthFormContainer icon={<UserIcon className="w-8 h-8" />} title="Teacher Login" subtitle="Sign in to your teacher account">
                <form className="space-y-6" onSubmit={handleLogin}>
                    <InputField autoFocus label="Email" type="email" id="email" placeholder="Enter your email" icon={<MailIcon className="w-5 h-5" />} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField label="Password" type="password" id="password" placeholder="Enter your password" icon={<LockIcon className="w-5 h-5" />} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" disabled={isSubmitting} className="w-full bg-[#052659] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#021024] transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
                        {isSubmitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Signing In...</> : 'Sign In'}
                    </button>
                </form>
                <p className="text-center text-slate-600 mt-6">Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('teacherRegister') }} className="font-semibold text-[#052659] hover:underline">Sign up</a></p>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};

export const TeacherRegisterPage = ({ setView, onRegister }) => {
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'teacher' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onRegister(formData);
        setIsSubmitting(false);
    };

    return (
        <AuthPageWrapper setView={setView}>
            <AuthFormContainer icon={<UserIcon className="w-8 h-8" />} title="Teacher Registration" subtitle="Create your account to get started">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <InputField id="name" label="Full Name" type="text" placeholder="Enter your full name" icon={<UserIcon className="w-5 h-5" />} value={formData.name} onChange={handleChange} />
                    <InputField id="email" label="Email" type="email" placeholder="Enter your email" icon={<MailIcon className="w-5 h-5" />} value={formData.email} onChange={handleChange} />
                    <InputField id="password" label="Password" type="password" placeholder="Create a password" icon={<LockIcon className="w-5 h-5" />} value={formData.password} onChange={handleChange} />
                    <InputField id="id" label="Employee ID" type="text" placeholder="e.g., mit1234" icon={<UserIcon className="w-5 h-5" />} value={formData.id} onChange={handleChange} />
                    <button type="submit" disabled={isSubmitting} className="w-full bg-[#052659] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#021024] transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
                        {isSubmitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating...</> : 'Create Account'}
                    </button>
                </form>
                <p className="text-center text-slate-600 mt-6">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('teacherLogin') }} className="font-semibold text-[#052659] hover:underline">Sign in here</a></p>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};

// --- STUDENT AUTHENTICATION ---

export const StudentLoginPage = ({ setView, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        await onLogin(email, password, 'student');
        setIsSubmitting(false);
    };

    return (
        <AuthPageWrapper setView={setView}>
            <AuthFormContainer icon={<GraduationCapIcon className="w-8 h-8" />} title="Student Login" subtitle="Sign in to your student account">
                <form className="space-y-6" onSubmit={handleLogin}>
                    <InputField autoFocus label="Email" type="email" id="email" placeholder="Enter your email" icon={<MailIcon className="w-5 h-5" />} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField label="Password" type="password" id="password" placeholder="Enter your password" icon={<LockIcon className="w-5 h-5" />} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" disabled={isSubmitting} className="w-full bg-[#052659] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#021024] transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
                        {isSubmitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Signing In...</> : 'Sign In'}
                    </button>
                </form>
                <p className="text-center text-slate-600 mt-6">Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('studentRegister') }} className="font-semibold text-[#052659] hover:underline">Sign up</a></p>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};

export const StudentRegisterPage = ({ setView, onRegister }) => {
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'student', roll_number: '', enrollment_number: '', subject_teacher_email: '', parents_email: '', mentor_email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onRegister(formData);
        setIsSubmitting(false);
    };

    return (
        <AuthPageWrapper setView={setView}>
            <AuthFormContainer icon={<GraduationCapIcon className="w-8 h-8" />} title="Student Registration" subtitle="Create your account to get started">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <InputField id="name" label="Full Name" type="text" placeholder="Enter your full name" icon={<UserIcon className="w-5 h-5" />} value={formData.name} onChange={handleChange} />
                    <InputField id="roll_number" label="Roll Number" type="text" placeholder="Enter your roll number" icon={<UserIcon className="w-5 h-5" />} value={formData.roll_number} onChange={handleChange} />
                    <InputField id="enrollment_number" label="Enrollment Number" type="text" placeholder="Enter your enrollment number" icon={<UserIcon className="w-5 h-5" />} value={formData.enrollment_number} onChange={handleChange} />
                    <InputField id="id" label="Student ID" type="text" placeholder="e.g., mit263" icon={<UserIcon className="w-5 h-5" />} value={formData.id} onChange={handleChange} />
                    <InputField id="email" label="Student Email" type="email" placeholder="Enter your email" icon={<MailIcon className="w-5 h-5" />} value={formData.email} onChange={handleChange} />
                    <InputField id="password" label="Password" type="password" placeholder="Create a password" icon={<LockIcon className="w-5 h-5" />} value={formData.password} onChange={handleChange} />
                    
                    <div className="border-t border-slate-200 pt-4 mt-4">
                        <p className="text-sm text-slate-500 font-semibold mb-3">Biometric Enrollment (Required)</p>
                        <FaceCapture 
                            onCapture={(embedding) => setFormData(prev => ({ ...prev, face_embedding: embedding }))} 
                            buttonText="Register My Face"
                        />
                        {formData.face_embedding && (
                            <p className="text-xs text-green-600 font-bold mt-2 text-center">✓ Biometric data secured</p>
                        )}
                    </div>

                    <div className="border-t border-slate-200 pt-4 mt-4">
                        <p className="text-sm text-slate-500 font-semibold mb-3">Emergency & Academic Contacts</p>
                        <div className="space-y-4">
                            <InputField id="subject_teacher_email" label="Class Teacher Email" type="email" placeholder="Class Teacher's email" icon={<MailIcon className="w-5 h-5 text-slate-400" />} value={formData.subject_teacher_email} onChange={handleChange} />
                            <InputField id="parents_email" label="Parents Email" type="email" placeholder="Parents email address" icon={<MailIcon className="w-5 h-5 text-slate-400" />} value={formData.parents_email} onChange={handleChange} />
                            <InputField id="mentor_email" label="Mentor Email" type="email" placeholder="Your mentor's email" icon={<MailIcon className="w-5 h-5 text-slate-400" />} value={formData.mentor_email} onChange={handleChange} />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !formData.face_embedding} 
                        className="w-full bg-[#052659] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#021024] transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating...</> : 'Create Account'}
                    </button>
                </form>
                <p className="text-center text-slate-600 mt-6">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('studentLogin') }} className="font-semibold text-[#052659] hover:underline">Sign in here</a></p>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};

// --- ADMIN AUTHENTICATION ---

export const AdminLoginPage = ({ setView, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        await onLogin(email, password, 'admin');
        setIsSubmitting(false);
    };

    return (
        <AuthPageWrapper setView={setView}>
            <AuthFormContainer icon={<ShieldIcon className="w-8 h-8" />} title="Admin Login" subtitle="Sign in to the admin panel">
                <form className="space-y-6" onSubmit={handleLogin}>
                    <InputField autoFocus label="Email" type="email" id="admin-email" placeholder="Enter admin email" icon={<MailIcon className="w-5 h-5" />} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField label="Password" type="password" id="admin-password" placeholder="Enter admin password" icon={<LockIcon className="w-5 h-5" />} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" disabled={isSubmitting} className="w-full bg-[#052659] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#021024] transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
                        {isSubmitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Signing In...</> : 'Sign In as Admin'}
                    </button>
                </form>
                <p className="text-center text-slate-500 mt-6 text-sm">Admin access is restricted. Contact system administrator for credentials.</p>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};