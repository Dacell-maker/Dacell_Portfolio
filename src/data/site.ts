import type { SiteStats, Skill, TimelineItem } from '@/types';

/**
 * Personal + contact information.
 * Everything here was carried over from the live portfolio at
 * https://my-portfolio-tqxt.vercel.app — nothing was invented.
 */
export const site = {
  name: 'Toviho Segun David',
  firstName: 'Segun',
  role: 'Software Developer',
  roleLong: 'Full-Stack Developer',
  location: 'Lagos, Nigeria',
  tagline: 'Building digital experiences that actually work.',
  availability: 'Available for new opportunities',
  email: 'davidsegun044@gmail.com',
  phone: '+234 916 934 0927',
  phoneHref: 'tel:+2349169340927',
  github: 'https://github.com/Dacell-maker',
  githubHandle: 'github.com/Dacell-maker',
  linkedin: 'https://www.linkedin.com/in/segun-toviho-07657627a',
  linkedinHandle: 'Segun Toviho',
  cvUrl: '/Toviho-Segun-David-CV.pdf',
  quote: "Good software doesn't just work — it solves a real problem for a real person.",
  quoteAttribution: 'how I approach every project',
  responseTime: 'I usually respond within 24 hours.',
  url: 'https://my-portfolio-tqxt.vercel.app',
} as const;

export const heroStack = ['React', 'TypeScript', 'Node.js', 'Python', 'Flask', 'MongoDB', 'JavaScript'] as const;

/** Infinite marquee under the hero. */
export const marqueeTech = [
  'HTML5',
  'CSS3',
  'JavaScript',
  'TypeScript',
  'React',
  'Tailwind CSS',
  'Framer Motion',
  'Node.js',
  'Express',
  'Python',
  'Flask',
  'C#',
  'MongoDB',
  'SQLite',
  'MySQL',
  'TensorFlow.js',
  'Git',
  'GitHub',
  'Render',
  'Vercel',
  'VS Code',
] as const;

export const skills: Skill[] = [
  { name: 'HTML5', group: 'Frontend' },
  { name: 'CSS3', group: 'Frontend' },
  { name: 'JavaScript', group: 'Frontend' },
  { name: 'TypeScript', group: 'Frontend' },
  { name: 'React', group: 'Frontend' },
  { name: 'Tailwind CSS', group: 'Frontend' },
  { name: 'Framer Motion', group: 'Frontend' },
  { name: 'Node.js', group: 'Backend' },
  { name: 'Express', group: 'Backend' },
  { name: 'Python', group: 'Backend' },
  { name: 'Flask', group: 'Backend' },
  { name: 'C#', group: 'Backend' },
  { name: 'REST APIs', group: 'Backend' },
  { name: 'MongoDB', group: 'Data' },
  { name: 'MongoDB Atlas', group: 'Data' },
  { name: 'SQLite', group: 'Data' },
  { name: 'MySQL', group: 'Data' },
  { name: 'TensorFlow.js', group: 'Data' },
  { name: 'Git', group: 'Tools' },
  { name: 'GitHub', group: 'Tools' },
  { name: 'Render', group: 'Tools' },
  { name: 'Vercel', group: 'Tools' },
  { name: 'VS Code', group: 'Tools' },
];

export const skillGroups: Skill['group'][] = ['Frontend', 'Backend', 'Data', 'Tools'];

export const aboutFocus = [
  'AI Applications',
  'Management Systems',
  'Web Applications',
  'E-commerce',
  'Desktop Applications',
  'REST APIs',
  'Database Systems',
] as const;

/**
 * Numbers shown in the About section. They are counted from real projects and
 * real technologies — adjust here whenever the portfolio grows.
 */
export const stats: SiteStats[] = [
  { label: 'Years Writing Code', value: 4, suffix: '+' },
  { label: 'Projects Built', value: 8, suffix: '+' },
  { label: 'Technologies', value: 20, suffix: '+' },
  { label: 'Shipped Applications', value: 4, suffix: '+' },
];

export const profile = {
  degree: 'B.Sc Computer Science (Final Year)',
  university: 'Lagos State University',
  focus: 'Full-Stack Development & AI',
  interests: 'Machine Learning · System Design · Automation',
  status: 'Open to work',
  paragraphs: [
    'I am a final-year Computer Science student at Lagos State University and a Software Developer with a strong interest in using technology to solve real-world problems. I work across the stack — from crafting clean, responsive frontends to designing reliable backends, APIs and database systems.',
    "As an AI enthusiast, I enjoy bringing machine learning into practical products — like an AI-powered course recommendation system that helps secondary school students choose the right university courses. I have also built management systems, payroll software, e-commerce platforms, streaming services and finance tools used in academic and real-world settings.",
    'Whether it is a web application, a desktop system or an intelligent API, my goal is always the same: deliver software that is useful, dependable and beautifully engineered.',
  ],
  currentlyLearning:
    'Machine learning model deployment, system design and cloud infrastructure — pushing my projects from "it works" to "it scales".',
} as const;

export const experience: TimelineItem[] = [
  {
    title: 'Software Developer',
    organisation: 'Independent · Academic & real-world projects',
    period: 'Current',
    points: [
      'AI systems — designed and deployed an ML-powered course recommendation platform for students',
      'Client & business websites — restaurant landing pages and e-commerce storefronts built with React and TypeScript',
      'Desktop applications — student records and payroll systems built with Python (Tkinter) and C# (WinForms)',
      'Management systems — attendance, results, payslip and feedback platforms used in real institutions',
      'REST APIs — Node.js/Express backends with MongoDB Atlas powering production web apps',
      'Database-driven applications — SQLite, MySQL and MongoDB data layers with clean schemas',
    ],
    tags: ['AI Systems', 'Web Apps', 'E-commerce', 'Desktop Apps', 'REST APIs', 'Databases'],
  },
  {
    title: 'SIWES Industrial Training',
    organisation: 'Student Information Management System',
    period: 'Completed',
    points: [
      'Developed a complete student information desktop application during my industrial attachment (SIWES)',
      'Handled student records, attendance tracking, grades and teacher accounts',
      'Gave the institution a reliable digital workflow replacing paper-based records',
    ],
    tags: ['Python', 'Tkinter', 'SQLite'],
  },
];

export const education: TimelineItem[] = [
  {
    title: 'B.Sc Computer Science',
    organisation: 'Lagos State University',
    period: 'Final Year',
    points: [
      'Strong foundation in software engineering, data structures, databases and machine learning',
      'Applying classroom knowledge by building and shipping real applications',
    ],
    tags: ['Software Engineering', 'Databases', 'Machine Learning', 'Data Structures', 'Web Development'],
  },
];

export const projectCategories = [
  'All',
  'AI & ML',
  'Web App',
  'E-commerce',
  'Restaurant',
  'Business System',
  'Desktop App',
] as const;

/**
 * Seed data lives in /shared/seed.ts so the API server can use exactly the same
 * list. Re-exported here for client-side fallback rendering.
 */
export { seedProjects } from '@shared/seed';
