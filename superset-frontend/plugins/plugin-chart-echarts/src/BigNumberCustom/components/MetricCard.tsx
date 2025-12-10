import { FC, useMemo, useState, useRef, useEffect } from 'react';
import { ComparisonResult, MetricCardProps } from '../types';
import { formatValue } from '../utils/formatUtils';
import { getColorForValue, getWarningDotColor } from '../utils/colorUtils';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';

// ============ METRIC CARD COMPONENT ============

export const MetricCard: FC<MetricCardProps> = ({
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
    console.log('memo');
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
