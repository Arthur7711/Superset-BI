export function getNormalizedDate(date: Date) {

const day = date.getDate();        // 1–31
const month = date.getMonth() + 1; // 0-based → +1
const year = date.getFullYear();

return `${year}-${month}-${day}`;
}