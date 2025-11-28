import {
  DataRecord,
  getMetricLabel,
  QueryFormMetric,
  TimeFormatter,
  ValueFormatter,
} from '@superset-ui/core';
import { getTimeGrainSqlaFormatter } from './helpers/getTimeGrainSqla';
import { getWeekFromRange } from './helpers/getWeekFromRange';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const tooltipCustomHtml = (props: {
  params: any[];
  formatTime: TimeFormatter;
  headerFormatter: TimeFormatter | ValueFormatter;
  allData: DataRecord[];
  metric: QueryFormMetric;
  secondMetric: QueryFormMetric;
  showPlanExec: boolean;
  showTooltipWow: boolean;
  timeGrainSqla: string;
  showCustomizeVersion: boolean;
  metricShowName?: string;
  secondMetricShowName?: string;
  timeMetricName: string;
  tooltipFormatter: TimeFormatter | ValueFormatter;
}) => {
  const {
    params,
    formatTime,
    headerFormatter,
    allData,
    metric,
    secondMetric,
    showPlanExec,
    showTooltipWow,
    timeGrainSqla,
    showCustomizeVersion,
    metricShowName,
    secondMetricShowName,
    timeMetricName,
    tooltipFormatter,
  } = props;

  const date = formatTime(params[0]?.data?.[0]);
  const current = params[0]?.data?.[1];
  const plan = params[1]?.data?.[1];
  const currentItemId = params[0].axisValue;
  const currentItemIndex = allData.findIndex(el => {
    const nonMetricKey = Object.keys(el).find(
      key =>
        key !== getMetricLabel(metric) && key !== getMetricLabel(secondMetric),
    );
    return el[nonMetricKey] === currentItemId;
  });
  const timeFormatterName = getTimeGrainSqlaFormatter(timeGrainSqla);

  const prevItem =
    timeGrainSqla === 'P1D' && currentItemIndex >= 8
      ? allData[currentItemIndex - 8]
      : timeGrainSqla === 'P1D' && currentItemIndex < 8
        ? { [getMetricLabel(metric)]: 0 }
        : currentItemIndex > 0
          ? allData[currentItemIndex - 1]
          : { [getMetricLabel(metric)]: 0 };

  const last = Number(prevItem[getMetricLabel(metric)]);
  const planDiff = current - plan;
  const prcent = (current / plan - 1) * 100;
  const planExecPct = plan ? prcent.toFixed(1) : 'N/A';
  const prevValue = Number(prevItem[getMetricLabel(metric)]) ?? 0;
  const wowNum = prevValue !== 0 ? current / prevValue : current;
  const wowText = current - prevValue;
  const wowPrc = wowNum === current ? '100' : ((wowNum - 1) * 100).toFixed(1);
  const isOkDiff = current >= plan;
  const isOkLast = wowText >= 0;

  const greenDot = `<span style="color:#02FB02;">●</span>`;
  const redDot = `<span style="color:red;">●</span>`;
  const orangeDot = `<span style="color:orange;">●</span>`;
  const dotController =
    prcent < 90 ? redDot : prcent >= 90 && prcent < 98 ? orangeDot : greenDot;
  const greenArrow = `<span style="color:#02FB02;">▲</span>`;
  const redArrow = `<span style="color:red;">▼</span>`;
  let resultTimeText: string | number = '';
  switch (timeGrainSqla) {
    case 'P1D': {
      const weekDayIndex = new Date(date).getDay();

      resultTimeText = `(${weekDays[weekDayIndex]})`;
      break;
    }
    case 'P1W': {
      resultTimeText = `(WEEK: ${getWeekFromRange(date)})`;
      break;
    }
    default:
      break;
  }

  const sumCount = allData.reduce((acc, item) => {
    const value = Number(item[getMetricLabel(metric)]) || 0;
    return acc + value;
  }, 0);

  const dateData = Object.keys(allData[0]).find(el => el === timeMetricName);
  const firstDate = formatTime(Number(allData[0][dateData]));
  const lastDate = formatTime(Number(allData[allData.length - 1][dateData]));
  const metricCurrentName = metricShowName || metric;
  const secondaryCurrentName = secondMetricShowName || secondMetric;
  const isPositiveDiffSymbol = isOkDiff ? '+' : '';

  return `
      <div style="line-height: 1.6;">
        <strong>${date}${resultTimeText}</strong><br/><br/>
        <span><strong>${metricCurrentName}:</strong> ${tooltipFormatter.format(
          current,
        )}</span><br/>
        <div style="display: ${showTooltipWow ? 'block' : 'none'}">
          <strong>PoP:</strong> ${
            isOkLast ? greenArrow : redArrow
          } ${wowPrc}% (${isOkLast ? '+' : ''}${headerFormatter.format(
            wowText,
          )})
          <br/>
        </div>
        ${
          plan
            ? `<span><strong>${secondaryCurrentName}:</strong> ${tooltipFormatter.format(
                plan,
              )}</span><br/>`
            : ''
        }
         <div style="display: ${showPlanExec && plan ? 'block' : 'none'}">
          <strong> ${metricCurrentName} vs ${secondaryCurrentName}: </strong> ${dotController} ${planExecPct}% (${isPositiveDiffSymbol}${headerFormatter.format(
            planDiff,
          )})<br/>
        </div>
        <br/>
        <strong>Дата: ${firstDate} - ${lastDate}</strong><br />
        <div>
          <strong>${metricCurrentName}:</strong> ${tooltipFormatter.format(
            sumCount,
          )}
          <br/>
        </div>
      </div>
    `;
};
