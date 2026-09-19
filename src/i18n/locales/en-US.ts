import type { Dictionary } from "./pt-BR";

// Tipado como Dictionary: esquecer uma chave (ou sobrar uma) é erro de
// compilação, então os dois idiomas nunca saem de sincronia.
const enUS: Dictionary = {
  language: { label: "Language", "pt-BR": "Portuguese", "en-US": "English" },

  splash: {
    title: "Hello, welcome aboard",
    subtitle: "Choose how you want to explore:",
    immersive: {
      title: "Immersive Mode",
      description: "Interactive portfolio with 3D elements",
    },
    single: {
      title: "Single Page Mode",
      description: "Simple portfolio, straight to the point",
    },
  },

  nav: {
    menu: "Menu",
    close: "CLOSE",
    openMenu: "Open menu",
    tagline: "CARLOS MOISES - FULL STACK DEVELOPER",
    mode2D: "2D MODE",
    switchTo2D: "Switch to the 2D version",
    switchTo3D: "Switch to the 3D version",
    backToOrbit: "BACK TO ORBIT",
  },

  sections: {
    top: "Home",
    about: "About Me",
    experience: "Experience",
    projects: "Projects",
    contact: "Contact",
  },

  paths: {
    about: "~/about-me",
    experience: "~/experience",
    projects: "~/projects",
    contact: "~/contact",
    gallery: "~/gallery",
  },

  hero: {
    greeting: "Hi, I'm",
    description:
      "Full stack developer — from the database to the interface. I work with React, Next.js and Node.js day to day, plus Java with Spring Boot and a bit of infrastructure when the project calls for it.",
    viewProjects: "View projects",
    viewGithub: "View code on GitHub",
  },

  about: {
    bio: "I started working early in my family's traditional glass installation trade. It was there, in manual work, that I learned the non-negotiable value of precision, of care for the details and of commitment to the client's deadlines. Today I bring that same mindset to Software Engineering. My focus is on architecting solutions that solve real problems, such as the automated quote delivery system I built to modernize customer service. I strongly believe in code as a tool for collaboration, which motivated me to act as a Volunteer Mentor at Estácio college, guiding students and people from outside the institution with no prior experience through their first steps in web development.",
    downloadCv: "Download Résumé",
    softSkills: {
      problemSolving: "Problem Solving",
      communication: "Communication",
      results: "Results Oriented",
      leadership: "Leadership",
      teamwork: "Teamwork",
      proactivity: "Proactivity",
    },
  },

  experience: {
    ongoing: "in progress",
    kinds: {
      education: "Education",
      volunteer: "Volunteering",
      freelance: "Freelance",
    },
    items: {
      degree: {
        title: "Systems Analysis and Development",
        organization: "Estácio",
      },
      mentor: {
        title: "Volunteer Mentor (Front-end)",
        organization: "Estácio",
      },
      enfermex: {
        title: "Enfermex (Patient management system)",
        organization: "Freelancer",
      },
      quotes: {
        title: "Automated Quote Delivery System",
        organization: "Freelancer",
      },
    },
  },

  projects: {
    featured: "Featured",
    code: "Code",
    deploy: "Deploy",
    details: "Details",
    stack: "Stack",
    caseStudy: "View full case study",
    close: "Close",
    previewAlt: "Preview of the project {{title}}",
    back: "Back to projects",
    viewDeploy: "View deploy",
    sourceCode: "Source code",
    narrative: {
      problem: { key: "problem", title: "The Problem" },
      solution: { key: "solution", title: "The Solution" },
      challenges: { key: "challenges", title: "Technical Challenges" },
    },
    gallery: {
      title: "Inside the project",
      next: "Next image",
      previous: "Previous image",
      view: "View image {{index}}",
      alt: "{{title}} — image {{index}} of {{total}}",
    },
    liked: "Liked this project?",
    letsTalk: "Let's talk",
    otherProjects: "View other projects",
  },

  contact: {
    headingStart: "Let's build something",
    headingHighlight: "incredible",
    headingEnd: "together?",
    intro:
      "Send me a message through the form or reach out directly through one of the channels.",
    whatsapp: "Message me on WhatsApp",
    name: "Name",
    email: "E-mail",
    message: "Message",
    namePlaceholder: "What should I call you?",
    emailPlaceholder: "you@email.com",
    messagePlaceholder: "Tell me about the project, the role or the idea...",
    send: "Send message",
    sending: "Sending...",
    footer: "© 2026 Built by Carlos Moises",
    status: {
      success: "Message sent! I'll get back to you soon.",
      successMock: "Message sent! (mock mode: the messages table doesn't exist yet)",
      invalid: "Please review the highlighted fields.",
      generic:
        "Couldn't send right now. Try again in a moment or use one of the other channels.",
    },
    errors: {
      nameShort: "Please enter your name",
      nameLong: "Name is too long",
      emailInvalid: "Please enter a valid e-mail",
      emailLong: "E-mail is too long",
      messageShort: "Write at least 10 characters",
      messageLong: "Message is too long (max. 2000 characters)",
    },
  },
};

export default enUS;
