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
    id: 'uzumLines',
    label: 'Uzum Lines',
    group: ColorSchemeGroup.Featured,
    colors: [
      '#7342d5',
      '#40E000',
      '#fd3898',
      '#02bbff',
      '#8468ff',
      '#656565',
      '#a892e7',
      '#bfff88',
      '#fd84be',
      '#60d7ff',
      '#7242d5',
      '#c2c2c2',
      '#dee2ff',
      '#fe7d3d',
      '#2ae5c6',
      '#ffb3a6',
      '#b1f2ba',
    ],
  },
].map(s => new CategoricalScheme(s));

export default schemes;
