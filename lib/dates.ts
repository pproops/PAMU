export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}.`;
}

export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function parseDate(dateString: string): Date {
  const match = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})\.$/);

  if (!match) {
    return new Date();
  }

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const parsed = new Date(year, month, day);

  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

export function formatScheduledAt(date: Date, time: Date): string {
  return `${formatDate(date)} ${formatTime(time)}`;
}
