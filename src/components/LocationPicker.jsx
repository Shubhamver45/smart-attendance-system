import React, { useState } from 'react';
import { MapPinIcon } from './Icons.jsx';
import { getCurrentLocation } from '../utils/geolocation.js';

export const LocationPicker = ({ location, radius, onLocationChange, onRadiusChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [locationStatus, setLocationStatus] = useState('');

    const handleGetCurrentLocation = async () => {
        setIsLoading(true);
        setError('');
        setLocationStatus('');

        try {
            const position = await getCurrentLocation();
            onLocationChange({
                latitude: position.latitude,
                longitude: position.longitude
            });
            setLocationStatus(`Location set successfully! (Accuracy: ±${Math.round(position.accuracy)}m)`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border-2 border-dashed border-slate-300">
            <div className="flex items-center gap-2 mb-2">
                <MapPinIcon className="w-5 h-5 text-[#052659]" />
                <h3 className="font-bold text-lg">Geofencing Settings</h3>
            </div>

            <p className="text-sm text-slate-600">
                Set the lecture location and allowed radius. Students must be within this area to mark attendance.
            </p>

            {/* Location Display */}
            {location.latitude && location.longitude ? (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-green-800">📍 Location Set</p>
                    <p className="text-xs text-green-700 mt-1">
                        Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)}
                    </p>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-amber-800">⚠️ No location set</p>
                    <p className="text-xs text-amber-700 mt-1">
                        Click the button below to set the lecture location
                    </p>
                </div>
            )}

            {/* Get Location Button */}
            <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
                className="w-full bg-[#5483B3] text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-[#052659] disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <span className="animate-spin">⟳</span>
                        Getting Location...
                    </>
                ) : (
                    <>
                        <MapPinIcon className="w-4 h-4" />
                        {location.latitude ? 'Update Location' : 'Set Current Location'}
                    </>
                )}
            </button>

            {/* Status Messages */}
            {locationStatus && (
                <div className="bg-blue-50 border border-blue-200 p-2 rounded text-sm text-blue-700">
                    ✓ {locationStatus}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 p-2 rounded text-sm text-red-700">
                    ✗ {error}
                </div>
            )}

            {/* Radius Input */}
            <div>
                <label htmlFor="radius" className="block text-sm font-medium text-slate-700 mb-2">
                    Geofence Radius (meters)
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        id="radius"
                        min="10"
                        max="5000"
                        step="10"
                        value={radius}
                        onChange={(e) => onRadiusChange(parseInt(e.target.value) || 50)}
                        className="flex-1 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5483B3] focus:border-transparent"
                        placeholder="e.g., 100"
                    />
                    <span className="text-sm font-semibold text-slate-600 min-w-[60px]">meters</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                    Recommended: 50-200 meters for classroom, 500+ for large campus
                </p>

                {/* Visual Radius Indicator */}
                <div className="mt-3 bg-white p-3 rounded border border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>Very Close</span>
                        <span>Far</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 relative overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((radius / 5000) * 100, 100)}%` }}
                        />
                    </div>
                    <p className="text-center mt-1 text-sm font-bold text-[#052659]">
                        {radius} meters
                    </p>
                </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p className="text-xs text-blue-800">
                    <strong>💡 Tip:</strong> Make sure you're at the lecture location when setting the coordinates.
                    Students will need to be within {radius}m of this point to mark attendance.
                </p>
            </div>
        </div>
    );
};
