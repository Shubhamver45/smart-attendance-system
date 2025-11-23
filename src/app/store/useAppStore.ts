import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types for our data
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'teacher' | 'student';
}

export interface Lecture {
    id: number;
    name: string;
    teacher_id: number;
    teacher_name?: string;
    qr_code?: string;
    is_active: boolean;
    created_at: string;
}

export interface AttendanceRecord {
    id: number;
    lecture_id: number;
    student_id: number;
    status: string;
    timestamp: string;
}

interface AppState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    // Actions
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (user, token) => set({ user, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        {
            name: 'app-storage',
        }
    )
);
