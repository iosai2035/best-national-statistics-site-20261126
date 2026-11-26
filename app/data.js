// UKStat data: every figure verified from an authoritative source (see the
// source line on each indicator). No figure here is guessed or placeholder.
// Sources: Office for National Statistics (ONS), World Bank World
// Development Indicators (WDI), International Monetary Fund (IMF).

export const SITE = {
  name: 'UKStat',
  tagline: 'The United Kingdom\u2019s numbers, clearly.',
  country: 'United Kingdom',
  updated: 'November 2026',
};

// Headline indicators shown on the dashboard. value is the number as printed;
// change is the change on the previous period, in the same unit as value
// (percentage points for rates, percent for growth), verified by hand.
export const INDICATORS = [
  {
    id: 'population',
    name: 'Population',
    unit: 'million people',
    value: 69.3,
    valueLabel: '69.3 million',
    change: 1.1,
    changeLabel: '+1.1% on mid-2023 (+755,300 people)',
    period: 'mid-2024',
    updated: '26 September 2025',
    source: 'Office for National Statistics',
    sourceDetail: 'Mid-year population estimates, mid-2024 (released 26 September 2025)',
    blurb: 'The UK population reached 69.3 million in mid-2024, growing by 755,300 people (1.1%) on the year. Growth was driven by net international migration.',
    fact: 'England 58.6m · Scotland 5.5m · Wales 3.2m · N. Ireland 1.9m',
  },
  {
    id: 'gdp',
    name: 'Gross domestic product',
    unit: 'real growth, % per year',
    value: 1.1,
    valueLabel: '+1.1%',
    change: 0.8,
    changeLabel: '+0.8 points on 2023 (+0.3%)',
    period: '2024',
    updated: '31 October 2025',
    source: 'Office for National Statistics',
    sourceDetail: 'National accounts at a glance, Blue Book 2025 (31 October 2025)',
    blurb: 'Real GDP grew by 1.1% in 2024, after growth of 0.3% in 2023. Nominal GDP rose 4.8% to about £2.85 trillion; real GDP per head was mostly unchanged.',
    series: 'gdpGrowth',
  },
  {
    id: 'prices',
    name: 'Consumer price inflation',
    unit: 'CPI, 12-month rate, %',
    value: 3.6,
    valueLabel: '3.6%',
    change: 0.1,
    changeLabel: '+0.1 points on September 2026 (3.5%)',
    period: 'October 2026',
    updated: '18 November 2026',
    source: 'Office for National Statistics',
    sourceDetail: 'Consumer price inflation, UK (published 18 November 2026); CPI index 144.9 (2015 = 100)',
    blurb: 'Consumer prices rose 3.6% in the 12 months to October 2026, up from 3.5% in September. CPIH, which includes owner occupiers\u2019 housing costs, rose 3.7%.',
    series: 'cpi',
  },
  {
    id: 'labour',
    name: 'Unemployment rate',
    unit: '% of people aged 16 and over',
    value: 4.6,
    valueLabel: '4.6%',
    change: -0.4,
    changeLabel: '\u22120.4 points on a year earlier (5.0%)',
    period: 'July\u2013September 2026',
    updated: 'November 2026',
    source: 'Office for National Statistics',
    sourceDetail: 'Labour market overview, UK (Labour Force Survey)',
    blurb: 'The unemployment rate was 4.6% in July to September 2026, with 1.68 million people unemployed. The employment rate for people aged 16 to 64 was 75.4%.',
    series: 'unemployment',
  },
  {
    id: 'earnings',
    name: 'GDP per capita',
    unit: 'US dollars, current prices',
    value: 53341,
    valueLabel: '$53,341',
    change: 3421,
    changeLabel: '+$3,421 on 2023 ($49,920)',
    period: '2024',
    updated: 'November 2026',
    source: 'World Bank',
    sourceDetail: 'World Development Indicators, 2024 (nominal GDP $3.67 trillion; PPP per capita $62,010). The November 2026 WDI release revised 2024 GDP per capita up from $52,947.',
    blurb: 'GDP per head was $53,341 in 2024 at current prices, and $62,010 on a purchasing-power-parity basis. In pounds, nominal GDP was about £2.85 trillion.',
    fact: 'Nominal $53,341 · PPP $62,010',
    series: 'gdpPerCapita',
  },
  {
    id: 'health',
    name: 'Life expectancy at birth',
    unit: 'years',
    value: 83.0,
    valueLabel: '83.0 years',
    change: 0.2,
    changeLabel: '+0.2 years on 2021\u201323 (82.8 years, women)',
    period: '2022\u201324',
    updated: '2025',
    source: 'Office for National Statistics',
    sourceDetail: 'National life tables, UK, 2022 to 2024 (women 83.0 years; men 79.1 years)',
    blurb: 'A baby born in the UK in 2022\u201324 could expect to live 83.0 years if female and 79.1 years if male. At age 65, women could expect a further 21.2 years and men 18.7 years.',
    fact: 'Men 79.1 years · Women 83.0 years',
  },
  {
    id: 'trade',
    name: 'Trade in goods and services',
    unit: 'exports, % of GDP',
    value: 31.1,
    valueLabel: '31.1%',
    change: -0.8,
    changeLabel: '\u22120.8 points on 2023 (31.9%)',
    period: '2024',
    updated: 'November 2026',
    source: 'World Bank',
    sourceDetail: 'World Development Indicators (exports NE.EXP.GNFS.ZS; imports NE.IMP.GNFS.ZS), 2024',
    blurb: 'Exports of goods and services were worth 31.1% of GDP in 2024, against imports of 31.8% — a trade gap of 0.7% of GDP. Both shares jumped in 2022, when energy prices spiked, and have eased since.',
    series: 'exports',
  },
  {
    id: 'debt',
    name: 'Public sector net debt',
    unit: '% of GDP',
    value: 95.8,
    valueLabel: '95.8%',
    change: 0.2,
    changeLabel: '+0.2 points on end March 2024 (95.6%)',
    period: 'end March 2025',
    updated: '23 April 2025',
    source: 'Office for National Statistics',
    sourceDetail: 'Public sector finances, UK: March 2025 (provisional estimate, 23 April 2025)',
    blurb: 'Public sector net debt excluding public sector banks stood at 95.8% of GDP — £2,814 billion — at the end of March 2025, a level last seen in the early 1960s. The public sector borrowed £152 billion in the year to March 2025.',
    fact: '£2,814 billion owed',
  },
];

