import React from 'react';
import { XIcon } from './Icons';

export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-fadeInUp">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-[#021024]">{title}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-full transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};