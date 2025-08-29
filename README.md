# Track Down - Health Journal Application

A comprehensive health tracking application with BMI calculator, journaling features, and more.

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- PHP (v7.4 or higher)
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

### Running the Application

#### Option 1: Run both servers simultaneously
```bash
npm run dev
```

This will start:
- React development server on `http://localhost:3000`
- PHP server on `http://localhost:8000`

#### Option 2: Run servers separately

**React Development Server:**
```bash
npm run dev:react
```
Access the React app at: `http://localhost:3000`

**PHP Server:**
```bash
npm run dev:php
```
Access the PHP website at: `http://localhost:8000`

### Application Structure

- `/website/` - React application (PWA)
- `/app/` - PHP application components
- `/website/src/` - React source code
- `/website/assets/` - Static assets (CSS, images)

### Features

- **BMI Calculator** - Access at `http://localhost:8000/app/bmi`
- **Journaling** - Access at `http://localhost:8000/app/journal`
- **Reviews** - Access at `http://localhost:8000/website/reviews.php`
- **Home Page** - Access at `http://localhost:8000/website/index.php`

### Development Notes

- The React app runs on port 3000 and serves the PWA components
- The PHP server runs on port 8000 and serves the main website
- All paths have been updated to work with localhost instead of web server paths
- The application uses Vite for React development and includes Tailwind CSS 