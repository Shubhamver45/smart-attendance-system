# Geofencing Feature Documentation

## Overview
The Smart Attendance System now includes **GPS-based geofencing** to ensure students can only mark attendance when they are physically present at the lecture location.

## Features Added

### 1. **Teacher Side - Location Setting**
When creating a new lecture, teachers can:
- **Set the lecture location** by clicking "Set Current Location" button
  - Uses the device's GPS to capture current coordinates
  - Shows accuracy of the location capture
  - Displays latitude and longitude for verification
  
- **Configure geofence radius** (manually adjustable)
  - Default: 100 meters
  - Range: 10 to 5000 meters
  - Visual slider shows the radius scale
  - Recommendations:
    - 50-200 meters for classrooms
    - 500+ meters for large campus areas

### 2. **Student Side - Location Verification**
When students scan the QR code:
- **Automatic location check** is performed
- System verifies if student is within the allowed radius
- Shows real-time status:
  - "Getting your location..."
  - "Checking if you are within range..."
  - Success or failure message with distance information

### 3. **Smart Verification Logic**
- **Backward compatible**: Lectures without geofencing still work normally
- **Distance calculation**: Uses Haversine formula for accurate GPS distance
- **Clear error messages**: 
  - Shows exact distance from lecture location
  - Displays required radius
  - Provides actionable instructions

## How It Works

### For Teachers:
1. Navigate to "Create New Lecture"
2. Fill in subject, date, and time
3. In the "Geofencing Settings" section:
   - Click "Set Current Location" (ensure you're at the lecture venue)
   - Adjust the radius slider to set allowed distance
4. Generate QR code
5. The location and radius are saved with the lecture

### For Students:
1. Scan the lecture QR code
2. System automatically:
   - Requests location permission (if not granted)
   - Gets current GPS coordinates
   - Calculates distance to lecture location
   - Verifies if within allowed radius
3. Attendance is marked only if:
   - Student is within the geofence radius
   - Location permissions are granted
   - GPS signal is available

## Technical Implementation

### Files Added:
- `src/utils/geolocation.js` - GPS utilities and distance calculations
- `src/components/LocationPicker.jsx` - UI component for setting location

### Files Modified:
- `src/pages/TeacherPages.jsx` - Added location picker to lecture creation
- `src/pages/StudentPages.jsx` - Added geofencing verification to QR scanner
- `src/App.jsx` - Passed lectures data to scanner component

### Key Functions:
- `getCurrentLocation()` - Gets device GPS coordinates
- `calculateDistance()` - Haversine formula for GPS distance
- `isWithinGeofence()` - Checks if point is within radius
- `formatDistance()` - Human-readable distance formatting

## Database Schema Updates Needed

**IMPORTANT**: Your backend needs to store these additional fields for each lecture:

```sql
ALTER TABLE lectures ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE lectures ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE lectures ADD COLUMN radius INTEGER DEFAULT 100;
```

Or if creating new table:
```sql
CREATE TABLE lectures (
  id INTEGER PRIMARY KEY,
  teacher_id INTEGER,
  subject VARCHAR(255),
  date DATE,
  time TIME,
  latitude DECIMAL(10, 8),    -- NEW
  longitude DECIMAL(11, 8),   -- NEW
  radius INTEGER DEFAULT 100, -- NEW (in meters)
  -- other existing fields...
);
```

## API Updates Needed

### Create Lecture Endpoint
Update your `POST /api/teacher/lectures` endpoint to accept:
```json
{
  "subject": "Data Structures",
  "date": "2026-01-30",
  "time": "10:00",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "radius": 100,
  "teacher_id": 1
}
```

### Get Lectures Endpoint
Ensure `GET /api/student/lectures` and `GET /api/teacher/lectures/:id` return:
```json
{
  "id": 1,
  "name": "Data Structures",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "radius": 100,
  // other fields...
}
```

## Browser Permissions

Students will need to grant location permissions:
- **Chrome/Edge**: Shows permission prompt automatically
- **Firefox**: Shows permission prompt automatically
- **Safari**: May require HTTPS for geolocation
- **Mobile browsers**: Requires location services enabled on device

## Security Considerations

1. **HTTPS Required**: Geolocation API requires secure context (HTTPS)
2. **Privacy**: Student locations are only checked, not stored
3. **Accuracy**: GPS accuracy varies (typically 5-50 meters)
4. **Spoofing**: Advanced users could potentially spoof location (consider additional verification if needed)

## Testing Recommendations

1. **Test with different radii**: Try 50m, 100m, 500m
2. **Test location accuracy**: Check on different devices
3. **Test permission denial**: Ensure proper error handling
4. **Test without geofencing**: Verify backward compatibility
5. **Test on mobile**: GPS is more accurate on phones than laptops

## Troubleshooting

### "Location permission denied"
- Student needs to allow location access in browser settings
- On mobile, check device location services are enabled

### "Location information unavailable"
- GPS signal may be weak (common indoors)
- Try moving near a window or outdoors

### "Location request timed out"
- Network or GPS issues
- Refresh and try again

### Attendance marked despite being far away
- Check if lecture has geofencing enabled (latitude/longitude set)
- Verify radius is appropriate for the venue
- Check GPS accuracy on the device

## Future Enhancements (Optional)

1. **Map preview**: Show lecture location on a map when creating
2. **Historical tracking**: Store student locations with attendance (privacy concerns)
3. **Multiple zones**: Allow multiple valid locations for large campuses
4. **Time-based radius**: Smaller radius during lecture, larger before/after
5. **Indoor positioning**: Use WiFi/Bluetooth for better indoor accuracy

## Support

For issues or questions about the geofencing feature:
1. Check browser console for error messages
2. Verify database schema is updated
3. Ensure API endpoints return location data
4. Test location permissions are granted
