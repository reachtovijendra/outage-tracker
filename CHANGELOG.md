# Changelog

All notable changes to the Outage Tracker project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project setup with Angular 19 and PrimeNG 19
- Firebase Firestore integration for data persistence
- Category management (add, edit, delete categories)
- Application management (add, edit, delete applications within categories)
- Monthly outage tracking grid with day columns
- Outage status tracking: None, Partial (yellow), Full (red)
- Click to toggle outage status
- Ctrl+Click to open outage details dialog with notes
- Right-click context menu for quick status changes
- Month tab navigation for switching between months
- Year display and navigation
- Dark mode theme by default
- Responsive design for various screen sizes
- Empty state with call-to-action for new users
- Legend showing outage status colors
- Toast notifications for user feedback
- Confirmation dialogs for delete operations
- Setup documentation for GitHub, Firebase, and Vercel deployment

### Technical

- Standalone Angular components architecture
- Signal-based state management
- Lazy-loaded routes
- PrimeNG Aura theme with dark mode customization
- IBM Plex Sans typography
- Custom scrollbar styling
- SCSS styling with CSS custom properties

