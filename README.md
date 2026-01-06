# Outage Tracker

A modern web application for tracking application outages and downtime across your systems. Built with Angular 19 and PrimeNG, using Firebase Firestore for data persistence.

## Features

- **Category Management**: Organize applications into categories (e.g., Servicing Core, Communications, Customer Facing)
- **Application Tracking**: Add and manage applications within each category
- **Monthly Outage Grid**: Visual grid showing outage status for each day of the month
- **Outage Status Levels**:
  - No Outage (clear)
  - Partial Outage (yellow)
  - Full Outage (red)
- **Quick Actions**:
  - Click to toggle outage status
  - Ctrl+Click to edit details with notes
  - Right-click context menu for quick changes
- **Month Navigation**: Tab-based navigation between months
- **Dark Mode**: Modern dark theme by default
- **Real-time Updates**: Firebase integration for live data sync

## Tech Stack

- **Frontend**: Angular 19 with standalone components
- **UI Library**: PrimeNG 19 with Aura theme
- **Database**: Firebase Firestore
- **Styling**: SCSS with CSS custom properties
- **State Management**: Angular Signals
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- Vercel account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/outage-tracker.git
cd outage-tracker

# Install dependencies
npm install

# Copy environment example file
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts

# Update environment files with your Firebase config
# Then start development server
npm start
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Copy your Firebase config to the environment files
4. Configure Firestore security rules (see `documentation/SETUP_GUIDE.md`)

## Documentation

- [Setup Guide](documentation/SETUP_GUIDE.md) - Complete setup instructions for Firebase, GitHub, and Vercel
- [Changelog](CHANGELOG.md) - Version history and changes

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/         # Data models and interfaces
│   │   └── services/       # Firebase and business logic services
│   ├── features/
│   │   └── outage-tracker/ # Main outage tracking feature
│   └── shared/             # Shared components and utilities
├── environments/           # Environment configuration
└── styles.scss             # Global styles
```

## Data Model

### Categories
Groups of related applications (e.g., "Servicing Core", "Communications")

### Applications
Individual systems within categories (e.g., "Spectrum", "SpeedPay")

### Outages
Records of outage events with:
- Application reference
- Date (year, month, day)
- Status (partial/full)
- Optional notes

## Development

```bash
# Development server
npm start

# Production build
npm run build

# Run tests
npm test
```

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

See `documentation/SETUP_GUIDE.md` for detailed deployment instructions.

## Future Enhancements

- User authentication
- Role-based access control
- Export/import data
- Reporting and analytics
- Email notifications
- API integrations
- Multi-year view
- Drag-and-drop reordering

## License

MIT License
