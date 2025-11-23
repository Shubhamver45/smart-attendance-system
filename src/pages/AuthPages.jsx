import React, { useState } from 'react';
import { InputField } from '../components/InputField.jsx'; 
import { ArrowLeft, User, Mail, Lock, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthFormContainer = ({ children, title, subtitle, icon }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100"
    >
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl text-blue-600 mb-2">
            {icon}
        </div>
        <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-slate-500 mt-2">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
);

const AuthPageWrapper = ({ setView, children }) => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <header className="absolute top-0 left-0 p-6 z-10">
            <button 
                onClick={() => setView('landing')} 
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Home
            </button>
        </header>
        <main className="w-full flex justify-center relative z-10">{children}</main>
    </div>
);

// --- TEACHER AUTHENTICATION ---

export const TeacherLoginPage = ({ setView, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        onLogin(email, password, 'teacher'); // Passes the role to App.jsx
    };

    return (
        <AuthPageWrapper setView={setView}>
            <AuthFormContainer icon={<User className="w-8 h-8" />} title="Teacher Login" subtitle="Sign in to your teacher account">
                <form className="space-y-6" onSubmit={handleLogin}>
                    <InputField label="Email" type="email" id="email" placeholder="Enter your email" icon={<Mail className="w-5 h-5"/>} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField label="Password" type="password" id="password" placeholder="Enter your password" icon={<Lock className="w-5 h-5"/>} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Sign In</button>
                </form>
                <p className="text-center text-slate-600 mt-6">Don't have an account? <a href="#" onClick={(e) => {e.preventDefault(); setView('teacherRegister')}} className="font-semibold text-blue-600 hover:underline">Sign up</a></p>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};

export const TeacherRegisterPage = ({ setView, onRegister }) => {
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'teacher' });
    const handleChange = (e) => setFormData({...formData, [e.target.id]: e.target.value});
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onRegister(formData);
    };

    return (
        <AuthPageWrapper setView={setView}>
            <AuthFormContainer icon={<User className="w-8 h-8" />} title="Teacher Registration" subtitle="Create your account to get started">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <InputField id="name" label="Full Name" type="text" placeholder="Enter your full name" icon={<User className="w-5 h-5"/>} value={formData.name} onChange={handleChange} />
                    <InputField id="email" label="Email" type="email" placeholder="Enter your email" icon={<Mail className="w-5 h-5"/>} value={formData.email} onChange={handleChange} />
                    <InputField id="password" label="Password" type="password" placeholder="Create a password" icon={<Lock className="w-5 h-5"/>} value={formData.password} onChange={handleChange} />
                    <InputField id="id" label="Employee ID" type="text" placeholder="e.g., mit1234" icon={<User className="w-5 h-5"/>} value={formData.id} onChange={handleChange} />
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Create Account</button>
                </form>
                <p className="text-center text-slate-600 mt-6">Already have an account? <a href="#" onClick={(e) => {e.preventDefault(); setView('teacherLogin')}} className="font-semibold text-blue-600 hover:underline">Sign in here</a></p>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};

// --- STUDENT AUTHENTICATION ---

export const StudentLoginPage = ({ setView, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        onLogin(email, password, 'student'); // Passes the role to App.jsx
    };

    return (
        <AuthPageWrapper setView={setView}>
            <AuthFormContainer icon={<GraduationCap className="w-8 h-8" />} title="Student Login" subtitle="Sign in to your student account">
                 <form className="space-y-6" onSubmit={handleLogin}>
                    <InputField label="Email" type="email" id="email" placeholder="Enter your email" icon={<Mail className="w-5 h-5"/>} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField label="Password" type="password" id="password" placeholder="Enter your password" icon={<Lock className="w-5 h-5"/>} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Sign In</button>
                </form>
                <p className="text-center text-slate-600 mt-6">Don't have an account? <a href="#" onClick={(e) => {e.preventDefault(); setView('studentRegister')}} className="font-semibold text-blue-600 hover:underline">Sign up</a></p>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};

export const StudentRegisterPage = ({ setView, onRegister }) => {
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'student', roll_number: '', enrollment_number: '' });
    const handleChange = (e) => setFormData({...formData, [e.target.id]: e.target.value});
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onRegister(formData);
    };

    return (
        <AuthPageWrapper setView={setView}>
            <AuthFormContainer icon={<GraduationCap className="w-8 h-8" />} title="Student Registration" subtitle="Create your account to get started">
                 <form className="space-y-4" onSubmit={handleSubmit}>
                    <InputField id="name" label="Full Name" type="text" placeholder="Enter your full name" icon={<User className="w-5 h-5"/>} value={formData.name} onChange={handleChange} />
                    <InputField id="roll_number" label="Roll Number" type="text" placeholder="Enter your roll number" icon={<User className="w-5 h-5"/>} value={formData.roll_number} onChange={handleChange} />
                    <InputField id="enrollment_number" label="Enrollment Number" type="text" placeholder="Enter your enrollment number" icon={<User className="w-5 h-5"/>} value={formData.enrollment_number} onChange={handleChange} />
                    <InputField id="id" label="Student ID" type="text" placeholder="e.g., mit263" icon={<User className="w-5 h-5"/>} value={formData.id} onChange={handleChange} />
                    <InputField id="email" label="Email" type="email" placeholder="Enter your email" icon={<Mail className="w-5 h-5"/>} value={formData.email} onChange={handleChange} />
                    <InputField id="password" label="Password" type="password" placeholder="Create a password" icon={<Lock className="w-5 h-5"/>} value={formData.password} onChange={handleChange} />
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Create Account</button>
                </form>
                <p className="text-center text-slate-600 mt-6">Already have an account? <a href="#" onClick={(e) => {e.preventDefault(); setView('studentLogin')}} className="font-semibold text-blue-600 hover:underline">Sign in here</a></p>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};