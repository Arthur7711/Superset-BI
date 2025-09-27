/*
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

import CategoricalScheme from '../../CategoricalScheme';
import { ColorSchemeGroup } from '../../types';

// TODO: add the colors to the theme while working on SIP https://github.com/apache/superset/issues/20159
const schemes = [
  {
    id: 'uzumBerry',
    label: 'Uzum Berry',
    group: ColorSchemeGroup.Featured,
    colors: [
      '#cbd1ff',
      '#b3b3b3',
      '#fea0cb',
      '#7edcff',
      '#b1abfe',
      '#5000a8',
      '#d8d8d8',
      '#b3edff',
      '#a694fe',
      '#211d86',
      '#ffc7dd',
      '#d5ccff',
      '#7000ff',
      '#65ace6',
      '#7a7a7a',
      '#33006a',
      '#6571ce',
      '#a892e8',
    ],
  },
].map(s => new CategoricalScheme(s));

export default schemes;
