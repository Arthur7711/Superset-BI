export const colorController = ({
  warningColor,
  positiveColor,
  negativeColor,
  headerValue,
  showGoal,
  goalValue,
  colorThresholds,
  useColorLegend,
}: {
  warningColor: string;
  positiveColor: string;
  negativeColor: string;
  headerValue: number;
  showGoal: boolean;
  goalValue: number;
  colorThresholds: string;
  useColorLegend?: boolean;
}) => {
  if (showGoal && goalValue) {
    if (headerValue >= goalValue) {
      return positiveColor;
    }
    if (headerValue >= goalValue * 0.8) {
      return warningColor;
    }
    return negativeColor;
  }
  if (colorThresholds && useColorLegend) {
    const thresholds = colorThresholds.split(',').map(item => Number(item));
    const [min, max] =
      thresholds.length >= 2
        ? [Math.min(...thresholds), Math.max(...thresholds)]
        : [0, 0];
    if (thresholds.length >= 2) {
      if (headerValue >= max) {
        return positiveColor;
      }
      if (headerValue < max && headerValue > min) {
        return warningColor;
      }
      return negativeColor;
    }
  }
  return '#000';
};
