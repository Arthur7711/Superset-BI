/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { t } from '@superset-ui/core';

const TRUNCATION_STYLE = `
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const tooltipCustomHtml = (
  params: any[],
  formatTime: any,
  headerFormatter: any,
) => {
  const date = formatTime(params[0]?.data?.[0]); // Format your date
  const current = params[0]?.data?.[1];
  const plan = params[1]?.data?.[1];

  // Derived values
  const planDiff = current - plan;
  const planExecPct = plan ? (100 - (current / plan) * 100).toFixed(1) : 'N/A';
  // const lastDiff = current - last;
  // const lastDiffPct = last ? ((lastDiff / last) * 100).toFixed(1) : 'N/A';
  console.log('planDiff', planDiff);
  const greenDot = `<span style="color:green;">●</span>`;
  const greenArrow = `<span style="color:green;">▲</span>`;
  const redDot = `<span style="color:red;">●</span>`;
  const redArrow = `<span style="color:red;">▼</span>`;
  const isOkDiff = current >= plan;
  // <strong>Last period:</strong> $ ${headerFormatter.format(last)}<br/>
  // <strong>WoW:</strong> ${greenArrow} ${lastDiffPct}% ($${headerFormatter.format(
  //   lastDiff,
  // )})
  return `
      <div style="line-height: 1.6;">
        <strong>${date}</strong><br/><br/>
        <strong>Fact:</strong> $ ${headerFormatter.format(current)}<br/><br/>
        <strong>Plan:</strong> $ ${headerFormatter.format(plan)}<br/>
        <strong>Plan exec:</strong> ${
          isOkDiff ? greenDot : redDot
        } ${planExecPct}% (${headerFormatter.format(planDiff)}$)<br/><br/>
       
      </div>
    `;
};
