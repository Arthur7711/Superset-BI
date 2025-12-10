// ============ BAR CHART COMPONENT ============
import { FC, useMemo, useRef, useState } from 'react';
import { TooltipInfo, BarChartProps } from '../types';
import {
  formatValue,
  formatFullTimestamp,
  formatTimestamp,
} from '../utils/formatUtils';
import { getBarColor } from '../utils/colorUtils';
import Echart from '../../components/Echart';
import { EchartsHandler } from '../../types';

export const BarChart: FC<BarChartProps> = ({
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
  const echartRef = useRef<EchartsHandler | null>(null);

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
  // const refs = { echartRef: echartRef };
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* <Echart
        width={width}
        height={height}
        echartOptions={{}}
        ref={echartRef}
        refs={refs}
      /> */}
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
