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

const TRUNCATION_STYLE = `
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export function tooltipHtml(
  data: [string, string, number][],
  title: string,
  focusedRow?: number,
) {
  const [firstData, secondData] = data;

  let wowNum = '--';
  if (firstData[1] && secondData[1]) {
    wowNum = ((secondData[2] / firstData[2] - 1) * 100).toFixed(1);
  }
  const titleRow = title
    ? `<span style="font-weight: 700;${TRUNCATION_STYLE}">${title}</span>`
    : '';
  return `
    <div>
      ${titleRow}
      <table>
          ${data.length === 0 ? `<tr><td>No data</td></tr>` : ''}
          ${data
            .reverse()
            .map((row, i) => {
              const rowStyle =
                i === focusedRow ? 'font-weight: 700;' : 'opacity: 0.8;';
              const cells = row.slice(0, 2).map((cell, j) => {
                const cellStyle = `
                  text-align: left;
                  padding-left: ${j === 0 ? 0 : 16}px;
                  ${TRUNCATION_STYLE}
                `;
                return `<td style="${cellStyle}">${cell} ${
                  i === 0 && j === 1 && wowNum !== '--'
                    ? `WoW: <span style="font-weight: 700; margin-left: 4px;">${wowNum}%</span>`
                    : ''
                }</td>`;
              });
              return `<tr style="${rowStyle}">${cells.join('')} </tr>`;
            })
            .join('')}
      </table>
    </div>`;
}
