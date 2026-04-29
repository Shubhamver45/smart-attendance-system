/**
 * Geolocation Utilities for Smart Attendance System
 * Handles GPS location fetching and distance calculations
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Get current GPS location of the user using an advanced multi-sampling technique.
 * Laptops have poor accuracy, so this watches the position for a few seconds
 * and returns the reading with the absolute best accuracy.
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        let bestPosition = null;
        let watchId = null;
        let timeoutId = null;

        // Function to finalize and return the best location we found
        const finish = () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            if (timeoutId !== null) clearTimeout(timeoutId);
            
            if (bestPosition) {
                resolve({
                    latitude: bestPosition.coords.latitude,
                    longitude: bestPosition.coords.longitude,
                    accuracy: bestPosition.coords.accuracy
                });
            } else {
                reject(new Error("Unable to retrieve an accurate location in time."));
            }
        };

        // Watch the position continuously
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                // If this is the first reading, or the accuracy is better (lower number = better)
                if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
                    bestPosition = position;
                }
                
                // If we get an amazing accuracy (like a phone's GPS), exit early!
                if (bestPosition.coords.accuracy <= 15) {
                    finish();
                }
            },
            (error) => {
                // Only throw error if we haven't found *any* position yet
                if (!bestPosition) {
                    let errorMessage = 'Unable to retrieve your location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied. Please enable location access.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
                    if (timeoutId !== null) clearTimeout(timeoutId);
                    reject(new Error(errorMessage));
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        // Run the calibration for 12 seconds to give Wi-Fi scanning time to lock on (important for laptops)
        timeoutId = setTimeout(() => {
            finish();
        }, 12000);
    });
};

/**
 * Check if user is within geofence
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {number} targetLat - Target location latitude
 * @param {number} targetLon - Target location longitude
 * @param {number} radius - Geofence radius in meters
 * @returns {boolean} True if within geofence
 */
export const isWithinGeofence = (userLat, userLon, targetLat, targetLon, radius) => {
    const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
    return distance <= radius;
};

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)} meters`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
};
