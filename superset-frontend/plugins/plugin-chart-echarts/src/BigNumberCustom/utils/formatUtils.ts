// ============ FORMATTING UTILITIES ============

export function formatValue(value: number, numberFormat: string): string {
  if (numberFormat) {
    try {
      const formatter = getNumberFormatter(numberFormat);
      return formatter(value);
    } catch {
      // fallthrough
    }
  }

  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  if (Math.abs(value) < 1 && value !== 0) {
    return `${(value * 100).toFixed(1)}%`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function isValidTimestamp(ts: number | string): boolean {
  if (ts === null || ts === undefined) return false;

  if (typeof ts === 'string') {
    // Try to parse the string as a date
    // Handle various date formats
    const date = new Date(ts);
    if (isNaN(date.getTime())) return false;
    const year = date.getFullYear();
    return year >= 1970 && year <= 2100;
  }

  if (typeof ts === 'number') {
    // Very small numbers (< 100) are likely indices
    if (ts < 100) return false;
    // Numbers between 100 and 1e10 might be unix timestamps (seconds)
    if (ts > 100 && ts < 1e10) {
      const date = new Date(ts * 1000);
      const year = date.getFullYear();
      return year >= 1970 && year <= 2100;
    }
    // Numbers > 1e10 are likely milliseconds
    if (ts >= 1e10) {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return false;
      const year = date.getFullYear();
      return year >= 1970 && year <= 2100;
    }
    return false;
  }

  return false;
}

export function formatTimestamp(
  ts: number | string,
  dataLength: number,
  index: number,
): string {
  if (!isValidTimestamp(ts)) {
    return `#${index + 1}`;
  }

  let date: Date;
  if (typeof ts === 'number') {
    // Handle unix seconds vs milliseconds
    if (ts > 100 && ts < 1e10) {
      date = new Date(ts * 1000);
    } else {
      date = new Date(ts);
    }
  } else if (typeof ts === 'string') {
    date = new Date(ts);
  } else {
    return `#${index + 1}`;
  }

  if (isNaN(date.getTime())) return `#${index + 1}`;

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[date.getMonth()];
  const yearStr = `'${date.getFullYear().toString().slice(-2)}`;

  // More detailed format for fewer data points
  if (dataLength <= 12) {
    const day = date.getDate();
    return `${day} ${month}${yearStr}`;
  }
  return `${month}${yearStr}`;
}

export function formatFullTimestamp(ts: number | string): string {
  if (!isValidTimestamp(ts)) return '';

  let date: Date;
  if (typeof ts === 'number') {
    // Handle unix seconds vs milliseconds
    if (ts > 100 && ts < 1e10) {
      date = new Date(ts * 1000);
    } else {
      date = new Date(ts);
    }
  } else if (typeof ts === 'string') {
    date = new Date(ts);
  } else {
    return '';
  }

  if (isNaN(date.getTime())) return '';

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
