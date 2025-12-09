/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.
 */
import { FC, useMemo, useState, useRef, useEffect } from 'react';
import { getNumberFormatter } from '@superset-ui/core';
import {
  BigNumberCustomTransformedProps,
  TrendDataPoint,
  MetricCardData,
  ComparisonResult,
  ColorLegend,
} from './types';

// ============ FORMATTING UTILITIES ============

function formatValue(value: number, numberFormat: string): string {
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

function formatTimestamp(
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

function formatFullTimestamp(ts: number | string): string {
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

// ============ COLOR UTILITIES ============

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

function getColorForValue(
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

function getWarningDotColor(
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

function getBarColor(
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

// ============ TOOLTIP TYPE ============

interface TooltipInfo {
  x: number;
  y: number;
  value: string;
  date: string;
  comparisons?: ComparisonResult[];
}

// ============ BAR CHART COMPONENT ============

interface BarChartProps {
  data: TrendDataPoint[];
  width: number;
  height: number;
  goalValue: number | null;
  avgValue: number | null;
  showGoal: boolean;
  showAverageLine: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  showMinMax: boolean;
  colorOnlyLast: boolean;
  useColorLegend: boolean;
  colorLegend: ColorLegend;
  positiveColor: string;
  negativeColor: string;
  warningColor: string;
  numberFormat: string;
  comparisons: ComparisonResult[];
  useGradient: boolean;
}

const BarChart: FC<BarChartProps> = ({
  data,
  width,
  height,
  goalValue,
  avgValue,
  showGoal,
  showAverageLine,
  showXAxis,
  showYAxis,
  showMinMax,
  colorOnlyLast,
  useColorLegend,
  colorLegend,
  positiveColor,
  negativeColor,
  warningColor,
  numberFormat,
  comparisons,
  useGradient,
}) => {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const chartData = useMemo(() => {
    if (!data.length || width < 50 || height < 30) {
      return {
        bars: [],
        xLabels: [],
        goalY: null,
        avgY: null,
        yLabels: [],
        marginLeft: 0,
        chartHeight: 0,
        marginTop: 0,
      };
    }

    const values = data.map(d => d.value);
    const dataMax = Math.max(...values);
    const dataMin = Math.min(...values);

    const minValue = 0;
    const maxValue = Math.max(dataMax, goalValue || 0, avgValue || 0) * 1.15;
    const range = maxValue - minValue || 1;

    const marginBottom = showXAxis ? 18 : 4;
    const marginTop = showMinMax ? 16 : 8;
    const marginLeft = showYAxis ? Math.min(45, width * 0.15) : 4;
    const marginRight = showGoal ? 30 : 8;
    const chartHeight = Math.max(height - marginBottom - marginTop, 10);
    const chartWidth = Math.max(width - marginLeft - marginRight, 10);
    const barGap = Math.max(1, Math.min(2, chartWidth / data.length / 4));
    const barWidth = Math.max(
      (chartWidth - barGap * data.length) / data.length,
      2,
    );

    const minIdx = values.indexOf(dataMin);
    const maxIdx = values.indexOf(dataMax);

    const bars = data.map((point, index) => {
      const barHeight = Math.max(
        ((point.value - minValue) / range) * chartHeight,
        1,
      );
      const x = marginLeft + index * (barWidth + barGap);
      const y = marginTop + chartHeight - barHeight;
      const isCurrent = index === data.length - 1;
      const color = getBarColor(
        point.value,
        isCurrent,
        colorOnlyLast,
        useColorLegend,
        colorLegend,
        showGoal,
        goalValue,
        positiveColor,
        warningColor,
        negativeColor,
        '#d9d9d9',
        useGradient,
      );

      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        color,
        value: point.value,
        isCurrent,
        isMin: showMinMax && index === minIdx,
        isMax: showMinMax && index === maxIdx,
        timestamp: point.timestamp,
        index,
      };
    });

    // X-axis labels - use actual timestamps
    const xLabels: { x: number; label: string }[] = [];
    if (showXAxis && data.length > 0 && chartWidth > 60) {
      const numLabels = Math.min(Math.floor(chartWidth / 40), data.length, 5);
      const step = Math.max(
        1,
        Math.floor((data.length - 1) / Math.max(numLabels - 1, 1)),
      );
      for (let i = 0; i < data.length; i += step) {
        if (bars[i]) {
          const label = formatTimestamp(data[i].timestamp, data.length, i);
          xLabels.push({ x: bars[i].x + bars[i].width / 2, label });
        }
      }
      // Always include last
      const lastIdx = data.length - 1;
      const lastLabel = formatTimestamp(
        data[lastIdx].timestamp,
        data.length,
        lastIdx,
      );
      if (
        xLabels.length === 0 ||
        Math.abs(
          xLabels[xLabels.length - 1].x -
            (bars[lastIdx].x + bars[lastIdx].width / 2),
        ) > 35
      ) {
        xLabels.push({
          x: bars[lastIdx].x + bars[lastIdx].width / 2,
          label: lastLabel,
        });
      }
    }

    const yLabels: { y: number; label: string }[] = [];
    if (showYAxis && chartHeight > 40) {
      const numYLabels = Math.min(4, Math.floor(chartHeight / 20));
      for (let i = 0; i <= numYLabels; i++) {
        const val = minValue + (range * i) / numYLabels;
        const y = marginTop + chartHeight - (i / numYLabels) * chartHeight;
        yLabels.push({ y, label: formatValue(val, numberFormat) });
      }
    }

    const goalY =
      showGoal && goalValue !== null
        ? marginTop +
          chartHeight -
          ((goalValue - minValue) / range) * chartHeight
        : null;
    const avgY =
      showAverageLine && avgValue !== null
        ? marginTop +
          chartHeight -
          ((avgValue - minValue) / range) * chartHeight
        : null;

    return {
      bars,
      xLabels,
      goalY,
      avgY,
      yLabels,
      chartHeight,
      marginTop,
      marginLeft,
    };
  }, [
    data,
    width,
    height,
    goalValue,
    avgValue,
    showGoal,
    showAverageLine,
    showXAxis,
    showYAxis,
    showMinMax,
    colorOnlyLast,
    useColorLegend,
    colorLegend,
    positiveColor,
    negativeColor,
    warningColor,
    numberFormat,
    useGradient,
  ]);

  if (chartData.bars.length === 0) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        {chartData.yLabels.map((label, i) => (
          <text
            key={`y-${i}`}
            x={chartData.marginLeft - 3}
            y={label.y + 3}
            textAnchor="end"
            fontSize="7"
            fill="#999"
          >
            {label.label}
          </text>
        ))}

        {chartData.avgY !== null && (
          <line
            x1={chartData.marginLeft}
            y1={chartData.avgY}
            x2={width - 8}
            y2={chartData.avgY}
            stroke="#999"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        )}

        {chartData.goalY !== null && (
          <g>
            <line
              x1={chartData.marginLeft}
              y1={chartData.goalY}
              x2={width - 25}
              y2={chartData.goalY}
              stroke="#333"
              strokeWidth={1}
              strokeDasharray="4,3"
            />
            <text
              x={width - 2}
              y={chartData.goalY + 3}
              textAnchor="end"
              fontSize="7"
              fill="#333"
            >
              plan
            </text>
          </g>
        )}

        {chartData.bars.map((bar, i) => (
          <g
            key={i}
            onMouseEnter={() =>
              setTooltip({
                x: bar.x + bar.width / 2,
                y: bar.y - 8,
                value: formatValue(bar.value, numberFormat),
                date: formatFullTimestamp(bar.timestamp) || `#${bar.index + 1}`,
                comparisons,
              })
            }
            onMouseLeave={() => setTooltip(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={bar.color}
              rx={1}
            />
            {(bar.isMin || bar.isMax || bar.isCurrent) && bar.height > 5 && (
              <text
                x={bar.x + bar.width / 2}
                y={bar.y - 2}
                textAnchor="middle"
                fontSize="6"
                fill={
                  bar.isMin
                    ? negativeColor
                    : bar.isMax
                      ? positiveColor
                      : bar.color
                }
                fontWeight="600"
              >
                {formatValue(bar.value, numberFormat)}
              </text>
            )}
          </g>
        ))}

        {chartData.xLabels.map((label, i) => (
          <text
            key={`x-${i}`}
            x={label.x}
            y={height - 2}
            textAnchor="middle"
            fontSize="7"
            fill="#999"
          >
            {label.label}
          </text>
        ))}
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: Math.max(0, tooltip.y - 40),
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.85)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '9px',
            pointerEvents: 'none',
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ opacity: 0.7 }}>{tooltip.date}</div>
          <div style={{ fontWeight: 600 }}>{tooltip.value}</div>
        </div>
      )}
    </div>
  );
};

// ============ LINE CHART COMPONENT ============

interface LineChartProps {
  data: TrendDataPoint[];
  width: number;
  height: number;
  showMinMax: boolean;
  showAverageLine: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  avgValue: number | null;
  goalValue: number | null;
  showGoal: boolean;
  colorOnlyLast: boolean;
  useColorLegend: boolean;
  colorLegend: ColorLegend;
  positiveColor: string;
  negativeColor: string;
  warningColor: string;
  numberFormat: string;
  comparisons: ComparisonResult[];
  useGradient: boolean;
}

const LineChart: FC<LineChartProps> = ({
  data,
  width,
  height,
  showMinMax,
  showAverageLine,
  showXAxis,
  showYAxis,
  avgValue,
  goalValue,
  showGoal,
  colorOnlyLast,
  useColorLegend,
  colorLegend,
  positiveColor,
  negativeColor,
  warningColor,
  numberFormat,
  comparisons,
  useGradient,
}) => {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const chartData = useMemo(() => {
    if (!data.length || width < 50 || height < 30) {
      return {
        points: [],
        path: '',
        minPoint: null,
        maxPoint: null,
        avgY: null,
        goalY: null,
        xLabels: [],
        yLabels: [],
        chartWidth: 0,
        marginLeft: 0,
      };
    }

    const values = data.map(d => d.value);
    const dataMax = Math.max(...values);
    const dataMin = Math.min(...values);

    const minValue = Math.min(dataMin, 0);
    const maxValue = Math.max(dataMax, goalValue || 0, avgValue || 0) * 1.15;
    const range = maxValue - minValue || 1;

    const marginBottom = showXAxis ? 18 : 4;
    const marginTop = showMinMax ? 14 : 6;
    const marginLeft = showYAxis ? Math.min(45, width * 0.15) : 20;
    const marginRight = showGoal ? 30 : 8;
    const chartWidth = Math.max(width - marginLeft - marginRight, 10);
    const chartHeight = Math.max(height - marginBottom - marginTop, 10);

    const minIdx = values.indexOf(dataMin);
    const maxIdx = values.indexOf(dataMax);

    const points = data.map((point, index) => {
      const x = marginLeft + (index / (data.length - 1 || 1)) * chartWidth;
      const y =
        marginTop +
        chartHeight -
        ((point.value - minValue) / range) * chartHeight;
      const isCurrent = index === data.length - 1;
      let color = '#8c8c8c';
      if (colorOnlyLast) {
        color = isCurrent
          ? getColorForValue(
              point.value,
              useColorLegend,
              colorLegend,
              showGoal,
              goalValue,
              positiveColor,
              warningColor,
              negativeColor,
              positiveColor,
              useGradient,
            )
          : '#8c8c8c';
      } else {
        color = getColorForValue(
          point.value,
          useColorLegend,
          colorLegend,
          showGoal,
          goalValue,
          positiveColor,
          warningColor,
          negativeColor,
          '#8c8c8c',
          useGradient,
        );
      }
      return {
        x,
        y,
        value: point.value,
        timestamp: point.timestamp,
        color,
        isCurrent,
        isMin: showMinMax && index === minIdx,
        isMax: showMinMax && index === maxIdx,
        index,
      };
    });

    const path = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
    const minPoint = showMinMax ? points[minIdx] : null;
    const maxPoint = showMinMax ? points[maxIdx] : null;
    const avgY =
      avgValue !== null
        ? marginTop +
          chartHeight -
          ((avgValue - minValue) / range) * chartHeight
        : null;
    const goalY =
      showGoal && goalValue !== null
        ? marginTop +
          chartHeight -
          ((goalValue - minValue) / range) * chartHeight
        : null;

    const xLabels: { x: number; label: string }[] = [];
    if (showXAxis && data.length > 0 && chartWidth > 60) {
      const numLabels = Math.min(Math.floor(chartWidth / 40), data.length, 5);
      const step = Math.max(
        1,
        Math.floor((data.length - 1) / Math.max(numLabels - 1, 1)),
      );
      for (let i = 0; i < data.length; i += step) {
        if (points[i])
          xLabels.push({
            x: points[i].x,
            label: formatTimestamp(data[i].timestamp, data.length, i),
          });
      }
    }

    const yLabels: { y: number; label: string }[] = [];
    if (showYAxis && chartHeight > 40) {
      const numYLabels = Math.min(4, Math.floor(chartHeight / 20));
      for (let i = 0; i <= numYLabels; i++) {
        const val = minValue + (range * i) / numYLabels;
        const y = marginTop + chartHeight - (i / numYLabels) * chartHeight;
        yLabels.push({ y, label: formatValue(val, numberFormat) });
      }
    }

    return {
      points,
      path,
      minPoint,
      maxPoint,
      avgY,
      goalY,
      chartWidth,
      marginLeft,
      xLabels,
      yLabels,
    };
  }, [
    data,
    width,
    height,
    showMinMax,
    avgValue,
    goalValue,
    showGoal,
    showXAxis,
    showYAxis,
    colorOnlyLast,
    useColorLegend,
    colorLegend,
    positiveColor,
    negativeColor,
    warningColor,
    numberFormat,
    useGradient,
  ]);

  if (chartData.points.length === 0) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        {chartData.yLabels.map((label, i) => (
          <text
            key={`y-${i}`}
            x={chartData.marginLeft - 3}
            y={label.y + 3}
            textAnchor="end"
            fontSize="7"
            fill="#999"
          >
            {label.label}
          </text>
        ))}

        {showAverageLine && chartData.avgY !== null && (
          <line
            x1={chartData.marginLeft}
            y1={chartData.avgY}
            x2={chartData.marginLeft + chartData.chartWidth}
            y2={chartData.avgY}
            stroke="#999"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        )}

        {chartData.goalY !== null && (
          <g>
            <line
              x1={chartData.marginLeft}
              y1={chartData.goalY}
              x2={chartData.marginLeft + chartData.chartWidth}
              y2={chartData.goalY}
              stroke="#333"
              strokeWidth={1}
              strokeDasharray="4,3"
            />
            <text
              x={chartData.marginLeft + chartData.chartWidth + 3}
              y={chartData.goalY + 3}
              fontSize="7"
              fill="#333"
            >
              plan
            </text>
          </g>
        )}

        <path
          d={chartData.path}
          fill="none"
          stroke="#aaa"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {chartData.points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={point.isCurrent ? 3 : 1.5}
            fill={point.color}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() =>
              setTooltip({
                x: point.x,
                y: point.y - 8,
                value: formatValue(point.value, numberFormat),
                date:
                  formatFullTimestamp(point.timestamp) || `#${point.index + 1}`,
                comparisons,
              })
            }
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {chartData.minPoint && (
          <text
            x={chartData.minPoint.x}
            y={chartData.minPoint.y + 10}
            textAnchor="middle"
            fontSize="6"
            fill={negativeColor}
            fontWeight="600"
          >
            {formatValue(chartData.minPoint.value, numberFormat)}
          </text>
        )}

        {chartData.maxPoint && (
          <text
            x={chartData.maxPoint.x}
            y={chartData.maxPoint.y - 5}
            textAnchor="middle"
            fontSize="6"
            fill={positiveColor}
            fontWeight="600"
          >
            {formatValue(chartData.maxPoint.value, numberFormat)}
          </text>
        )}

        {chartData.xLabels.map((label, i) => (
          <text
            key={`x-${i}`}
            x={label.x}
            y={height - 2}
            textAnchor="middle"
            fontSize="7"
            fill="#999"
          >
            {label.label}
          </text>
        ))}
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: Math.max(0, tooltip.y - 40),
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.85)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '9px',
            pointerEvents: 'none',
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ opacity: 0.7 }}>{tooltip.date}</div>
          <div style={{ fontWeight: 600 }}>{tooltip.value}</div>
        </div>
      )}
    </div>
  );
};

