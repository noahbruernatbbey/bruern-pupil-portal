# Student Portal - Bruern Abbey School

A dyslexia-friendly student portal for quick access to school tools and announcements.

## Features

### Portal
- Opens directly with no login screen.
- Has no account settings or admin panel.
- Quick links to timetable, activities, Google Classroom, Google Docs, Google Slides, and learning apps.
- Announcement banner for school-wide updates.

### Accessibility
- Dyslexia-friendly font stack.
- High line height and generous spacing.
- Clear focus and hover states.
- Responsive layout for desktop, tablet, and mobile.

## Deployment to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Navigate to the project directory:

```bash
cd student-portal
```

3. Deploy:

```bash
vercel
```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com).
2. Click "Add New Project".
3. Import the repository or upload the `student-portal` folder.
4. Deploy the project.

## Project Structure

```text
student-portal/
├── api/              # Vercel API routes
├── assets/           # Fonts and images
├── index.html        # Main HTML structure
├── script.js         # Portal logic
├── style.css         # Main styling
├── vercel.json       # Vercel deployment config
└── README.md
```

## Security Notes

The portal currently has no login screen, account settings, or admin panel. Do not store private student data unless a school-approved authentication system is added first.

## Local Development

Run with Vercel dev:

```bash
vercel dev
```