// Year-on-year change for a [[year, value], ...] series. Each row keeps the
// year and the value and adds the change on the previous year (null for the
// first year, which has nothing to compare with). Two ways of measuring the
// change: 'points' is the plain difference, which is right for series that
// are already rates in percent (GDP growth, CPI, unemployment, trade
// shares); 'percent' is the percentage change, which is right for levels
// such as an index or dollars per head. Values are rounded to one decimal
// so the table never shows more precision than the source publishes.
export function yearOnYear(points, mode = 'points') {
  return points.map(([year, value], i) => {
    if (i === 0) return { year, value, change: null };
    const previous = points[i - 1][1];
    const raw = mode === 'percent' ? (100 * (value - previous)) / previous : value - previous;
    return { year, value, change: Math.round(raw * 10) / 10 };
  });
}

// The UK in the world, 2024 (World Bank, World Development Indicators;
// nominal GDP also IMF). GDP per head in pounds, nominal GDP in dollars,
// and GNI per head on the Bank's Atlas method — the three figures that put
// the headline numbers in international context on the economy page.
export const WORLD_CONTEXT = [
  { label: 'GDP per head', value: '£42,403', note: '2024, current prices' },
  { label: 'Nominal GDP', value: '$3.67 trillion', note: '2024, current US dollars' },
  { label: 'GNI per head, Atlas method', value: '$48,610', note: '2024, World Bank' },
];

