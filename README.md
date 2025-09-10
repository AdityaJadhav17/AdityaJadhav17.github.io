# Aditya Jadhav - Portfolio Website

A modern, responsive portfolio website built with React, featuring smooth scrolling navigation, dark mode toggle, and a comprehensive showcase of skills, projects, and certifications.

## 🚀 Features

- **Modern React Architecture**: Built with functional components and hooks
- **Responsive Design**: Fully responsive across all devices
- **Dark/Light Mode**: Toggle between themes
- **Smooth Scrolling**: Seamless navigation between sections
- **Contact Form**: Functional contact form with validation
- **Project Showcase**: Responsive grid layout for projects
- **Certifications Section**: Display professional certifications
- **Resume Integration**: View and download resume functionality
- **Mobile-First**: Optimized for mobile devices

## 📋 Sections

1. **Home**: Hero section with profile photo and introduction
2. **About**: Background, skills, and education
3. **Projects**: Portfolio of projects with links and descriptions
4. **Certifications**: Professional certifications and badges
5. **Resume**: Download and view resume functionality
6. **Contact**: Contact form and information
7. **Footer**: Social links and navigation

## 🛠️ Technologies Used

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **CSS3**: Custom styling with CSS variables
- **JavaScript ES6+**: Modern JavaScript features
- **Responsive Design**: Mobile-first approach

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio-react
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Projects.jsx
│   ├── Certifications.jsx
│   ├── Resume.jsx
│   ├── Contact.jsx
│   ├── Footer.jsx
│   └── *.css (component styles)
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## 🎨 Customization

### Personal Information
Update the following files with your information:
- `src/components/Home.jsx` - Name, title, and description
- `src/components/About.jsx` - Background and skills
- `src/components/Projects.jsx` - Your projects
- `src/components/Certifications.jsx` - Your certifications
- `src/components/Contact.jsx` - Contact details
- `src/components/Footer.jsx` - Social links

### Styling
- Colors: Update CSS variables in `src/App.css`
- Layout: Modify component CSS files
- Dark mode: Customize dark mode variables

### Images and Assets
- Replace placeholder images in components
- Add your profile photo in the Home component
- Add project screenshots in the Projects component
- Add certification badges in the Certifications component

## 📱 Responsive Design

The portfolio is fully responsive with breakpoints:
- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px

## 🌙 Dark Mode

The portfolio includes a dark/light mode toggle with:
- Automatic theme switching
- Persistent theme preference
- Smooth transitions between themes

## 📧 Contact Form

The contact form includes:
- Form validation
- Success message display
- Responsive design
- Accessibility features

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Contact

- **Name**: Aditya Jadhav
- **Email**: aditya.jadhav@example.com
- **GitHub**: [Your GitHub Profile]
- **LinkedIn**: [Your LinkedIn Profile]

---

Built with React and Vite
