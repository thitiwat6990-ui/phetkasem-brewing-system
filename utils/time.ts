/**
 * Calculates the current fermentation day based on the brew date (stored in UTC).
 * @param brewDateUtc - The ISO string representation of the brew date in UTC.
 * @returns The current day of fermentation (1-indexed).
 */
export function getFermentationDay(brewDateUtc: string): number {
  const brewDate = new Date(brewDateUtc);
  const now = new Date();
  
  // Calculate difference in milliseconds
  const diffTime = now.getTime() - brewDate.getTime();
  
  // Convert to days. If it's the exact same time, it's day 1.
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Determines the tank status based on the fermentation timeline rules.
 * Rules:
 * Day 1–14 → fermenting
 * Day 15–16 → cold_crash
 * Day 17+ → ready
 * 
 * @param brewDateUtc - The ISO string representation of the brew date in UTC.
 * @returns An object containing the numeric day and the semantic status.
 */
export function getTankStatus(brewDateUtc: string): { day: number; status: 'fermenting' | 'cold_crash' | 'ready' } {
  const day = getFermentationDay(brewDateUtc);
  
  if (day <= 14) {
    return { day, status: 'fermenting' };
  } else if (day <= 16) {
    return { day, status: 'cold_crash' };
  } else {
    return { day, status: 'ready' };
  }
}