// Time series, each [year, value]. Sources are authoritative and internally
// consistent; the series are used for the charts and the data tables.
export const SERIES = {
  gdpGrowth: {
    title: 'Real GDP growth',
    unit: '% per year',
    source: 'International Monetary Fund, World Economic Outlook, April 2026',
    note: 'Annual change in real (inflation-adjusted) GDP. The IMF series agrees with the ONS Blue Book 2025 for 2023 (+0.3%) and 2024 (+1.1%).',
    points: [[2015, 2.1], [2016, 2.2], [2017, 3.0], [2018, 1.6], [2019, 1.3], [2020, -10.0], [2021, 8.5], [2022, 5.2], [2023, 0.3], [2024, 1.1], [2025, 1.3]],
  },
  cpi: {
    title: 'Consumer price inflation (CPI)',
    unit: '% per year (annual average)',
    source: 'Office for National Statistics, CPI series D7BT (annual averages)',
    note: 'Annual average CPI inflation. CPI peaked at 11.1% in the 12 months to October 2022; the 2022 annual average was 9.1%.',
    points: [[2015, 0.0], [2016, 0.7], [2017, 2.7], [2018, 2.5], [2019, 1.8], [2020, 0.9], [2021, 2.6], [2022, 9.1], [2023, 7.3], [2024, 2.5], [2025, 3.4]],
  },
  cpiIndex: {
    title: 'Consumer Prices Index',
    unit: 'index, 2015 = 100 (annual average)',
    source: 'Office for National Statistics, CPI series D7BT (annual averages)',
    note: 'The CPI index, annual average, with 2015 = 100. £100 of 2015 spending cost £138.40 in 2025 on this index.',
    points: [[2015, 100.0], [2016, 100.7], [2017, 103.4], [2018, 105.9], [2019, 107.8], [2020, 108.7], [2021, 111.6], [2022, 121.7], [2023, 130.5], [2024, 133.9], [2025, 138.4]],
  },
  unemployment: {
    title: 'Unemployment rate',
    unit: '% of people aged 16 and over',
    source: 'Office for National Statistics, Labour Force Survey, series MGSX (annual)',
    note: 'Annual unemployment rate (aged 16 and over, seasonally adjusted). The ONS notes LFS estimates should be treated with caution and read with other labour market sources.',
    points: [[2015, 5.4], [2016, 4.9], [2017, 4.4], [2018, 4.1], [2019, 3.8], [2020, 4.6], [2021, 4.6], [2022, 3.8], [2023, 4.1], [2024, 4.3], [2025, 4.9]],
  },
  // GDP per head in current US dollars. The November 2026 WDI release
  // revised 2024 up to $53,341 (an earlier release gave $52,947); the
  // whole series below is the revised release, retrieved 26 November 2026.
  gdpPerCapita: {
    title: 'GDP per capita',
    unit: 'US dollars, current prices',
    source: 'World Bank, World Development Indicators, series NY.GDP.PCAP.CD',
    note: 'Nominal GDP divided by mid-year population, in current US dollars. The series moves with the exchange rate as well as with output: it fell in 2016 and 2020 even though output per head in pounds did not fall by as much.',
    points: [[2015, 45256], [2016, 41259], [2017, 40918], [2018, 43704], [2019, 43161], [2020, 40815], [2021, 47696], [2022, 47035], [2023, 49920], [2024, 53341]],
  },
  // Trade in goods and services as a share of GDP. Both series come from
  // the World Bank's World Development Indicators (national accounts data).
  exports: {
    title: 'Exports of goods and services',
    unit: '% of GDP',
    source: 'World Bank, World Development Indicators, series NE.EXP.GNFS.ZS',
    note: 'Exports of goods and services as a share of GDP. The 2022 jump reflects the spike in energy prices, which raised the value of both exports and imports.',
    points: [[2015, 27.9], [2016, 29.1], [2017, 31.0], [2018, 31.9], [2019, 31.9], [2020, 29.9], [2021, 29.3], [2022, 34.1], [2023, 31.9], [2024, 31.1]],
  },
  imports: {
    title: 'Imports of goods and services',
    unit: '% of GDP',
    source: 'World Bank, World Development Indicators, series NE.IMP.GNFS.ZS',
    note: 'Imports of goods and services as a share of GDP. Imports have exceeded exports in every year of this series, so the UK runs a trade deficit in goods and services.',
    points: [[2015, 29.2], [2016, 30.8], [2017, 32.2], [2018, 33.1], [2019, 33.1], [2020, 29.2], [2021, 29.2], [2022, 35.1], [2023, 33.1], [2024, 31.8]],
  },
};

