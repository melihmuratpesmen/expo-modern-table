import type { Random } from '../random';

export const FIRST_NAMES = [
  'Olivia', 'Liam', 'Emma', 'Noah', 'Sofia', 'Mateo', 'Yuki', 'Hiro', 'Aisha', 'Omar',
  'Elif', 'Can', 'Lukas', 'Mia', 'Chloé', 'Hugo', 'Priya', 'Arjun', 'Camila', 'Diego',
  'Freya', 'Oscar', 'Mei', 'Jin', 'Ana', 'João', 'Zeynep', 'Emre', 'Lena', 'Max',
  'Isla', 'Leo', 'Amara', 'Kofi', 'Nora', 'Erik', 'Sara', 'Ivan', 'Hana', 'Ravi',
];

export const LAST_NAMES = [
  'Smith', 'Garcia', 'Müller', 'Martin', 'Tanaka', 'Kim', 'Silva', 'Rossi', 'Yılmaz', 'Kaya',
  'Novak', 'Johansson', 'Patel', 'Nguyen', 'Dubois', 'Fernández', 'Schmidt', 'Andersen',
  'Costa', 'Chen', 'Okafor', 'Ivanova', 'Sato', 'Haddad', 'Lopez', 'Brown', 'Wilson', 'Demir',
  'Larsen', 'Moreau',
];

export function randomName(random: Random) {
  return `${random.pick(FIRST_NAMES)} ${random.pick(LAST_NAMES)}`;
}

/** ASCII e-mail local part from a display name (Chloé Müller → chloe.muller). */
export function emailFor(name: string, domain: string) {
  const local = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '.');
  return `${local}@${domain}`;
}

export function initials(name: string) {
  const parts = name.split(' ');
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}