// ============ METRIC CARD COMPONENT ============

interface MetricCardProps {
  card: MetricCardData;
  width: number;
  height: number;
  showWarningDot: boolean;
  subheader: string;
  dateRange: string;
  showDateRange: boolean;
  showTrend: boolean;
  trendChartType: 'bar' | 'line';
  showGoal: boolean;
  goalValue: number | null;
  showGoalProgress: boolean;
  showGoalPercent: boolean;
  showMinMax: boolean;
  showAverageLine: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  colorOnlyLast: boolean;
  useColorLegend: boolean;
  colorLegend: ColorLegend;
  positiveColor: string;
  negativeColor: string;
  warningColor: string;
  headerFontSize: number;
  useGradient: boolean;
}

const MetricCard: FC<MetricCardProps> = ({
  card,
  width,
  height,
  showWarningDot,
  subheader,
  dateRange,
  showDateRange,
  showTrend,
  trendChartType,
  showGoal,
  goalValue,
  showGoalProgress,
  showGoalPercent,
  showMinMax,
  showAverageLine,
  showXAxis,
  showYAxis,
  colorOnlyLast,
  useColorLegend,
  colorLegend,
  positiveColor,
  negativeColor,
  warningColor,
  headerFontSize,
  useGradient,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const numberRef = useRef<HTMLDivElement>(null);
  const [adaptedFontSize, setAdaptedFontSize] = useState(headerFontSize);

  // Adapt font size to fit container width
  useEffect(() => {
    if (numberRef.current) {
      const containerWidth = width - 40; // Account for padding and warning dot
      let testSize = headerFontSize;

      // Create a temporary span to measure text width
      const span = document.createElement('span');
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.style.fontWeight = '700';
      span.style.whiteSpace = 'nowrap';
      span.textContent = card.formattedNumber;
      document.body.appendChild(span);

      // Reduce font size until it fits
      while (testSize > 16) {
        span.style.fontSize = `${testSize}px`;
        if (span.offsetWidth <= containerWidth) break;
        testSize -= 2;
      }

      document.body.removeChild(span);
      setAdaptedFontSize(testSize);
    }
  }, [card.formattedNumber, width, headerFontSize]);

  const numberColor = useMemo(() => {
    if (card.bigNumber === null) return '#262626';
    return getColorForValue(
      card.bigNumber,
      useColorLegend,
      colorLegend,
      showGoal,
      goalValue,
      positiveColor,
      warningColor,
      negativeColor,
      '#262626',
      useGradient,
    );
  }, [
    card.bigNumber,
    useColorLegend,
    colorLegend,
    showGoal,
    goalValue,
    positiveColor,
    warningColor,
    negativeColor,
    useGradient,
  ]);

  const warningDotColor = useMemo(() => {
    return getWarningDotColor(
      card.bigNumber,
      useColorLegend,
      colorLegend,
      showGoal,
      goalValue,
      showWarningDot,
      warningColor,
      negativeColor,
    );
  }, [
    card.bigNumber,
    useColorLegend,
    colorLegend,
    showGoal,
    goalValue,
    showWarningDot,
    warningColor,
    negativeColor,
  ]);

  const formatComparison = (comp: ComparisonResult): string => {
    if (comp.value === null) return '';
    const prefix = comp.value >= 0 ? '↑+' : '↓';
    return `${prefix}${Math.abs(comp.value).toFixed(1)}% ${comp.label}`;
  };

  const currentValue = card.bigNumber || 0;
  const goalProgress =
    showGoal && goalValue ? Math.min((currentValue / goalValue) * 100, 100) : 0;
  const showLegend = (showGoal && goalValue !== null) || useColorLegend;

  // Calculate chart height
  const headerSection = 60;
  const comparisonsHeight = card.comparisons.length > 0 ? 16 : 0;
  const progressHeight = showGoalProgress && showGoal && goalValue ? 18 : 0;
  const legendHeight = showLegend && showTrend ? 14 : 0;
  const usedHeight =
    headerSection + comparisonsHeight + progressHeight + legendHeight + 8;
  const chartHeight = Math.max(height - usedHeight, 40);
  const chartWidth = Math.max(width - 16, 60);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 10px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Metric name */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: 500,
          color: '#666',
          marginBottom: '4px',
          lineHeight: 1.2,
        }}
      >
        {card.metricName}
      </div>

      {/* Big number */}
      <div
        style={{ position: 'relative', marginBottom: '4px' }}
        ref={numberRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          style={{
            fontSize: `${adaptedFontSize}px`,
            fontWeight: 700,
            color: numberColor,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {warningDotColor && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: warningDotColor,
                flexShrink: 0,
              }}
            />
          )}
          {card.formattedNumber}
        </div>

        {showTooltip && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '100%',
              marginTop: '4px',
              backgroundColor: 'rgba(0,0,0,0.85)',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '9px',
              zIndex: 100,
              whiteSpace: 'nowrap',
            }}
          >
            <div>Value: {card.formattedNumber}</div>
            {card.avgValue !== null && (
              <div>Avg: {formatValue(card.avgValue, card.numberFormat)}</div>
            )}
            {goalValue !== null && (
              <div>Goal: {formatValue(goalValue, card.numberFormat)}</div>
            )}
          </div>
        )}
      </div>

      {/* Comparisons */}
      {card.comparisons.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '11px',
            color: '#999',
            marginBottom: '6px',
          }}
        >
          {card.comparisons.map((comp, idx) => (
            <span key={idx}>{formatComparison(comp)}</span>
          ))}
        </div>
      )}

      {/* Goal progress bar */}
      {showGoalProgress && showGoal && goalValue ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px',
            fontSize: '10px',
          }}
        >
          <span style={{ color: '#999' }}>0</span>
          <div
            style={{
              flex: 1,
              height: '6px',
              backgroundColor: '#e8e8e8',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${goalProgress}%`,
                backgroundColor: positiveColor,
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showGoalPercent && goalProgress > 25 && (
                <span
                  style={{ fontSize: '7px', fontWeight: 600, color: '#fff' }}
                >
                  {goalProgress.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
          <span style={{ color: '#999' }}>plan</span>
          <span style={{ fontWeight: 500, color: '#666' }}>
            {formatValue(goalValue, card.numberFormat)}
          </span>
        </div>
      ) : null}

      {/* Legend */}
      {showLegend && showTrend && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            fontSize: '9px',
            color: '#999',
            marginBottom: '4px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: positiveColor,
                borderRadius: '2px',
              }}
            />
            fact {'>'} plan
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: negativeColor,
                borderRadius: '2px',
              }}
            />
            fact {'<'} plan
          </span>
        </div>
      )}

      {/* Chart */}
      {showTrend && card.trendData.length > 0 && (
        <div style={{ flex: 1, minHeight: '40px', height: chartHeight }}>
          {trendChartType === 'bar' ? (
            <BarChart
              data={card.trendData}
              width={chartWidth}
              height={chartHeight}
              goalValue={goalValue}
              avgValue={card.avgValue}
              showGoal={showGoal}
              showAverageLine={showAverageLine}
              showXAxis={showXAxis}
              showYAxis={showYAxis}
              showMinMax={showMinMax}
              colorOnlyLast={colorOnlyLast}
              useColorLegend={useColorLegend}
              colorLegend={colorLegend}
              positiveColor={positiveColor}
              negativeColor={negativeColor}
              warningColor={warningColor}
              numberFormat={card.numberFormat}
              comparisons={card.comparisons}
              useGradient={useGradient}
            />
          ) : (
            <LineChart
              data={card.trendData}
              width={chartWidth}
              height={chartHeight}
              showMinMax={showMinMax}
              showAverageLine={showAverageLine}
              showXAxis={showXAxis}
              showYAxis={showYAxis}
              avgValue={card.avgValue}
              goalValue={goalValue}
              showGoal={showGoal}
              colorOnlyLast={colorOnlyLast}
              useColorLegend={useColorLegend}
              colorLegend={colorLegend}
              positiveColor={positiveColor}
              negativeColor={negativeColor}
              warningColor={warningColor}
              numberFormat={card.numberFormat}
              comparisons={card.comparisons}
              useGradient={useGradient}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ============ MAIN COMPONENT ============

const BigNumberCustomViz: FC<BigNumberCustomTransformedProps> = props => {
  const {
    width,
    height,
    isPanelMode,
    panelColumns,
    metricCards,
    showWarningDot,
    subheader,
    dateRange,
    showDateRange,
    showTrend,
    trendChartType,
    showGoal,
    goalValue,
    showGoalProgress,
    showGoalPercent,
    showMinMax,
    showAverageLine,
    showXAxis,
    showYAxis,
    colorOnlyLast,
    useColorLegend,
    colorLegend,
    positiveColor,
    negativeColor,
    warningColor,
    headerFontSize,
  } = props;

  // Get useGradient from colorLegend
  const useGradient = colorLegend?.useGradient || false;

  if (isPanelMode && metricCards.length > 1) {
    const cols = Math.min(panelColumns, metricCards.length);
    const rows = Math.ceil(metricCards.length / cols);
    const gap = 8;
    const cardWidth = (width - (cols + 1) * gap) / cols;
    const cardHeight = (height - (rows + 1) * gap) / rows;
    // Adaptive font size based on card width
    const adaptiveFontSize = Math.min(
      headerFontSize,
      Math.max(16, Math.floor(cardWidth / 10)),
    );

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: `${gap}px`,
          padding: '4px',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {metricCards.map((card, idx) => (
          <MetricCard
            key={idx}
            card={card}
            width={cardWidth}
            height={cardHeight}
            showWarningDot={showWarningDot}
            subheader={subheader}
            dateRange={dateRange}
            showDateRange={showDateRange}
            showTrend={showTrend}
            trendChartType={trendChartType}
            showGoal={showGoal}
            goalValue={goalValue}
            showGoalProgress={showGoalProgress}
            showGoalPercent={showGoalPercent}
            showMinMax={showMinMax}
            showAverageLine={showAverageLine}
            showXAxis={showXAxis}
            showYAxis={showYAxis}
            colorOnlyLast={colorOnlyLast}
            useColorLegend={useColorLegend}
            colorLegend={colorLegend}
            positiveColor={positiveColor}
            negativeColor={negativeColor}
            warningColor={warningColor}
            headerFontSize={adaptiveFontSize}
            useGradient={useGradient}
          />
        ))}
      </div>
    );
  }

  const card = metricCards[0] || {
    metricName: 'No Data',
    bigNumber: null,
    formattedNumber: 'No Data',
    valueColor: '#262626',
    warningDotColor: null,
    trendData: [],
    comparisons: [],
    minValue: null,
    maxValue: null,
    avgValue: null,
    goalProgress: 0,
    totalValue: 0,
    numberFormat: '',
  };

  return (
    <MetricCard
      card={card}
      width={width}
      height={height}
      showWarningDot={showWarningDot}
      subheader={subheader}
      dateRange={dateRange}
      showDateRange={showDateRange}
      showTrend={showTrend}
      trendChartType={trendChartType}
      showGoal={showGoal}
      goalValue={goalValue}
      showGoalProgress={showGoalProgress}
      showGoalPercent={showGoalPercent}
      showMinMax={showMinMax}
      showAverageLine={showAverageLine}
      showXAxis={showXAxis}
      showYAxis={showYAxis}
      colorOnlyLast={colorOnlyLast}
      useColorLegend={useColorLegend}
      colorLegend={colorLegend}
      positiveColor={positiveColor}
      negativeColor={negativeColor}
      warningColor={warningColor}
      headerFontSize={headerFontSize}
      useGradient={useGradient}
    />
  );
};

export default BigNumberCustomViz;