// Projected UK population (millions). Source: ONS, 2024-based national
// population projections (28 April 2026). Projections, not forecasts; the
// population is projected to peak at 72.5 million in mid-2054.
export const PROJECTIONS = {
  title: 'UK population, projected',
  unit: 'million people',
  source: 'Office for National Statistics, 2024-based national population projections',
  points: [[2024, 69.3], [2028, 70.0], [2034, 71.0], [2049, 72.4]],
};

// Population by nation, mid-2024 (millions). Exact thousands in brackets.
// Rounded components sum to 69.2m; the UK total is 69.3m (69,281,400).
export const NATIONS = [
  { name: 'England', value: 58.6, exact: '58,620,000' },
  { name: 'Scotland', value: 5.5, exact: '5,547,000' },
  { name: 'Wales', value: 3.2, exact: '3,187,000' },
  { name: 'Northern Ireland', value: 1.9, exact: '1,928,000' },
];

// Life expectancy at birth by nation, 2022–24 (years). Source: ONS, National
// life tables, UK, 2022 to 2024.
export const LIFE_BY_NATION = [
  { name: 'England', male: 79.4, female: 83.3 },
  { name: 'Northern Ireland', male: 78.8, female: 82.6 },
  { name: 'Wales', male: 78.3, female: 82.2 },
  { name: 'Scotland', male: 77.1, female: 81.1 },
];

// The previous three-year period, 2021–23 (ONS, National life tables, UK,
// 2021 to 2023): men 78.8 years, women 82.8 years. The health page uses it
// for its change-on-previous-period column — life expectancy rose 0.3 years
// for men and 0.2 years for women between the two periods.
export const LIFE_PREVIOUS = { male: 78.8, female: 82.8 };

// GDP per head by nation, 2023, current market prices (£), with real GDP
// growth in 2023. Source: ONS, Regional economic activity by gross domestic
// product, UK: 1998 to 2023 (17 April 2025). 2023 data are provisional;
// per-head figures exclude Extra-Regio (North Sea oil and gas, embassies,
// armed forces overseas), which cannot be assigned to a nation.
export const GDP_PER_HEAD_NATIONS = [
  { name: 'England', gdpPerHead: 40382, realGrowth: 0.5, gdpBillion: 2330 },
  { name: 'Scotland', gdpPerHead: 37192, realGrowth: 0.7, gdpBillion: 204 },
  { name: 'Northern Ireland', gdpPerHead: 32944, realGrowth: 2.1, gdpBillion: 63 },
  { name: 'Wales', gdpPerHead: 29316, realGrowth: 0.6, gdpBillion: 93 },
];

// GDP per head by ITL1 region, 2023, current market prices (£), with real
// GDP growth in 2023. Same ONS source as above. London (£69,077) is more
// than twice the North East (£28,583) — the widest regional gap in the UK.
export const GDP_PER_HEAD_REGIONS = [
  { name: 'London', gdpPerHead: 69077, realGrowth: 0.2 },
  { name: 'South East', gdpPerHead: 41319, realGrowth: 0.0 },
  { name: 'East of England', gdpPerHead: 35442, realGrowth: 0.9 },
  { name: 'North West', gdpPerHead: 35635, realGrowth: 1.1 },
  { name: 'South West', gdpPerHead: 35731, realGrowth: 0.2 },
  { name: 'Yorkshire and The Humber', gdpPerHead: 32625, realGrowth: 0.2 },
  { name: 'West Midlands', gdpPerHead: 32077, realGrowth: 1.1 },
  { name: 'East Midlands', gdpPerHead: 31446, realGrowth: 0.1 },
  { name: 'North East', gdpPerHead: 28583, realGrowth: 1.7 },
];

// Public sector finances, financial year ending March 2025 (provisional).
// Source: ONS, Public sector finances, UK: March 2025 (23 April 2025).
// Net debt excludes public sector banks; net financial liabilities is the
// wider balance-sheet measure. Borrowing of £152 billion was the
// third-highest in any financial year since records began in 1946–47.
export const PUBLIC_FINANCES = {
  period: 'Financial year ending March 2025',
  source: 'Office for National Statistics, Public sector finances, UK: March 2025',
  rows: [
    { measure: 'Public sector net debt (excluding public sector banks)', value: '£2,814 billion', share: '95.8% of GDP' },
    { measure: 'Public sector net debt (excluding the Bank of England)', value: '£2,643.8 billion', share: '90.0% of GDP' },
    { measure: 'Public sector net financial liabilities', value: '£2,449 billion', share: '83.5% of GDP' },
    { measure: 'Public sector net borrowing in the year', value: '£152 billion', share: '5.3% of GDP' },
    { measure: 'Net debt ratio a year earlier (end March 2024)', value: '95.6% of GDP', share: '+0.2 points in the year' },
  ],
  note: 'Net debt was 0.2 percentage points higher than at the end of March 2024 and remains at levels last seen in the early 1960s. These are provisional estimates and will be revised.',
};

