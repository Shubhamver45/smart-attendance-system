import React, { useState } from 'react';
import { EyeIcon } from './Icons';

export const InputField = ({ id, label, type, placeholder, icon, value, onChange }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    return (
        <div>
            <label htmlFor={id} className="text-sm font-medium text-slate-700 block mb-2">{label}</label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">{icon}</span>
                <input
                    id={id} name={id} type={isPasswordVisible ? 'text' : type}
                    placeholder={placeholder} value={value} onChange={onChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5483B3] transition-all"
                />
                {type === 'password' && (
                    <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                        <EyeIcon className="w-5 h-5"/>
                    </button>
                )}
            </div>
        </div>
    );
};