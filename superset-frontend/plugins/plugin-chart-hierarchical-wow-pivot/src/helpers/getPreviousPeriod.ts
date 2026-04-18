export function getPreviousPeriod({dateInput, unit = 'P1D', period = 1}: {dateInput: string, unit?:  'P1D' | 'P1W' | 'P1M' | 'P3M' | 'P1Y', period?: number}) {
    const date = new Date(dateInput);
  
    switch (unit) {
      case 'P1D':
        date.setDate(date.getDate() - (7 * period));
        break;
  
      case 'P1W':
        date.setDate(date.getDate() - 7 * period);
        break;
  
      case 'P1M':
        date.setMonth(date.getMonth() - 1 * period);
        break;
  
      case 'P3M':
        date.setMonth(date.getMonth() - 3 * period);
        break;
  
      case 'P1Y':
        date.setFullYear(date.getFullYear() - 1 * period);
        break;
  
      default:
        throw new Error(`Unsupported unit: ${unit}`);
    }
    // date.setHours(0, 0, 0, 0);
    return date;
  }
  