// Datasets table: name, indicator, latest value, period, source.
export const DATASETS = [
  { name: 'Mid-year population estimates', indicator: 'Population', value: '69.3 million', period: 'mid-2024', source: 'ONS' },
  { name: 'National population projections (2024-based)', indicator: 'Population', value: '71.0 million by 2034', period: '2024-based', source: 'ONS' },
  { name: 'National accounts, Blue Book 2025', indicator: 'GDP', value: '+1.1% real growth', period: '2024', source: 'ONS' },
  { name: 'Consumer price inflation', indicator: 'Prices', value: 'CPI 3.6%', period: 'October 2026', source: 'ONS' },
  { name: 'Labour market overview', indicator: 'Labour market', value: 'Unemployment 4.6%', period: 'Jul–Sep 2026', source: 'ONS' },
  { name: 'National life tables', indicator: 'Life expectancy', value: '79.1 years (men), 83.0 (women)', period: '2022–24', source: 'ONS' },
  { name: 'World Development Indicators', indicator: 'GDP per capita', value: '$53,341', period: '2024', source: 'World Bank' },
  { name: 'World Economic Outlook', indicator: 'GDP growth', value: '+1.1% in 2024', period: 'April 2026', source: 'IMF' },
  { name: 'Regional economic activity by GDP, UK: 1998 to 2023', indicator: 'Regional GDP per head', value: 'London £69,077; North East £28,583', period: '2023', source: 'ONS' },
  { name: 'Public sector finances, UK: March 2025', indicator: 'Public sector net debt', value: '95.8% of GDP', period: 'March 2025', source: 'ONS' },
  { name: 'Trade in goods and services', indicator: 'Trade', value: 'Exports 31.1% of GDP', period: '2024', source: 'World Bank' },
];

// Latest releases for the dashboard.
export const RELEASES = [
  { title: 'Consumer price inflation, UK: October 2026', detail: 'CPI rose 3.6% in the 12 months to October 2026', date: '18 November 2026', source: 'ONS' },
  { title: 'Labour market overview, UK', detail: 'Unemployment 4.6% in July to September 2026; employment rate 75.4%', date: 'November 2026', source: 'ONS' },
  { title: 'National population projections: 2024-based', detail: 'UK population projected to reach 71.0 million by mid-2034', date: '28 April 2026', source: 'ONS' },
  { title: 'National accounts at a glance (Blue Book 2025)', detail: 'Real GDP grew 1.1% in 2024; real GDP per head mostly unchanged', date: '31 October 2025', source: 'ONS' },
  { title: 'Population estimates for the UK: mid-2024', detail: 'Population reached 69.3 million, up 1.1% on mid-2023', date: '26 September 2025', source: 'ONS' },
  { title: 'National life tables, UK: 2022 to 2024', detail: 'Life expectancy 79.1 years for men and 83.0 years for women', date: '2025', source: 'ONS' },
  { title: 'Public sector finances, UK: March 2025', detail: 'Net debt 95.8% of GDP (£2,814 billion); borrowing £152 billion in the year', date: '23 April 2025', source: 'ONS' },
  { title: 'Regional economic activity by GDP, UK: 1998 to 2023', detail: 'GDP per head £69,077 in London and £28,583 in the North East', date: '17 April 2025', source: 'ONS' },
];

// Release calendar (upcoming, as announced by the source).
export const CALENDAR = [
  { release: 'Consumer price inflation, UK: November 2026', date: '16 December 2026', source: 'ONS' },
  { release: 'Labour market overview, UK', date: '15 December 2026', source: 'ONS' },
  { release: 'Mid-year population estimates: mid-2025', date: 'Summer 2026', source: 'ONS' },
];
