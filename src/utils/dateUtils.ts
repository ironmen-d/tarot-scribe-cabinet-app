
import { format, addDays, addHours, addMinutes, setHours, setMinutes, parseISO, isValid } from "date-fns";
import { ru } from "date-fns/locale";

export type Duration = {
  value: number;
  unit: "minutes" | "hours" | "days";
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd.MM.yyyy", { locale: ru });
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd.MM.yyyy HH:mm", { locale: ru });
};

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "HH:mm", { locale: ru });
};

export const formatMonthYear = (date: Date): string => {
  return format(date, "LLLL yyyy", { locale: ru });
};

export const formatDayOfWeek = (date: Date): string => {
  return format(date, "EEEE", { locale: ru });
};

export const calculateDeadline = (startDate: Date, duration: Duration): Date => {
  let deadline = new Date(startDate);
  
  switch (duration.unit) {
    case "minutes":
      deadline = addMinutes(deadline, duration.value);
      break;
    case "hours":
      deadline = addHours(deadline, duration.value);
      break;
    case "days":
      deadline = addDays(deadline, duration.value);
      // Set time to 19:00 for day-based durations
      deadline = setHours(deadline, 19);
      deadline = setMinutes(deadline, 0);
      break;
  }
  
  return deadline;
};

export const parseRussianDate = (dateStr: string): Date | null => {
  // Try standard format first (DD.MM.YYYY)
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    const date = new Date(
      parseInt(parts[2]),
      parseInt(parts[1]) - 1,
      parseInt(parts[0])
    );
    if (isValid(date)) return date;
  }
  
  // Try to parse date without delimiters (DDMMYYYY)
  if (dateStr.length === 8 && /^\d+$/.test(dateStr)) {
    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = dateStr.substring(4, 8);
    
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    
    if (isValid(date)) return date;
  }
  
  return null;
};

export const extractNameAndBirthdate = (text: string): { name: string | null; birthdate: Date | null } => {
  // Simple name extraction (first word that's not a male name or reference)
  const maleTerms = ["мужчина", "парень", "сын", "папа", "муж", "отец"];
  const words = text.split(/\s+/);
  let name: string | null = null;
  
  for (const word of words) {
    if (word.length > 2 && !maleTerms.includes(word.toLowerCase()) && /^[А-Яа-я]+$/.test(word)) {
      name = word;
      break;
    }
  }
  
  // Look for birthdates in text (with or without dots)
  let birthdate: Date | null = null;
  
  // With dots (e.g., 25.03.1990)
  const datePattern = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/;
  const dateMatch = text.match(datePattern);
  
  if (dateMatch) {
    const [_, day, month, year] = dateMatch;
    birthdate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isValid(birthdate)) birthdate = null;
  } else {
    // Without dots (e.g., 25031990)
    const noDotsPattern = /\b(\d{8})\b/;
    const noDotsMatch = text.match(noDotsPattern);
    
    if (noDotsMatch) {
      const dateStr = noDotsMatch[1];
      birthdate = parseRussianDate(dateStr);
    }
  }
  
  return { name, birthdate };
};
