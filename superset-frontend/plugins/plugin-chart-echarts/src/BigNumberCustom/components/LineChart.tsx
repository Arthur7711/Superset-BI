import { FC, useMemo, useState } from 'react';
import { TooltipInfo, LineChartProps } from '../types';
import {
  formatValue,
  formatFullTimestamp,
  formatTimestamp,
} from '../utils/formatUtils';
import { getColorForValue } from '../utils/colorUtils';

// ============ LINE CHART COMPONENT ============

export const LineChart: FC<LineChartProps> = ({
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
