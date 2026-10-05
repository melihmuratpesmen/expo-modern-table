import { createRandom } from '../random';
import { COUNTRIES } from './countries';
import { emailFor, FIRST_NAMES, LAST_NAMES } from './people';

export const DEPARTMENTS = ['engineering', 'design', 'product', 'marketing', 'sales', 'support'] as const;
export type Department = (typeof DEPARTMENTS)[number];
export const MEMBER_STATUSES = ['active', 'onLeave', 'new'] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];
export const LEVELS = ['lead', 'senior', 'mid', 'junior', 'intern'] as const;
export type Level = (typeof LEVELS)[number];

export interface Member {
  id: string;
  name: string;
  email: string;
  department: Department;
  level: Level;
  city: string;
  country: string;
  status: MemberStatus;
  salary: number;
  startDate: number;
  performance: number;
  remote: boolean;
  skills: string[];
}

const CITIES: Record<string, string[]> = {
  US: ['New York', 'Austin', 'San Francisco'],
  GB: ['London', 'Manchester'],
  DE: ['Berlin', 'Munich'],
  FR: ['Paris', 'Lyon'],
  JP: ['Tokyo', 'Osaka'],
  BR: ['São Paulo'],
  IN: ['Bengaluru', 'Pune'],
  CA: ['Toronto', 'Vancouver'],
  AU: ['Sydney', 'Melbourne'],
  TR: ['İstanbul', 'İzmir', 'Ankara'],
  ES: ['Madrid', 'Barcelona'],
  NL: ['Amsterdam'],
  KR: ['Seoul'],
  MX: ['Mexico City'],
  SE: ['Stockholm'],
};

const SKILLS: Record<Department, string[]> = {
  engineering: ['TypeScript', 'React Native', 'Go', 'PostgreSQL', 'Kubernetes', 'GraphQL', 'Swift', 'Kotlin'],
  design: ['Figma', 'Prototyping', 'Design systems', 'Motion', 'User research', 'Illustration'],
  product: ['Roadmapping', 'Analytics', 'Discovery', 'SQL', 'A/B testing', 'Pricing'],
  marketing: ['SEO', 'Content', 'Lifecycle', 'Paid social', 'Brand', 'Copywriting'],
  sales: ['Enterprise', 'Negotiation', 'CRM', 'Partnerships', 'Forecasting'],
  support: ['Zendesk', 'Onboarding', 'Documentation', 'Escalations', 'Community'],
};

const BASE_SALARY: Record<Level, number> = {
  lead: 142_000,
  senior: 118_000,
  mid: 92_000,
  junior: 68_000,
  intern: 38_000,
};

const DEPARTMENT_FACTOR: Record<Department, number> = {
  engineering: 1.12,
  design: 1,
  product: 1.08,
  marketing: 0.94,
  sales: 0.98,
  support: 0.82,
};

const SIZES: Record<Department, number> = {
  engineering: 14,
  design: 6,
  product: 5,
  marketing: 6,
  sales: 7,
  support: 6,
};

export function generateTeam(): Member[] {
  const random = createRandom(42);
  const members: Member[] = [];
  const usedNames = new Set<string>();
  let n = 0;
  for (const department of DEPARTMENTS) {
    for (let i = 0; i < SIZES[department]; i++) {
      let name = '';
      do name = `${random.pick(FIRST_NAMES)} ${random.pick(LAST_NAMES)}`;
      while (usedNames.has(name));
      usedNames.add(name);

      const level: Level =
        i === 0 ? 'lead' : random.weighted({ senior: 3, mid: 4, junior: 2, intern: 0.6 });
      const country = random.pick(COUNTRIES).code;
      const yearsAgo = random.next() * (level === 'lead' ? 8 : level === 'intern' ? 0.6 : 5);
      const status: MemberStatus =
        yearsAgo < 0.25 ? 'new' : random.next() < 0.08 ? 'onLeave' : 'active';
      const pool = SKILLS[department];
      const skills = [...pool].sort(() => random.next() - 0.5).slice(0, random.int(2, 4));

      members.push({
        id: `m${++n}`,
        name,
        email: emailFor(name, 'acme.co'),
        department,
        level,
        city: random.pick(CITIES[country]),
        country,
        status,
        salary:
          Math.round((BASE_SALARY[level] * DEPARTMENT_FACTOR[department] * (0.9 + random.next() * 0.2)) / 500) * 500,
        startDate: Date.UTC(2026, 9, 5) - Math.round(yearsAgo * 365 * 86_400_000),
        performance: Math.round(62 + random.next() * 37),
        remote: random.next() < 0.45,
        skills,
      });
    }
  }
  return members;
}
