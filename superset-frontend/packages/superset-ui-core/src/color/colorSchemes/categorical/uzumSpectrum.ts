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
    id: 'uzumSpectrum',
    label: 'Uzum Spectrum',
    group: ColorSchemeGroup.Featured,
    colors: [
      '#958aff',
      '#bfff88',
      '#fd84be',
      '#60d7ff',
      '#ffff00',
      '#5000a8',
      '#c3c3c3',
      '#c1bbff',
      '#d1ffa7',
      '#ffb4d9',
      '#a8e5ff',
      '#d8d8d8',
      '#7242d5',
      '#ffff82',
      '#dee2ff',
      '#e0ffc6',
      '#ffd0e1',
      '#dcf7ff',
      '#eeeeee',
      '#d5c3ff',
      '#ffffc5',
    ],
  },
].map(s => new CategoricalScheme(s));

export default schemes;
