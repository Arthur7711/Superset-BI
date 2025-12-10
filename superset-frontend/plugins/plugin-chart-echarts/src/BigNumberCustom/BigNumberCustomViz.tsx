/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.
 */
import { FC } from 'react';
import { BigNumberCustomTransformedProps } from './types';

import { MetricCard } from './components/MetricCard';
import { UpperBlock } from './UIComponents';

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
  console.log('props', props);

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
      <UpperBlock cols={cols} gap={gap}>
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
      </UpperBlock>
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
