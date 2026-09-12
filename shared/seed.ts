import type { Project } from './types';

/**
 * Seed data.
 *
 * This is written into MongoDB the first time the admin runs "Seed projects"
 * (POST /api/admin/seed), and it is also the read-only fallback used by the
 * public site when the database is not configured yet.
 *
 * NOTE: every project below has `image: null`. Real screenshots are uploaded
 * from /admin — this file will never contain generated artwork.
 */
export const seedProjects: Project[] = [
  {
    _id: 'seed-davicell',
    name: 'DAVICELL',
    category: 'Restaurant',
    shortDescription:
      'A premium restaurant landing page designed around a cinematic dining experience, with immersive visuals, responsive layouts and advanced motion interactions.',
    fullDescription:
      'DAVICELL is a single-page restaurant experience built for atmosphere first. The page opens with a full-bleed cinematic hero, moves through the menu, the story of the kitchen and reservation calls-to-action, and keeps every section tied together with scroll-driven motion so the page reads like a sequence rather than a stack of blocks. It is fully responsive, fast on mobile networks, and structured so the menu and gallery content can be updated without touching the layout.',
    image: null,
    imageAlt: 'DAVICELL restaurant website preview',
    liveUrl: 'https://davicell-restaurant.vercel.app/',
    githubUrl: null,
    technologies: ['React', 'TypeScript', 'Framer Motion', 'CSS', 'Vite'],
    status: 'published',
    featured: true,
    year: '2026',
    displayOrder: 1,
  },
  {
    _id: 'seed-fluffy',
    name: "Fluffy'n'Yummy Mall",
    category: 'E-commerce',
    shortDescription:
      "An e-commerce platform built collaboratively with a friend for a home, kitchen and gifting business — product browsing, categories, online payments, bank transfer, WhatsApp ordering and physical-store discovery.",
    fullDescription:
      "Fluffy'n'Yummy Mall is a production storefront for a home, kitchen and gifting business. Customers can browse products by category, view full product details, and check out through online payment or bank transfer. Because a large share of the business happens over chat, the store also supports direct WhatsApp ordering, and a dedicated page tells customers about delivery options and how to find the physical store. I worked on this with a friend — splitting the build between the storefront experience and the supporting systems.",
    image: null,
    imageAlt: "Fluffy'n'Yummy Mall e-commerce website preview",
    liveUrl: 'https://fluffynyummystore.com/',
    githubUrl: null,
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Vercel'],
    status: 'published',
    featured: true,
    year: '2026',
    displayOrder: 2,
  },
  {
    _id: 'seed-ai-course',
    name: 'AI Course Recommendation System',
    category: 'AI & ML',
    shortDescription:
      "An AI-powered web application that recommends university courses for secondary school students based on O'Level subjects, grades, interests and career goals using Machine Learning.",
    fullDescription:
      'Students enter their O\'Level subjects and grades, interests and career goals, and the system ranks the university courses they are genuinely eligible for. The recommendation logic runs on a machine-learning model trained on course admission requirements, served through a Node.js/Express REST API with MongoDB Atlas as the data layer, and consumed by a React frontend deployed on Render.',
    image: null,
    imageAlt: 'AI Course Recommendation System preview',
    liveUrl: 'https://ai-course-recommendation-api.onrender.com/',
    githubUrl: 'https://github.com/Dacell-maker/ai-course-recommendation-system',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB Atlas', 'TensorFlow.js', 'Render'],
    status: 'published',
    featured: true,
    year: '2025',
    displayOrder: 3,
  },
  {
    _id: 'seed-music',
    name: 'Music Streaming Website',
    category: 'Web App',
    shortDescription:
      'A Flask-based music streaming platform where users can upload and stream music through an interactive web interface.',
    image: null,
    imageAlt: 'Music Streaming Website preview',
    liveUrl: 'https://music-connect-weon.onrender.com/',
    githubUrl: 'https://github.com/Dacell-maker/Music-connect',
    technologies: ['Python', 'Flask', 'SQLite', 'HTML', 'CSS'],
    status: 'published',
    featured: false,
    year: '2024',
    displayOrder: 4,
  },
  {
    _id: 'seed-student-info',
    name: 'Student Information Management System',
    category: 'Desktop App',
    shortDescription:
      'A desktop application developed during SIWES for managing student records, attendance, grades and teacher accounts.',
    image: null,
    imageAlt: 'Student Information Management System preview',
    liveUrl: null,
    githubUrl: 'https://github.com/Dacell-maker/student-information-management-system',
    technologies: ['Python', 'Tkinter', 'SQLite'],
    status: 'published',
    featured: false,
    year: '2024',
    displayOrder: 5,
  },
  {
    _id: 'seed-payslip',
    name: 'Staff Payslip Management System',
    category: 'Business System',
    shortDescription:
      'A desktop payroll application developed with C# for generating staff salary slips and managing payroll records.',
    image: null,
    imageAlt: 'Staff Payslip Management System preview',
    liveUrl: null,
    githubUrl: 'https://github.com/Dacell-maker/staff-payslip-management-system',
    technologies: ['C#', 'Windows Forms'],
    status: 'published',
    featured: false,
    year: '2024',
    displayOrder: 6,
  },
  {
    _id: 'seed-expense',
    name: 'Expense Tracker',
    category: 'Web App',
    shortDescription:
      'A personal finance management application that allows users to monitor income, expenses and spending history.',
    image: null,
    imageAlt: 'Expense Tracker preview',
    liveUrl: null,
    githubUrl: 'https://github.com/Dacell-maker/expense-tracker-app',
    technologies: ['Flask', 'SQLite', 'HTML', 'CSS'],
    status: 'published',
    featured: false,
    year: '2023',
    displayOrder: 7,
  },
  {
    _id: 'seed-feedback',
    name: 'Feedback System',
    category: 'Web App',
    shortDescription: 'A web-based feedback management platform developed for collecting and managing user feedback.',
    image: null,
    imageAlt: 'Feedback System preview',
    liveUrl: null,
    githubUrl: 'https://github.com/Dacell-maker/feedback-management-system',
    technologies: ['PHP', 'MySQL', 'Bootstrap'],
    status: 'published',
    featured: false,
    year: '2023',
    displayOrder: 8,
  },
];
