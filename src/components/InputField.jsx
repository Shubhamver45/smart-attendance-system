import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const InputField = ({ id, label, type, placeholder, icon, value, onChange }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    return (
        <div>
            <label htmlFor={id} className="text-sm font-medium text-slate-700 block mb-2">{label}</label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">{icon}</span>
                <input
                    id={id} 
                    name={id} 
                    type={type === 'password' && isPasswordVisible ? 'text' : type}
                    placeholder={placeholder} 
                    value={value} 
                    onChange={onChange}
                    required 
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-slate-50 focus:bg-white"
                />
                {type === 'password' && (
                    <button 
                        type="button" 
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)} 
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                        {isPasswordVisible ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                )}
            </div>
        </div>
    );
};