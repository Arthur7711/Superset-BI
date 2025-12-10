// ============ COLOR UTILITIES ============
import { ColorLegend } from '../types';

function interpolateColor(
  color1: string,
  color2: string,
  factor: number,
): string {
  // Parse hex colors
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function getBarColor(
  value: number,
  isCurrent: boolean,
  colorOnlyLast: boolean,
  useColorLegend: boolean,
  colorLegend: ColorLegend,
  showGoal: boolean,
  goalValue: number | null,
  positiveColor: string,
  warningColor: string,
  negativeColor: string,
  neutralColor: string,
  useGradient: boolean = false,
): string {
  if (colorOnlyLast && !isCurrent) {
    return neutralColor;
  }

  if (showGoal && goalValue !== null) {
    return getColorForValue(
      value,
      false,
      colorLegend,
      showGoal,
      goalValue,
      positiveColor,
      warningColor,
      negativeColor,
      neutralColor,
      useGradient,
    );
  }

  if (useColorLegend) {
    return getColorForValue(
      value,
      true,
      colorLegend,
      false,
      null,
      positiveColor,
      warningColor,
      negativeColor,
      neutralColor,
      useGradient,
    );
  }

  return isCurrent ? positiveColor : neutralColor;
}

export function getColorForValue(
  value: number,
  useColorLegend: boolean,
  colorLegend: ColorLegend,
  showGoal: boolean,
  goalValue: number | null,
  positiveColor: string,
  warningColor: string,
  negativeColor: string,
  defaultColor: string,
  useGradient: boolean = false,
): string {
  if (showGoal && goalValue !== null && goalValue > 0) {
    const ratio = value / goalValue;

    if (useGradient) {
      if (ratio >= 1) return positiveColor;
      if (ratio >= 0.8) {
        // Interpolate between warning and positive
        const factor = (ratio - 0.8) / 0.2;
        return interpolateColor(warningColor, positiveColor, factor);
      }
      if (ratio >= 0.5) {
        // Interpolate between negative and warning
        const factor = (ratio - 0.5) / 0.3;
        return interpolateColor(negativeColor, warningColor, factor);
      }
      return negativeColor;
    } else {
      if (ratio >= 1) return positiveColor;
      if (ratio >= 0.8) return warningColor;
      return negativeColor;
    }
  }

  if (useColorLegend && colorLegend.thresholds.length >= 2) {
    const [t1, t2] = colorLegend.thresholds;

    if (useGradient) {
      if (value >= t2) return positiveColor;
      if (value >= t1) {
        const factor = (value - t1) / (t2 - t1);
        return interpolateColor(warningColor, positiveColor, factor);
      }
      // Below t1 - interpolate from negative to warning based on how far below
      const minVal = t1 * 0.5; // Assume values can go down to half of t1
      if (value <= minVal) return negativeColor;
      const factor = (value - minVal) / (t1 - minVal);
      return interpolateColor(negativeColor, warningColor, factor);
    } else {
      if (value >= t2) return positiveColor;
      if (value >= t1) return warningColor;
      return negativeColor;
    }
  }

  return defaultColor;
}

export function getWarningDotColor(
  value: number | null,
  useColorLegend: boolean,
  colorLegend: ColorLegend,
  showGoal: boolean,
  goalValue: number | null,
  showWarningDot: boolean,
  warningColor: string,
  negativeColor: string,
): string | null {
  if (!showWarningDot || value === null) return null;

  if (showGoal && goalValue !== null && goalValue > 0) {
    const ratio = value / goalValue;
    if (ratio < 0.8) return negativeColor;
    if (ratio < 1) return warningColor;
    return null;
  }

  if (useColorLegend && colorLegend.thresholds.length >= 2) {
    const [t1, t2] = colorLegend.thresholds;
    if (value < t1) return negativeColor;
    if (value < t2) return warningColor;
    return null;
  }

  return null;
}
