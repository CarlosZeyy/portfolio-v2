const ptBR = {
  language: { label: "Idioma", "pt-BR": "Português", "en-US": "Inglês" },

  splash: {
    title: "Olá, seja bem-vindo",
    subtitle: "Escolha como quer explorar:",
    immersive: {
      title: "Modo Imersivo",
      description: "Portfólio interativo com elementos 3D",
    },
    single: {
      title: "Modo Página Única",
      description: "Portfólio simples, direto ao ponto",
    },
  },

  nav: {
    menu: "Menu",
    close: "FECHAR",
    openMenu: "Abrir menu",
    tagline: "CARLOS MOISES - DESENVOLVEDOR FULL STACK",
    mode2D: "MODO 2D",
    switchTo2D: "Mudar para versão 2D",
    switchTo3D: "Mudar para versão 3D",
    backToOrbit: "VOLTAR À ÓRBITA",
  },

  sections: {
    top: "Início",
    about: "Sobre Mim",
    experience: "Experiência",
    projects: "Projetos",
    contact: "Contato",
  },

  paths: {
    about: "~/sobre-mim",
    experience: "~/experiencia",
    projects: "~/projetos",
    contact: "~/contato",
    gallery: "~/galeria",
  },

  hero: {
    greeting: "Olá, sou o",
    description:
      "Desenvolvedor full stack — do banco de dados à interface. Trabalho com React, Next.js e Node.js no dia a dia, além de Java com Spring Boot e um pouco de infraestrutura quando o projeto pede.",
    viewProjects: "Ver projetos",
    viewGithub: "Ver código no GitHub",
  },

  about: {
    bio: "Comecei a trabalhar cedo no ofício tradicional de instalação de vidros com a minha família. Foi ali, no trabalho manual, que aprendi o valor inegociável da precisão, do capricho com os detalhes e do compromisso com os prazos do cliente. Hoje, aplico essa mesma mentalidade na Engenharia de Software. O meu foco é arquitetar soluções que resolvam problemas reais, como o sistema automatizado de envio de orçamentos que desenvolvi para modernizar o atendimento. Acredito fortemente no código como ferramenta de colaboração, o que me motivou a atuar como Mentor Voluntário na faculdade Estácio, guiando alunos e pessoas de fora da instituição iniciantes sem experiência nos seus primeiros passos no desenvolvimento web.",
    downloadCv: "Baixar Currículo",
    softSkills: {
      problemSolving: "Resolução de Problemas",
      communication: "Comunicação",
      results: "Orientação a Resultados",
      leadership: "Liderança",
      teamwork: "Trabalho em Equipe",
      proactivity: "Proatividade",
    },
  },

  experience: {
    ongoing: "em andamento",
    kinds: {
      education: "Formação",
      volunteer: "Voluntariado",
      freelance: "Freelance",
    },
    items: {
      degree: {
        title: "Análise e Desenvolvimento de Sistemas",
        organization: "Estácio",
      },
      mentor: {
        title: "Mentor Voluntário (Front-end)",
        organization: "Estácio",
      },
      enfermex: {
        title: "Enfermex (Sistema de gestão de pacientes)",
        organization: "Freelancer",
      },
      quotes: {
        title: "Sistema de Envio de Orçamentos Automatizado",
        organization: "Freelancer",
      },
    },
  },

  projects: {
    featured: "Destaque",
    code: "Código",
    deploy: "Deploy",
    details: "Detalhes",
    stack: "Stack",
    caseStudy: "Ver case study completo",
    close: "Fechar",
    previewAlt: "Preview do projeto {{title}}",
    back: "Voltar aos projetos",
    viewDeploy: "Ver deploy",
    sourceCode: "Código-fonte",
    play: "Reproduzir vídeo",
    pause: "Pausar vídeo",
    device: {
      label: "Versão do vídeo",
      desktop: "Desktop",
      mobile: "Mobile",
    },
    narrative: {
      problem: { key: "problema", title: "O Problema" },
      solution: { key: "solução", title: "A Solução" },
      challenges: { key: "desafios", title: "Desafios Técnicos" },
    },
    gallery: {
      title: "Por dentro do projeto",
      next: "Próxima imagem",
      previous: "Imagem anterior",
      view: "Ver imagem {{index}}",
      alt: "{{title}} — imagem {{index}} de {{total}}",
    },
    liked: "Gostou deste projeto?",
    letsTalk: "Vamos conversar",
    otherProjects: "Ver outros projetos",
  },

  contact: {
    headingStart: "Vamos construir algo",
    headingHighlight: "incrível",
    headingEnd: "juntos?",
    intro:
      "Mande uma mensagem pelo formulário ou fale comigo direto por um dos canais.",
    whatsapp: "Chamar no WhatsApp",
    name: "Nome",
    email: "E-mail",
    message: "Mensagem",
    namePlaceholder: "Como posso te chamar?",
    emailPlaceholder: "voce@email.com",
    messagePlaceholder: "Conte sobre o projeto, a vaga ou a ideia...",
    send: "Enviar mensagem",
    sending: "Enviando...",
    footer: "© 2026 Desenvolvido por Carlos Moises",
    status: {
      success: "Mensagem enviada! Respondo em breve.",
      successMock:
        "Mensagem enviada! (modo mock: tabela messages ainda não existe)",
      invalid: "Revise os campos destacados.",
      generic:
        "Não foi possível enviar agora. Tente de novo em instantes ou use um dos outros canais.",
    },
    errors: {
      nameShort: "Informe seu nome",
      nameLong: "Nome muito longo",
      emailInvalid: "Informe um e-mail válido",
      emailLong: "E-mail muito longo",
      messageShort: "Escreva pelo menos 10 caracteres",
      messageLong: "Mensagem muito longa (máx. 2000 caracteres)",
    },
  },
};

export default ptBR;
export type Dictionary = typeof ptBR;
