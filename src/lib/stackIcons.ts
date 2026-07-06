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
  SiBootstrap,
  SiSupabase,
  SiNestjs,
  SiCursor,
  SiClaude,
  SiGithubcopilot,
  SiGooglegemini
} from "react-icons/si";
import { FaJava, FaLinux, FaGit, FaGithub, FaAws, FaSass } from "react-icons/fa6";
import { TbApi } from "react-icons/tb";
import { VscLayers, VscAzure, VscVscode, VscOpenai } from "react-icons/vsc";
import { DiRedis, DiJenkins, DiNginx } from 'react-icons/di';
import { GrDocker } from "react-icons/gr";
import { Icon } from "./icons";

export const stackIcons: Record<string, Icon> = {
  // Front:
  "CSS": {icon: SiCss, bg: `#1572B666`},
  "HTML": {icon: SiHtml5, bg: `#E34F2666`}, 
  "JavaScript": {icon: SiJavascript, bg: `#F7DF1E66`},
  "TypeScript": {icon: SiTypescript, bg: `#3178C666`},
  "React": {icon: SiReact, bg: `#61DAFB66`},
  "Next.js":  {icon: SiNextdotjs, bg: `#ffffff66`},
  "Vite":  {icon: SiVite, bg: `#9135FF66`},
  "Tailwind CSS":  {icon: SiTailwindcss, bg: `#06B6D466`},
  "Angular":  {icon: SiAngular, bg: `#DD003166`},
  "Sass":  {icon: FaSass, bg: `#CC669966`},
  "Bootstrap":  {icon: SiBootstrap, bg: `#7952B366`},

  // Back:
  "Java":  {icon: FaJava, bg: `#ED8B0066`},
  "Spring Boot":  {icon: SiSpringboot, bg: `#6DB33F66`},
  "Node.js": {icon: SiNodedotjs, bg: `#33993366`},
  "Nestjs": {icon: SiNestjs, bg: `#E0234E66`},
  "API RESTful":  {icon: TbApi, bg: `#00968866`},
  "Arquitetura MVC":  {icon: VscLayers, bg: `#8B5CF666`},
  "Zod":  {icon: SiZod, bg: `#3E67B166`},
  "Express.js":  {icon: SiExpress, bg: `#0A0A0A66`},
  "Python":  {icon: SiPython, bg: `#3776AB66`},
  "Redis":  {icon: DiRedis, bg: `#DC382D66`},

  // DevOps:
  "Docker":  {icon: SiDocker, bg: `#2496ED66`},
  "Docker Compose":  {icon: GrDocker, bg: `#2496ED66`},
  "GitHub Actions":  {icon: SiGithubactions, bg: `#2088FF66`},

  // Cloud:
  "Azure":  {icon: VscAzure, bg: `#0089D666`},
  "Vercel":  {icon: SiVercel, bg: `#0A0A0A66`},
  "Railway":  {icon: SiRailway, bg: `#0B0D0E66`},
  "VPS Hostinger":  {icon: SiHostinger, bg: `#673DE666`},
  "AWS":  {icon: FaAws, bg: `#FF990066`},
  "GCP":  {icon: SiGooglecloud, bg: `#4285F466`},
  "Nginx":  {icon: DiNginx, bg: `#00963966`},

  // Tests:
  "Jest":  {icon: SiJest, bg: `#C2132566`},
  "Jenkins":  {icon: DiJenkins, bg: `#D2493966`},

  // DB:
  "Postgre SQL":  {icon: SiPostgresql, bg: `#4169E166`},
  "MySQL":  {icon: SiMysql, bg: `#4479A166`},
  "MongoDB":  {icon: SiMongodb, bg: `#47A24866`},
  "SQLite":  {icon: SiSqlite, bg: `#003B5766`},
  "Supabase": {icon: SiSupabase, bg: `#3FCF8E66`},

  // Tools
  "Linux":  {icon: FaLinux, bg: `#FCC62466`},
  "Git":  {icon: FaGit, bg: `#F03C2E66`},
  "GitHub":  {icon: FaGithub, bg: `#18171766`},
  "Jira":  {icon: SiJira, bg: `#0052CC66`},
  "Insomnia":  {icon: SiInsomnia, bg: `#4000BF66`},
  "Postman":  {icon: SiPostman, bg: `#FF6C3766`},
  "VS Code":  {icon: VscVscode, bg: `#2F80ED66`},
  "IntelliJ IDEA":  {icon: SiIntellijidea, bg: `#00000066`},
  "Cursor": {icon: SiCursor, bg: `#00000066`},

  // AI
  "Claude": {icon: SiClaude, bg: `#D9775766`},
  "Copilot": {icon: SiGithubcopilot, bg: `#ffffff66`},
  "Gemini": {icon: SiGooglegemini, bg: `#8E75B266`},
  "Codex": {icon: VscOpenai, bg: `#10A37F66`},
};
