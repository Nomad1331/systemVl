import { storage } from "./storage";

/**
 * Get the current date string in the user's configured timezone
 * Format: YYYY-MM-DD
 */
export const getTodayString = (): string => {
  const settings = storage.getSettings();
  const now = new Date();
  
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: settings.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
};

/**
 * Get a Date object representing the user's current time in their timezone
 */
export const getUserDate = (): Date => {
  return new Date();
};

/**
 * Format a date string to the user's timezone
 */
export const formatDateInUserTimezone = (date: Date): string => {
  const settings = storage.getSettings();
  
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: settings.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};
