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
      "Full stack developer and Systems Analyst at Systelos — from the database to the interface. I work with React, Next.js and Node.js day to day, plus Java with Spring Boot and Docker when the project calls for it.",
    viewProjects: "View projects",
    viewGithub: "View code on GitHub",
  },

  about: {
    headline: "From glass to code.",
    bio: {
      origin:
        "Before I wrote my first line of code, I cut and installed glass. I spent my youth in my father's glass shop doing honest manual work: measuring, cutting, hauling sheets and fitting them on job sites. Glass has no Ctrl+Z — a wrong measurement is money lost on the spot. That's where I learned to measure twice, to keep my word on a deadline and to look the customer in the eye.",
      turn: "In March 2025 I started a degree in Systems Analysis and Development at Estácio, in Santo André, and I went all in: active in class, showing up at events and, soon enough, volunteering as a mentor for people taking their first steps. Theory alone wasn't going to cut it, so I built real software: Enfermex, a complete patient management system, and a tool that automates quote delivery for my father's glass shop. That attitude led my program coordinator to recommend me to a professor who was building a startup.",
      now: "Today I'm a Systems Analyst at Systelos, where I build the product and support the people who use it. Working support reminds me daily that behind every bug there's someone just trying to get their job done. I write JavaScript, TypeScript, React, Node, Java and Spring Boot, ship with Docker — and bring to every release the same care as someone who used to install glass in other people's homes.",
    },
    orbit: {
      origin: {
        label: "origin",
        text: "I started where there's no undo: cutting and installing glass at my father's shop.",
      },
      turn: {
        label: "ignition",
        text: "In 2025 I went back to school and refused to stay in theory: classes, events, mentoring and two real systems — one of them for my father's glass shop.",
      },
      now: {
        label: "current orbit",
        text: "A recommendation from my program coordinator led me to Systelos, where I now build software and stay close to the people who use it.",
      },
      closing: "The tools changed. The craft didn't.",
    },
    downloadCv: "Download Résumé",
    softSkills: {
      problemSolving: "Problem Solving",
      communication: "Communication",
      resilience: "Resilience",
      customerEmpathy: "Customer Empathy",
      attentionToDetail: "Attention to Detail",
      continuousLearning: "Continuous Learning",
      mentoring: "Mentoring",
      teamwork: "Teamwork",
      proactivity: "Proactivity",
    },
  },

  experience: {
    ongoing: "in progress",
    planned: "planned",
    blocks: {
      professional: "professional experience",
      academic: "education",
    },
    kinds: {
      work: "Work",
      project: "Own project",
      trade: "Trade",
      education: "Education",
      volunteer: "Volunteering",
    },
    items: {
      systelos: {
        period: "2026 — present",
        title: "Systems Analyst",
        organization: "Systelos",
        description:
          "Software development and hands-on customer support. I hear the problem from the person using the system, track down the cause and take the fix all the way to production.",
      },
      quotes: {
        period: "Jun 2026 — Jul 2026",
        title: "Automated Quote Delivery System",
        organization: "My father's glass shop",
        description:
          "Automates quote delivery and modernizes customer service at the glass shop where I first started working.",
      },
      enfermex: {
        period: "May 2026 — Jun 2026",
        title: "Enfermex",
        organization: "Patient management system",
        description:
          "End-to-end patient management in a single system, designed and built by me.",
      },
      glazier: {
        period: "Before code",
        title: "Glazier",
        organization: "My father's glass shop",
        description:
          "Manual labor: cutting, hauling and installing glass, dealing with customers face to face on job sites. No tech involved — just the right measurement, the deadline met and a clean finish.",
      },
      postgrad: {
        period: "After graduation",
        title: "Postgraduate degree in Software Engineering",
        organization: "Estácio",
        description: "The next step I plan to take as soon as I finish my degree.",
      },
      degree: {
        period: "Mar 2025 — Jun 2027",
        title: "Systems Analysis and Development",
        organization: "Estácio · Santo André",
        description:
          "Active in class and at program events, putting theory to work on real projects.",
      },
      mentor: {
        period: "2025",
        title: "Volunteer Mentor (Front-end)",
        organization: "Estácio",
        description:
          "First steps in web development with students and beginners from outside the college.",
      },
      production: {
        period: "Feb 2018 — Jul 2020 · withdrew",
        title: "Production Engineering",
        organization: "Anhanguera",
        description:
          "I studied for two and a half years before withdrawing. Years later, software development turned out to be the path that made sense.",
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
    play: "Play video",
    pause: "Pause video",
    device: {
      label: "Video version",
      desktop: "Desktop",
      mobile: "Mobile",
    },
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
