/**
 * Formats a 24-hour time string (e.g., "09:00", "13:30", "00:15") or an already-formatted
 * 12-hour string into clean Standard 12-Hour Time (e.g., "9:00 AM", "1:30 PM", "12:15 AM").
 */
export function formatStandardTime(timeStr?: string | null): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (!trimmed) return '';

  // Already contains AM / PM
  const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/);
  if (amPmMatch) {
    const rawHour = parseInt(amPmMatch[1], 10);
    const mins = amPmMatch[2];
    const period = amPmMatch[3].toUpperCase();
    const hour12 = rawHour % 12 === 0 ? 12 : rawHour % 12;
    return `${hour12}:${mins} ${period}`;
  }

  // Standard 24-hour HH:MM or H:MM (optionally with :SS)
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hours24 = parseInt(match24[1], 10);
    const minutes = match24[2];
    if (!Number.isNaN(hours24) && hours24 >= 0 && hours24 <= 23) {
      const period = hours24 >= 12 ? 'PM' : 'AM';
      const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
      return `${hour12}:${minutes} ${period}`;
    }
  }

  return trimmed;
}

/**
 * Formats a start and end time range into Standard 12-Hour Time (e.g., "9:00 AM – 10:30 AM").
 */
export function formatTimeRange(
  startTime?: string | null,
  endTime?: string | null,
  separator = ' – '
): string {
  const start = formatStandardTime(startTime);
  const end = formatStandardTime(endTime);
  if (start && end) return `${start}${separator}${end}`;
  return start || end || '';
}

/**
 * Standard 30-minute interval options from 7:00 AM to 8:00 PM (with 24h internal value
 * for sorting/conflict math and 12h AM/PM display label so users never see military time).
 */
export const STANDARD_TIME_OPTIONS: { value: string; label: string }[] = (() => {
  const options: { value: string; label: string }[] = [];
  for (let h = 7; h <= 20; h++) {
    for (const m of [0, 30]) {
      if (h === 20 && m > 0) continue;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const value = `${hh}:${mm}`;
      options.push({
        value,
        label: formatStandardTime(value)
      });
    }
  }
  return options;
})();

/**
 * Ensures any custom or existing HH:MM value is present in the dropdown options list
 * while keeping chronological order and displaying a 12-hour AM/PM label.
 */
export function getStandardTimeOptionsWithCurrent(
  currentValue?: string
): { value: string; label: string }[] {
  if (!currentValue || STANDARD_TIME_OPTIONS.some(o => o.value === currentValue)) {
    return STANDARD_TIME_OPTIONS;
  }
  return [
    ...STANDARD_TIME_OPTIONS,
    { value: currentValue, label: formatStandardTime(currentValue) }
  ].sort((a, b) => a.value.localeCompare(b.value));
}

export function getCurrentStandardTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
