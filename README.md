# Smart Attendance System - Frontend

A modern React-based attendance management system with QR code scanning capabilities.

## Features

- 📱 Responsive design for mobile and desktop
- 🎯 Role-based dashboards (Teacher & Student)
- 📷 QR code scanning for attendance
- 📊 Real-time attendance tracking
- 📈 Attendance reports and analytics
- 🔔 Browser notifications for active lectures

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling (via CDN)
- **html5-qrcode** - QR code scanning
- **React Hooks** - State management

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Icons.jsx          # SVG icon components
│   ├── InputField.jsx     # Reusable form input
│   ├── Modal.jsx          # Modal component
│   └── Navbar.jsx         # Navigation bar
├── pages/
│   ├── AuthPages.jsx      # Login/Register pages
│   ├── LandingPage.jsx    # Home page
│   ├── StudentPages.jsx   # Student dashboard & features
│   └── TeacherPages.jsx   # Teacher dashboard & features
├── App.jsx                # Main app component
├── main.jsx              # React entry point
└── index.css             # Global styles
```

## Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:3001/api
```

For production, the API URL is automatically set to `/api`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run dev:network` - Start dev server accessible on network
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome/Edge (recommended for QR scanning)
- Firefox
- Safari
- Mobile browsers with camera access

## License

MIT
