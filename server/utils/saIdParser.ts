/**
 * South African National ID Parser and Birthday Calculator
 *
 * Official South African ID format (13 digits):
 * YYMMDD GSSS C A Z
 * - YYMMDD: Date of birth
 * - GSSS: Gender (0000-4999: Female, 5000-9999: Male)
 * - C: Citizenship (0: SA citizen, 1: Permanent resident)
 * - A: Usually 8
 * - Z: Checksum digit
 */

export interface ParsedSaId {
  valid: boolean;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  gender: 'Female' | 'Male';
  isCitizen: boolean;
  formattedBirthDate: string;
  nextBirthdayDate: string;
  formattedNextBirthday: string;
  ageTurning: number;
  daysRemaining: number;
  isToday: boolean;
  isUpcoming: boolean; // within 30 days
  isMilestone: boolean; // e.g. 30, 40, 50, 60, 65 (retirement)
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function parseSouthAfricanId(
  idNumber?: string,
  referenceDate: Date = new Date('2026-09-19T12:00:00Z')
): ParsedSaId | null {
  if (!idNumber || typeof idNumber !== 'string') return null;

  const cleaned = idNumber.replace(/\s+/g, '');
  if (cleaned.length !== 13 || !/^\d{13}$/.test(cleaned)) {
    return null;
  }

  const yy = parseInt(cleaned.substring(0, 2), 10);
  const mm = parseInt(cleaned.substring(2, 4), 10);
  const dd = parseInt(cleaned.substring(4, 6), 10);

  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return null;
  }

  // Reference year (default 2026)
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  const currentDay = referenceDate.getDate();

  // Century estimation (e.g. 26 or less is 2000s, >26 is 1900s for adult clients)
  const century = yy <= (currentYear % 100) ? 2000 : 1900;
  const birthYear = century + yy;

  const genderCode = parseInt(cleaned.substring(6, 10), 10);
  const gender: 'Female' | 'Male' = genderCode >= 5000 ? 'Male' : 'Female';
  const isCitizen = cleaned.charAt(10) === '0';

  // Determine this year's birthday date
  let nextBdayYear = currentYear;
  // If birthday already passed by more than 5 days this year, look at next year
  const isPastThisYear =
    mm < currentMonth || (mm === currentMonth && dd < currentDay - 5);

  if (isPastThisYear) {
    nextBdayYear = currentYear + 1;
  }

  const ageTurning = nextBdayYear - birthYear;
  const milestoneAges = [21, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
  const isMilestone = milestoneAges.includes(ageTurning);

  // Calculate days remaining
  const targetBday = new Date(Date.UTC(nextBdayYear, mm - 1, dd));
  const refToday = new Date(Date.UTC(currentYear, currentMonth - 1, currentDay));
  const diffMs = targetBday.getTime() - refToday.getTime();
  const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const isToday = daysRemaining === 0;
  // Considered upcoming if within the next 35 days or celebrated in the last 2 days
  const isUpcoming = daysRemaining >= -2 && daysRemaining <= 35;

  const formattedMonth = MONTH_NAMES[mm - 1];
  const formattedNextBirthday = `${dd} ${formattedMonth}`;
  const formattedBirthDate = `${dd} ${formattedMonth} ${birthYear}`;

  return {
    valid: true,
    birthYear,
    birthMonth: mm,
    birthDay: dd,
    gender,
    isCitizen,
    formattedBirthDate,
    nextBirthdayDate: `${nextBdayYear}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`,
    formattedNextBirthday,
    ageTurning,
    daysRemaining,
    isToday,
    isUpcoming,
    isMilestone,
  };
}
