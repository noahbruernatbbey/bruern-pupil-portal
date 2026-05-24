# 🎓 Student Portal - Bruern Abbey School

A highly accessible, dyslexia-friendly student portal with secure login and admin capabilities.

## ✨ Features

### 🔐 Secure Login System
- Simple, stress-free login interface
- Hardcoded admin credentials for demonstration
- Clear, gentle error messages
- Case-insensitive name validation

### 👨‍🎓 Student Dashboard
- Personalized welcome message with class information
- Quick access to daily schedule and essential tools
- Direct links to learning platforms and apps
- Clean, card-based layout with visual hierarchy

### ⚙️ Admin Panel
- Exclusive admin controls for authorized users
- Live announcement broadcasting system
- Quick links management interface
- Secure overlay design

### ♿ Accessibility Features
- **Dyslexia-Friendly Typography**: OpenDyslexic font with wide letter-spacing (0.08em) and word-spacing (0.16em)
- **High Line Height**: 1.8 for improved readability
- **Soft Background Colors**: Warm cream (#FFF8E7) instead of harsh white to reduce glare
- **High Contrast Text**: Dark gray/navy text instead of pure black
- **Large Interactive Elements**: Generous padding and spacing on all buttons and inputs
- **Strong Visual Borders**: 3-4px borders for clear element separation
- **Hover & Focus States**: Clear visual feedback with lift animations and bright outlines
- **Keyboard Navigation**: Full keyboard support with ESC key functionality
- **Screen Reader Support**: ARIA labels and live regions
- **Reduced Motion Support**: Respects user preferences for reduced motion
- **Responsive Design**: Optimized for tablets, iPads, and desktop monitors

## 🔑 Login Credentials

**Admin Account:**
- First Name: `noah`
- Last Name: `hill`
- Password: `Bruern801`

*(Names are case-insensitive, password is case-sensitive)*

## 🚀 Deployment to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Navigate to the project directory:
```bash
cd student-portal
```

3. Deploy to Vercel:
```bash
vercel
```

4. Follow the prompts to link your project and deploy

### Option 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository or drag and drop the `student-portal` folder
4. Vercel will automatically detect the configuration
5. Click "Deploy"

### Option 3: Using Git Integration

1. Push your code to GitHub, GitLab, or Bitbucket
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push to main branch

## 📁 Project Structure

```
student-portal/
├── index.html          # Main HTML structure
├── styles.css          # Dyslexia-friendly CSS styling
├── script.js           # Login and state management logic
├── vercel.json         # Vercel deployment configuration
└── README.md           # This file
```

## 🎨 Design Principles

### Color Palette
- **Primary Background**: `#FFF8E7` (Soft cream)
- **Secondary Background**: `#F5F0E1` (Light beige)
- **Primary Text**: `#2C3E50` (Dark slate)
- **Primary Accent**: `#3498DB` (Bright blue)
- **Success**: `#27AE60` (Green)
- **Warning**: `#F39C12` (Orange)
- **Danger**: `#E74C3C` (Red)
- **Admin**: `#9B59B6` (Purple)

### Typography
- **Font Family**: OpenDyslexic, Comic Sans MS, Arial (fallback)
- **Letter Spacing**: 0.08em
- **Word Spacing**: 0.16em
- **Line Height**: 1.8

## 🔗 Integrated Learning Platforms

### Daily Schedule & Essentials
- View Timetable
- Wednesday Activities
- Google Classroom

### Learning Apps & Tools
- myON Reading
- Typing.com
- Times Tables Rock Stars
- Nitro Type
- Kahoot
- Tassomai
- MyMaths
- Scratch Coding

## 🛠️ Technical Details

- **Framework**: Vanilla JavaScript (no dependencies)
- **Styling**: Pure CSS with CSS Variables
- **Hosting**: Vercel-ready static site
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Support**: Fully responsive design

## 📱 Responsive Breakpoints

- **Desktop**: > 768px
- **Tablet**: 481px - 768px
- **Mobile**: < 480px

## 🔒 Security Notes

This is a demonstration project with hardcoded credentials. For production use:
- Implement proper backend authentication
- Use environment variables for sensitive data
- Add HTTPS encryption
- Implement session management
- Add rate limiting for login attempts

## 🎯 Admin Features

When logged in as admin, you can:
1. Access the Admin Panel via the "⚙️ Admin Panel" button
2. Broadcast announcements to all portal users
3. Manage quick links (UI placeholder)
4. View admin-specific controls

## 📝 License

This project is created for Bruern Abbey School educational purposes.

## 👨‍💻 Development

To run locally:
1. Open `index.html` in a web browser
2. No build process or server required
3. All assets are self-contained

## 🌐 Browser Testing

Tested and optimized for:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📞 Support

For issues or questions about this portal, please contact the school IT department.

---

**Built with ❤️ for accessibility and inclusive education**
