import {
  SiReact,
  SiTypescript,
  SiNodedotjs,
  SiNextdotjs,
  SiSpringboot,
  SiDocker,
  SiHtml5,
  SiCss,
  SiJavascript,
  SiVite,
  SiTailwindcss,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiVercel,
  SiRailway,
  SiHostinger,
  SiJira,
  SiInsomnia,
  SiPostman,
  SiGithubactions,
  SiJest,
  SiZod,
  SiExpress,
  SiPython,
  SiIntellijidea,
  SiGooglecloud,
  SiAngular,
  SiSqlite,
  SiBootstrap
} from "react-icons/si";
import { FaJava, FaLinux, FaGit, FaGithub, FaAws, FaSass } from "react-icons/fa6";
import { TbApi } from "react-icons/tb";
import { VscLayers, VscAzure, VscVscode } from "react-icons/vsc";
import { DiRedis, DiJenkins, DiNginx } from 'react-icons/di';
import { GrDocker } from "react-icons/gr";


// Tipamos como Record<string, React.ElementType> para o TypeScript saber que são componentes
export const stackIcons: Record<string, React.ElementType> = {
  // Front:
  "HTML": SiHtml5,
  "CSS": SiCss,
  "JavaScript": SiJavascript,
  "TypeScript": SiTypescript,
  "React": SiReact,
  "Next.js": SiNextdotjs,
  "Vite": SiVite,
  "Tailwind CSS": SiTailwindcss,
  "Angular": SiAngular,
  "Sass": FaSass,
  "Bootstrap": SiBootstrap,

  // Back:
  "Java": FaJava,
  "Spring Boot": SiSpringboot,
  "Node.js": SiNodedotjs,
  "API RESTful": TbApi,
  "Arquitetura MVC": VscLayers,
  "Zod": SiZod,
  "Express.js": SiExpress,
  "Python": SiPython,
  "Redis": DiRedis,

  // DevOps:
  "Docker": SiDocker,
  "Docker Compose": GrDocker,
  "GitHub Actions": SiGithubactions,

  // Cloud:
  "Azure": VscAzure,
  "Vercel": SiVercel,
  "Railway": SiRailway,
  "VPS Hostinger": SiHostinger,
  "AWS": FaAws,
  "GCP": SiGooglecloud,
  "Nginx": DiNginx,

  // Tests:
  "Jest": SiJest,
  "Jenkins": DiJenkins,

  // DB:
  "Postgre SQL": SiPostgresql,
  "MySQL": SiMysql,
  "MongoDB": SiMongodb,
  "SQLite": SiSqlite,

  // Tools
  "Linux": FaLinux,
  "Git": FaGit,
  "GitHub": FaGithub,
  "Jira": SiJira,
  "Insomnia": SiInsomnia,
  "Postman": SiPostman,
  "VS Code": VscVscode,
  "IntelliJ IDEA": SiIntellijidea,
};
