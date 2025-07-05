import {
  DataRecord,
  getMetricLabel,
  QueryFormMetric,
  TimeFormatter,
  ValueFormatter,
} from '@superset-ui/core';

export const tooltipCustomHtml = (
  params: any[],
  formatTime: TimeFormatter,
  headerFormatter: TimeFormatter | ValueFormatter,
  allData: DataRecord[],
  metric: QueryFormMetric,
) => {
  const date = formatTime(params[0]?.data?.[0]);
  const current = params[0]?.data?.[1];
  const plan = params[1]?.data?.[1];

  const currentItemId = params[0].axisValue;
  const currentItemIndex = allData.findIndex(
    el => el.order_date === currentItemId,
  );
  const prevItem =
    currentItemIndex > 0
      ? allData[currentItemIndex - 1]
      : { [getMetricLabel(metric)]: 0 };

  const last = Number(prevItem[getMetricLabel(metric)]);
  const planDiff = current - plan;
  const planExecPct = plan ? ((current / plan) * 100).toFixed(1) : 'N/A';
  const prevValue = Number(prevItem[getMetricLabel(metric)]) ?? 0;
  const wowNum = prevValue !== 0 ? current / prevValue : current;
  const wowText = current - prevValue;
  const wowPrc = wowNum === current ? '100' : ((wowNum - 1) * 100).toFixed(1);
  const isOkDiff = current >= plan;
  const isOkLast = wowText >= 0;

  const greenDot = `<span style="color:#02FB02;">●</span>`;
  const redDot = `<span style="color:red;">●</span>`;
  const greenArrow = `<span style="color:#02FB02;">▲</span>`;
  const redArrow = `<span style="color:red;">▼</span>`;

  return `
      <div style="line-height: 1.6;">
        <strong>${date}</strong><br/><br/>
        <strong>Fact:</strong> $ ${headerFormatter.format(current)}<br/><br/>
        <strong>Plan:</strong> $ ${headerFormatter.format(plan)}<br/>
        <strong>Plan exec:</strong> ${
          isOkDiff ? greenDot : redDot
        } ${planExecPct}% (${isOkDiff ? '+' : ''}${headerFormatter.format(
          planDiff,
        )}$)<br/><br/>
        <strong>Last period:</strong> $  ${headerFormatter.format(last)}<br/>
       <strong>WoW:</strong> ${isOkLast ? greenArrow : redArrow} ${wowPrc}% (${
         isOkLast ? '+' : ''
       }${headerFormatter.format(wowText)}$)<br/><br/>
      </div>
    `;
};
