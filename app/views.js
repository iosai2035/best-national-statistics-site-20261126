// UKStat views: the HTML for every page, built from the data. Every value
// is escaped before it reaches the page, and every link, button and control
// here is wired up in main.js — a page with a dead control is not shipped.
//
// How the pages are put together: the seven indicator pages share one
// shape (crumb, kicker, headline number, chart, key facts, data, sources),
// so they are built by indicatorShell below instead of each repeating the
// same scaffolding. Every chart is followed by a "View as table" button
// that reveals the same series as an accessible table — with a year-on-year
// change column — for anyone who reads tables better than charts, or uses
// a screen reader. The data tables never invent a figure: the change column
// is computed from the series itself by yearOnYear in data.js.

import { INDICATORS, SERIES, NATIONS, LIFE_BY_NATION, LIFE_PREVIOUS, DATASETS, RELEASES, CALENDAR, PROJECTIONS, GDP_PER_HEAD_NATIONS, GDP_PER_HEAD_REGIONS, PUBLIC_FINANCES, WORLD_CONTEXT, yearOnYear } from './data.js';
import { lineChart, barChart, horizontalBarChart, groupedBarChart, dumbbellChart, sparkline, fmt } from './charts.js';

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function arrow(change) {
  if (change > 0) return '<span class="arrow up" aria-hidden="true">▲</span>';
  if (change < 0) return '<span class="arrow down" aria-hidden="true">▼</span>';
  return '<span class="arrow flat" aria-hidden="true">—</span>';
}

function indicatorById(id) {
  return INDICATORS.find((d) => d.id === id);
}

// A change with its sign, for the year-on-year columns: +0.8 pts, −0.4 pts,
// +6.2%. The minus is the proper minus sign, matching the rest of the site.
function signedChange(n, suffix = '') {
  if (n > 0) return `+${fmt(Math.abs(n))}${suffix}`;
  if (n < 0) return `−${fmt(Math.abs(n))}${suffix}`;
  return `0${suffix}`;
}

// The inner markup of a table (head + body) so the same table can be used
// on its own or inside a chart's toggle panel.
function tableInner(heads, rows) {
  const head = `<thead><tr>${heads.map((h) => `<th scope="col">${escape(h)}</th>`).join('')}</tr></thead>`;
  const body = `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return head + body;
}

function dataTable(heads, rows) {
  return `<table>${tableInner(heads, rows)}</table>`;
}

// One series as a table, with a year-on-year change column. mode is
// 'points' for series already in percent and 'percent' for levels;
// formatValue prints the value cell (dollars get thousands separators).
// The inner variant returns head and body without the <table> wrapper, so
// a chart's toggle panel can add its own caption around the same table.
function seriesTableInner(points, valueHead, mode = 'points', formatValue = (v) => fmt(v)) {
  const rows = yearOnYear(points, mode).map((r) => [
    String(r.year),
    formatValue(r.value),
    r.change === null ? '—' : signedChange(r.change, mode === 'percent' ? '%' : ' pts'),
  ]);
  return tableInner(['Year', valueHead, 'Change on previous year'], rows);
}

function seriesTable(points, valueHead, mode = 'points', formatValue = (v) => fmt(v)) {
  return `<table>${seriesTableInner(points, valueHead, mode, formatValue)}</table>`;
}

// A chart with its data table tucked underneath, hidden until the visitor
// asks for it. The button names the panel it controls, and main.js flips
// both the panel and the button's pressed state. table is the table's head
// and body (see seriesTableInner); the caption names the data it holds.
function chartWithTable(chart, table, slug, caption) {
  return `${chart}
<div class="chart-table-wrap">
<button type="button" class="table-toggle" data-table-toggle="${slug}" aria-expanded="false" aria-controls="chart-table-${slug}">View as table</button>
<div class="chart-table" id="chart-table-${slug}" hidden>
<table><caption>${escape(caption)}</caption>${table}</table>
</div>
</div>`;
}

function factsList(facts) {
  return `<ul class="facts">${facts.map((f) => `<li>${f}</li>`).join('')}</ul>`;
}

// The shared shape of an indicator page. ind is the headline indicator;
// kicker and title name the section; headlineNote sits beside the big
// number; body holds the charts, facts and data; links are the "see also"
// line at the foot. The last-updated line comes from the indicator's own
// updated date, so every page says when its figures were published.
function indicatorShell(ind, kicker, title, headlineNote, body, links = '') {
  return `<p class="crumb"><a href="#/">&larr; Dashboard</a></p>
<p class="kicker">${escape(kicker)}</p>
<h1>${escape(title)}</h1>
<p class="lede">${escape(ind.blurb)}</p>
<div class="headline"><p class="headline-value">${escape(ind.valueLabel)}</p><p>${escape(headlineNote)}</p></div>
<p class="updated-line">Last updated ${escape(ind.updated)} · Source: ${escape(ind.source)}</p>
${body}
${links ? `<p>${links}</p>` : ''}`;
}

// Which page a dashboard card links to. GDP and GDP per capita both live
// on the economy page; every other indicator has a page of its own name.
const CARD_PAGES = { gdp: 'economy', earnings: 'economy' };
function cardPage(ind) {
  return CARD_PAGES[ind.id] || ind.id;
}

// One dashboard card: name, big value, change, period, and a sparkline
// where the indicator has a time series, or a fact line where it has not.
function card(ind) {
  const visual = ind.series
    ? sparkline(SERIES[ind.series].points.map((p) => p[1]), { color: '#0e7c6b' })
    : `<p class="card-fact">${escape(ind.fact)}</p>`;
  return `<article class="card">
  <h3><a href="#/${escape(cardPage(ind))}">${escape(ind.name)}</a></h3>
  <p class="card-value">${escape(ind.valueLabel)}</p>
  <p class="card-change">${arrow(ind.change)} ${escape(ind.changeLabel)}</p>
  <p class="card-period">${escape(ind.period)} · ${escape(ind.source)}</p>
  ${visual}
</article>`;
}

// One row of switcher buttons: the dashboard's series picker and its
// line/bar picker are both one of these. attr is the data attribute the
// button carries (data-series or data-chart-type); main.js listens for it.
function switcherGroup(label, options, current, attr) {
  const buttons = options.map(([key, text]) =>
    `<button type="button" ${attr}="${key}"${key === current ? ' aria-pressed="true"' : ''}>${escape(text)}</button>`).join('');
  return `<div class="chart-switch" role="group" aria-label="${escape(label)}">${buttons}</div>`;
}

// The dashboard's main chart block, for one series. main.js re-renders
// this when the visitor switches series or chart type. chartType is 'line'
// or 'bar': the same series drawn two ways, because a line shows the trend
// and bars show each year's value plainly. The table under the chart shows
// the same series with its year-on-year change.
const DASH_SERIES = [
  ['gdpGrowth', 'GDP growth', 'Real GDP growth (%)', 'points'],
  ['gdpPerCapita', 'GDP per capita', 'GDP per capita (US$)', 'percent'],
  ['cpi', 'Inflation (CPI)', 'CPI annual rate (%)', 'points'],
  ['unemployment', 'Unemployment', 'Unemployment rate (%)', 'points'],
];
const DASH_PAGES = { gdpGrowth: 'economy', gdpPerCapita: 'economy', cpi: 'prices', unemployment: 'labour' };

export function chartBlock(seriesKey, chartType = 'line') {
  const s = SERIES[seriesKey];
  const [, , valueHead, mode] = DASH_SERIES.find(([k]) => k === seriesKey);
  const formatValue = seriesKey === 'gdpPerCapita' ? (v) => v.toLocaleString('en-GB') : undefined;
  const chart = chartType === 'bar'
    ? barChart(s.points.map(([y, v]) => ({ label: String(y), value: v })), { aria: `${s.title}, ${s.points[0][0]} to ${s.points[s.points.length - 1][0]}, as bars` })
    : lineChart(s.points, { unit: seriesKey === 'gdpPerCapita' ? '' : '%', aria: `${s.title}, ${s.points[0][0]} to ${s.points[s.points.length - 1][0]}` });
  const first = s.points[0][0], last = s.points[s.points.length - 1][0];
  return `<div class="chart-head">
  <h3>${escape(s.title)}, ${escape(first)}–${escape(last)}</h3>
  <p class="chart-unit">${escape(s.unit)}</p>
</div>
${switcherGroup('Choose an indicator', DASH_SERIES.map(([k, label]) => [k, label]), seriesKey, 'data-series')}
${switcherGroup('Choose a chart type', [['line', 'Line chart'], ['bar', 'Bar chart']], chartType, 'data-chart-type')}
${chartWithTable(chart, seriesTableInner(s.points, valueHead, mode, formatValue), `dash-${seriesKey}`, `${s.title}, ${first} to ${last}`)}
<p class="chart-note">${escape(s.note)}</p>
<p class="chart-source">Source: ${escape(s.source)} · <a href="#/${DASH_PAGES[seriesKey]}">See the full indicator page</a></p>`;
}

export function dashboard() {
  const cards = INDICATORS.map(card).join('');
  const releases = RELEASES.map((r) => `<li>
  <strong>${escape(r.title)}</strong>
  <span>${escape(r.detail)}</span>
  <span class="rel-meta">${escape(r.date)} · ${escape(r.source)}</span>
</li>`).join('');
  const nations = NATIONS.map((n) => {
    const g = GDP_PER_HEAD_NATIONS.find((r) => r.name === n.name);
    return `<li><span>${escape(n.name)}</span><strong>${escape(fmt(n.value))}m · £${escape(g.gdpPerHead.toLocaleString('en-GB'))} per head</strong></li>`;
  }).join('');
  return `<section class="hero">
  <p class="kicker">United Kingdom · Updated November 2026</p>
  <h1>The United Kingdom in numbers</h1>
  <p class="lede">The headline figures for the UK economy, trade, public finances, prices, jobs, people and health — each with its source and its date, and every chart drawn from the published data.</p>
</section>
<section aria-labelledby="glance">
  <h2 id="glance">At a glance</h2>
  <div class="cards">${cards}</div>
</section>
<section aria-labelledby="trends">
  <h2 id="trends">Trends</h2>
  <div id="main-chart">${chartBlock('gdpGrowth')}</div>
</section>
<div class="two-col">
  <section aria-labelledby="releases">
    <h2 id="releases">Latest releases</h2>
    <ul class="releases">${releases}</ul>
  </section>
  <section aria-labelledby="nations">
    <h2 id="nations">Population by nation</h2>
    <p class="section-intro">Mid-2024, millions of people. The four nations sum to 69.2m after rounding; the UK total is 69.3m.</p>
    <ul class="nations">${nations}</ul>
    <p><a href="#/population">Population in full &rarr;</a> · <a href="#/nations">Compare the nations &rarr;</a></p>
  </section>
</div>`;
}

// Indicator detail pages. Each one has a large chart, key facts, a data
// table and a source note — the same structure a statistics office uses.
// The chart's table lives under the chart behind "View as table"; the
// change column in it is computed from the series, never typed by hand.
export function indicatorPage(id) {
  // #/gdp and #/earnings are aliases of the economy page, and the economy
  // page's headline indicator is GDP: there is no indicator with the id
  // 'economy', so the page looks that one up by its own id.
  const pageId = id === 'gdp' || id === 'earnings' ? 'economy' : id;
  const ind = indicatorById(pageId === 'economy' ? 'gdp' : pageId);
  if (!ind) return missing();

  if (pageId === 'economy') {
    const gdp = SERIES.gdpGrowth;
    const perHead = SERIES.gdpPerCapita;
    const worldRows = WORLD_CONTEXT.map((w) => [w.label, w.value, w.note]);
    const body = `${chartWithTable(
      lineChart(gdp.points, { unit: '%', aria: 'Real GDP growth, 2015 to 2025' }),
      seriesTableInner(gdp.points, 'Real GDP growth (%)', 'points'),
      'gdp-growth', 'Real GDP growth, 2015 to 2025')}
<p class="chart-note">${escape(gdp.note)}</p>
<h2>Key facts</h2>
${factsList([
  '<strong>£2.85 trillion</strong> — nominal GDP in 2024 (about $3.67 trillion).',
  '<strong>$53,341</strong> — GDP per head in 2024 at current prices; <strong>$62,010</strong> on a purchasing-power-parity basis (World Bank, November 2026 release).',
  '<strong>Real GDP per head was mostly unchanged in 2024</strong>, after a 1% fall in 2023 (ONS, Blue Book 2025).',
  '<strong>Nominal GDP rose 4.8% in 2024</strong>, and the GDP implied deflator rose 3.6%.',
  '<strong>Output rose a further 0.9% in the first half of 2025</strong> (ONS).',
])}
<h2>The UK in the world</h2>
${dataTable(['Measure', 'Value', 'Period'], worldRows)}
<h2>GDP per head</h2>
<p>Output per person, in current US dollars, puts the UK's growth in an international context — and shows how much of the move is the exchange rate. GDP per head was $53,341 in 2024, up from $49,920 in 2023 and above its pre-pandemic level of $43,161 in 2019.</p>
${chartWithTable(
  lineChart(perHead.points, { aria: 'GDP per capita in current US dollars, 2015 to 2024' }),
  seriesTableInner(perHead.points, 'GDP per capita (US$)', 'percent', (v) => v.toLocaleString('en-GB')),
  'gdp-per-capita', 'GDP per capita, 2015 to 2024')}
<p class="chart-note">${escape(perHead.note)}</p>
<p class="chart-source">Source: ${escape(perHead.source)} (series NY.GDP.PCAP.CD; November 2026 release, retrieved 26 November 2026).</p>
<p class="chart-source">Sources: ${escape(gdp.source)}; ONS, National accounts at a glance, Blue Book 2025; World Bank, World Development Indicators.</p>`;
    return indicatorShell(ind, 'Economy', 'Gross domestic product',
      `real GDP growth, ${ind.period} · ${ind.changeLabel}`, body,
      '<a href="#/trade">Trade in goods and services &rarr;</a> · <a href="#/debt">Public sector net debt &rarr;</a> · <a href="#/nations">Compare the nations &rarr;</a>');
  }

  if (id === 'prices') {
    const cpi = SERIES.cpi;
    const cpiRows = yearOnYear(cpi.points, 'points').map((r, i) => [
      String(r.year), fmt(r.value),
      r.change === null ? '—' : signedChange(r.change, ' pts'),
      fmt(SERIES.cpiIndex.points[i][1]),
    ]);
    const body = `${chartWithTable(
      lineChart(cpi.points, { unit: '%', aria: 'CPI annual average inflation, 2015 to 2025' }),
      tableInner(['Year', 'CPI annual rate (%)', 'Change on previous year', 'CPI index (2015 = 100)'], cpiRows),
      'cpi-annual', 'Consumer price inflation, 2015 to 2025')}
<p class="chart-note">${escape(cpi.note)}</p>
<h2>Key facts</h2>
${factsList([
  '<strong>CPIH rose 3.7%</strong> in the 12 months to October 2026; the <strong>Retail Prices Index rose 4.2%</strong>.',
  '<strong>CPI index 144.9</strong> in October 2026 (2015 = 100), up from 144.1 in September 2026.',
  '<strong>CPI peaked at 11.1%</strong> in the 12 months to October 2022; the 2022 annual average was 9.1%.',
  '<strong>£100 of 2015 spending cost £138.40 in 2025</strong> on the CPI annual-average index.',
])}
<p class="chart-source">Sources: ${escape(cpi.source)}; ONS, Consumer price inflation, UK (published 18 November 2026).</p>`;
    return indicatorShell(ind, 'Prices', 'Consumer price inflation',
      `CPI, 12 months to ${ind.period} · ${ind.changeLabel}`, body);
  }

  if (id === 'labour') {
    const u = SERIES.unemployment;
    const body = `${chartWithTable(
      lineChart(u.points, { unit: '%', aria: 'Unemployment rate, 2015 to 2025' }),
      seriesTableInner(u.points, 'Unemployment rate (%)', 'points'),
      'unemployment-annual', 'Unemployment rate, 2015 to 2025')}
<p class="chart-note">${escape(u.note)}</p>
<h2>Key facts</h2>
${factsList([
  '<strong>1.68 million people</strong> aged 16 and over were unemployed in July to September 2026.',
  '<strong>34.62 million people</strong> aged 16 and over were in employment; the <strong>employment rate was 75.4%</strong> for people aged 16 to 64.',
  '<strong>London had the highest unemployment rate (6.5%)</strong> and Northern Ireland the lowest (1.8%) in March to May 2026.',
  '<strong>Vacancies stood at 711,000</strong> in January to March 2026, below pre-pandemic levels.',
  '<strong>Labour Force Survey estimates are less reliable than usual</strong> at the moment; the ONS advises reading them with workforce jobs and PAYE data.',
])}
<p class="chart-source">Sources: ${escape(u.source)}; ONS, Labour market overview, UK; House of Commons Library, UK labour market statistics.</p>`;
    return indicatorShell(ind, 'Labour market', 'Employment and unemployment',
      `unemployment rate, ${ind.period} · ${ind.changeLabel}`, body);
  }

  if (id === 'population') {
    const nationRows = NATIONS.map((n) => [n.name, fmt(n.value), fmt((100 * n.value) / 69.3), n.exact]);
    const projectionRows = PROJECTIONS.points.map(([y, v]) => [String(y), fmt(v)]);
    const body = `${chartWithTable(
      barChart(NATIONS.map((n) => ({ label: n.name, value: n.value })), { unit: ' million', aria: 'Population by nation, mid-2024' }),
      tableInner(['Nation', 'Population (millions)', 'Share of UK (%)', 'Exact'], nationRows),
      'population-nations', 'Population by nation, mid-2024')}
<p class="chart-note">Mid-2024 population by nation, millions. Rounded components sum to 69.2m; the UK total is 69.3m (69,281,400).</p>
<h2>Where the population is heading</h2>
${chartWithTable(
  lineChart(PROJECTIONS.points, { unit: 'm', aria: 'Projected UK population, 2024 to 2049' }),
  tableInner(['Year', 'Projected population (millions)'], projectionRows),
  'population-projected', 'Projected UK population, 2024 to 2049')}
<p class="chart-note">Projected population, millions. Projections are not forecasts: they show what happens if current trends continue. The population is projected to exceed 70 million by mid-2028 and to peak at 72.5 million in mid-2054.</p>
<h2>Key facts</h2>
${factsList([
  '<strong>England 58.6 million, Scotland 5.5 million, Wales 3.2 million, Northern Ireland 1.9 million</strong> (mid-2024).',
  '<strong>Net international migration was the only source of growth</strong> in the year to mid-2024; deaths exceeded births.',
  '<strong>71.0 million by mid-2034</strong> — an increase of 1.7 million (2.5%) on mid-2024.',
  '<strong>6.4 million births and 6.8 million deaths</strong> are projected between mid-2024 and mid-2034, with 7.3 million long-term immigrants and 5.1 million emigrants.',
])}
<p class="chart-source">Sources: ONS, Population estimates for the UK, England, Wales, Scotland and Northern Ireland: mid-2024 (26 September 2025); ONS, National population projections: 2024-based (28 April 2026).</p>`;
    return indicatorShell(ind, 'People', 'Population',
      `people, ${ind.period} · ${ind.changeLabel}`, body);
  }

  if (id === 'health') {
    const lifeRows = LIFE_BY_NATION.map((r) => [r.name, fmt(r.male), fmt(r.female)]);
    const body = `${chartWithTable(
      dumbbellChart(LIFE_BY_NATION, { aria: 'Life expectancy at birth by nation, 2022 to 2024' }),
      tableInner(['Nation', 'Men (years)', 'Women (years)'], lifeRows),
      'life-by-nation', 'Life expectancy at birth by nation, 2022 to 2024')}
<p class="chart-note">Life expectancy at birth by nation, 2022–24, in years. Dots show men and women; the line between them is the gap. A dot chart is used because the values sit in a narrow range — bars from zero would hide the differences.</p>
<h2>Key facts</h2>
${factsList([
  `<strong>Life expectancy rose ${fmt(79.1 - LIFE_PREVIOUS.male)} years for men and ${fmt(83.0 - LIFE_PREVIOUS.female)} years for women</strong> on the previous period (2021–23: men ${fmt(LIFE_PREVIOUS.male)} years, women ${fmt(LIFE_PREVIOUS.female)} years).`,
  '<strong>At age 65, women could expect a further 21.2 years</strong> and men a further 18.7 years (2022–24).',
  '<strong>Healthy life expectancy was 60.7 years for men and 60.9 for women</strong> (2022–24) — the years lived in good general health.',
  '<strong>Life expectancy has barely changed in ten years</strong>, after sustained rises in earlier decades; the pandemic raised mortality in 2020–2022.',
  '<strong>The gap between places is wide:</strong> in 2021–23, male life expectancy was 73.1 years in Blackpool and 83.4 in Hart; female life expectancy was 78.9 in Blackpool and 86.5 in Kensington and Chelsea.',
])}
<p class="chart-source">Sources: ONS, National life tables, UK, 2022 to 2024; ONS, Life expectancy for local areas of Great Britain, 2021 to 2023.</p>`;
    return indicatorShell(ind, 'Health', 'Life expectancy',
      `life expectancy at birth, women, ${ind.period} · ${ind.changeLabel}`, body);
  }

  if (id === 'trade') {
    const balance = SERIES.exports.points.map(([y, v], i) => [y, v - SERIES.imports.points[i][1]]);
    const tradeRows = yearOnYear(balance, 'points').map((r, i) => [
      String(r.year),
      fmt(SERIES.exports.points[i][1]),
      fmt(SERIES.imports.points[i][1]),
      fmt(r.value),
      r.change === null ? '—' : signedChange(r.change, ' pts'),
    ]);
    const body = `${chartWithTable(
      groupedBarChart(SERIES.exports.points, SERIES.imports.points, { labelA: 'Exports', labelB: 'Imports', aria: 'Exports and imports of goods and services as a share of GDP, 2015 to 2024' }),
      tableInner(['Year', 'Exports (% of GDP)', 'Imports (% of GDP)', 'Trade balance (% of GDP)', 'Change in balance'], tradeRows),
      'trade-shares', 'Trade in goods and services, 2015 to 2024')}
<p class="chart-note">${escape(SERIES.exports.note)} ${escape(SERIES.imports.note)}</p>
<h2>Key facts</h2>
${factsList([
  '<strong>Imports were 31.8% of GDP in 2024</strong>, so the UK ran a trade deficit in goods and services of 0.7% of GDP.',
  '<strong>Both shares jumped in 2022</strong> — exports to 34.1% and imports to 35.1% of GDP — when energy prices spiked, then eased in 2023 and 2024.',
  '<strong>Exports were worth 27.9% of GDP in 2015</strong>; the share has stayed near a third of GDP for a decade.',
  '<strong>Services dominate UK exports</strong>: the UK is one of the world\u2019s largest exporters of services, led by financial and business services (ONS, UK trade in services by partner country).',
])}
<p class="chart-source">Sources: ${escape(SERIES.exports.source)}; ${escape(SERIES.imports.source)}.</p>`;
    return indicatorShell(ind, 'Economy', 'Trade in goods and services',
      `exports of goods and services, ${ind.period} · ${ind.changeLabel}`, body,
      '<a href="#/economy">Gross domestic product &rarr;</a> · <a href="#/debt">Public sector net debt &rarr;</a>');
  }

  if (id === 'debt') {
    const body = `<h2>Key facts</h2>
${factsList([
  '<strong>£2,814 billion</strong> — public sector net debt excluding public sector banks at the end of March 2025.',
  '<strong>£152 billion borrowed in the year to March 2025</strong> — the third-highest borrowing in any financial year since records began in 1946–47.',
  '<strong>Net debt excluding the Bank of England was £2,643.8 billion</strong>, or 90.0% of GDP.',
  '<strong>Net financial liabilities — the wider balance-sheet measure — were 83.5% of GDP</strong>, 12.3 points less than net debt.',
  '<strong>The ratio is provisional</strong>: it partly relies on GDP estimates from the Office for Budget Responsibility forecast, and the ONS revises it as outturn data arrive.',
])}
<h2>Data — ${escape(PUBLIC_FINANCES.period)}</h2>
${dataTable(['Measure', 'Value', 'Share of GDP'], PUBLIC_FINANCES.rows.map((r) => [r.measure, r.value, r.share]))}
<p class="chart-note">${escape(PUBLIC_FINANCES.note)}</p>
<p class="chart-source">Source: ${escape(PUBLIC_FINANCES.source)}.</p>`;
    return indicatorShell(ind, 'Public finances', 'Public sector net debt',
      `of GDP, ${ind.period} · ${ind.changeLabel}`, body,
      '<a href="#/economy">Gross domestic product &rarr;</a> · <a href="#/trade">Trade in goods and services &rarr;</a>');
  }
  return missing();
}

// CSV downloads. Each dataset that has a series behind it has a builder
// here: a file name and the text. The text is built from the same data the
// pages show, so a downloaded file can never disagree with the page. A
// dataset with no series behind it has no builder and gets no button.
function csvText(cols, rows) {
  return `${cols.join(',')}\n${rows.join('\n')}\n`;
}

const gdpGrowthCsv = () => ({
  file: 'real-gdp-growth.csv',
  text: csvText(['year', 'real_gdp_growth_percent'],
    SERIES.gdpGrowth.points.map(([y, v]) => `${y},${v.toFixed(1)}`)),
});

const CSV_FILES = {
  'Mid-year population estimates': () => ({
    file: 'population-by-nation-mid-2024.csv',
    text: csvText(['nation', 'population_millions', 'population_exact'],
      NATIONS.map((n) => `${n.name},${n.value},"${n.exact}"`)),
  }),
  'National population projections (2024-based)': () => ({
    file: 'population-projections-2024-based.csv',
    text: csvText(['year', 'population_millions'],
      PROJECTIONS.points.map(([y, v]) => `${y},${v.toFixed(1)}`)),
  }),
  'National accounts, Blue Book 2025': gdpGrowthCsv,
  'World Economic Outlook': gdpGrowthCsv,
  'Consumer price inflation': () => ({
    file: 'cpi-annual.csv',
    text: csvText(['year', 'cpi_annual_rate_percent', 'cpi_index_2015_100'],
      SERIES.cpi.points.map(([y, v], i) => `${y},${v.toFixed(1)},${SERIES.cpiIndex.points[i][1].toFixed(1)}`)),
  }),
  'Labour market overview': () => ({
    file: 'unemployment-rate.csv',
    text: csvText(['year', 'unemployment_rate_percent'],
      SERIES.unemployment.points.map(([y, v]) => `${y},${v.toFixed(1)}`)),
  }),
  'National life tables': () => ({
    file: 'life-expectancy-by-nation-2022-24.csv',
    text: csvText(['nation', 'men_years', 'women_years'],
      LIFE_BY_NATION.map((r) => `${r.name},${r.male.toFixed(1)},${r.female.toFixed(1)}`)),
  }),
  'World Development Indicators': () => ({
    file: 'gdp-per-capita-2024.csv',
    text: csvText(['indicator', 'value', 'year'], [
      'nominal GDP per capita (USD),53341,2024',
      'PPP GDP per capita (USD),62010,2024',
      'nominal GDP (USD billion),3665,2024',
    ]),
  }),
  'Regional economic activity by GDP, UK: 1998 to 2023': () => ({
    file: 'gdp-per-head-by-nation-2023.csv',
    text: csvText(['nation', 'gdp_per_head_gbp', 'real_gdp_growth_2023_percent'],
      GDP_PER_HEAD_NATIONS.map((r) => `${r.name},${r.gdpPerHead},${r.realGrowth.toFixed(1)}`)),
  }),
  'Public sector finances, UK: March 2025': () => ({
    file: 'public-sector-finances-fye-march-2025.csv',
    text: csvText(['measure', 'value', 'share_of_gdp'],
      PUBLIC_FINANCES.rows.map((r) => `"${r.measure}","${r.value}","${r.share}"`)),
  }),
  'Trade in goods and services': () => ({
    file: 'trade-share-of-gdp.csv',
    text: csvText(['year', 'exports_percent_of_gdp', 'imports_percent_of_gdp'],
      SERIES.exports.points.map(([y, v], i) => `${y},${v.toFixed(1)},${SERIES.imports.points[i][1].toFixed(1)}`)),
  }),
};

// CSV text for one dataset, or null when the dataset has no series behind it.
export function datasetCsv(name) {
  const build = CSV_FILES[name];
  return build ? build() : null;
}

// One CSV with every series on the site, in long form, for anyone who
// wants all the data at once instead of one dataset at a time.
export function allDatasetsCsv() {
  const rows = ['dataset,year_or_nation,value,unit'];
  const pushSeries = (key, points, unit) => {
    for (const [y, v] of points) rows.push(`${key},${y},${v},"${unit}"`);
  };
  for (const [key, s] of Object.entries(SERIES)) pushSeries(key, s.points, s.unit);
  pushSeries('population_projection', PROJECTIONS.points, 'million people');
  for (const n of NATIONS) rows.push(`population_by_nation,${n.name},${n.value},million people`);
  for (const r of GDP_PER_HEAD_NATIONS) rows.push(`gdp_per_head_by_nation,${r.name},${r.gdpPerHead},pounds (2023)`);
  for (const r of LIFE_BY_NATION) {
    rows.push(`life_expectancy_men,${r.name},${r.male},years (2022-24)`);
    rows.push(`life_expectancy_women,${r.name},${r.female},years (2022-24)`);
  }
  return { file: 'ukstat-all-data.csv', text: `${rows.join('\n')}\n` };
}

// One row of the datasets table. Rows outside the initial query are still
// rendered — hidden — so the live filter in main.js always has every row
// to work with. A dataset with a CSV builder gets a download button.
function datasetRow(d, visible) {
  const csv = datasetCsv(d.name);
  return `<tr${visible ? '' : ' style="display:none"'}>
  <td><strong>${escape(d.name)}</strong></td>
  <td>${escape(d.indicator)}</td>
  <td>${escape(d.value)}</td>
  <td>${escape(d.period)}</td>
  <td>${escape(d.source)}</td>
  <td>${csv ? `<button type="button" class="csv-btn" data-dataset="${escape(d.name)}">CSV</button>` : '—'}</td>
</tr>`;
}

export function datasetsPage(query) {
  const q = (query || '').trim().toLowerCase();
  const matches = (d) => !q || `${d.name} ${d.indicator} ${d.value} ${d.source}`.toLowerCase().includes(q);
  const shown = DATASETS.filter(matches).length;
  const body = DATASETS.map((d) => datasetRow(d, matches(d))).join('') +
    (shown === 0 ? `<tr class="no-results"><td colspan="6">No datasets match &ldquo;${escape(query || '')}&rdquo;. <a href="#/datasets">Show all datasets</a>.</td></tr>` : '');
  return `<p class="kicker">Datasets</p>
<h1>Datasets</h1>
<p class="lede">Every dataset behind this site, with its latest value, its period and its source. Download any of them as a CSV — the file is built in your browser from the data on this page, so it works offline.</p>
<form id="dataset-search-form" role="search">
  <label for="dataset-search">Search datasets</label>
  <input id="dataset-search" name="q" type="search" value="${escape(query || '')}" placeholder="Try “inflation”, “population” or “ONS”" autocomplete="off">
  <button type="submit">Search</button>
</form>
<p class="result-count">${shown} of ${DATASETS.length} datasets${q ? ` matching “${escape(query || '')}”` : ''}.</p>
<p><button type="button" class="csv-btn" id="download-all-btn">Download all data as one CSV</button></p>
<table class="datasets">
<thead><tr><th scope="col">Dataset</th><th scope="col">Indicator</th><th scope="col">Latest value</th><th scope="col">Period</th><th scope="col">Source</th><th scope="col">Download</th></tr></thead>
<tbody>${body}</tbody>
</table>
<p class="chart-source">Sources: Office for National Statistics, World Bank, International Monetary Fund. Each figure is cited with its source and year on its indicator page.</p>`;
}

// Nations and regions compared: population, output per head and life
// expectancy side by side, so the gaps between the four nations — and
// between London and the North East — are visible on one page. Each chart
// carries its table behind "View as table", and the full comparison table
// sits at the foot of the page.
export function nationsPage() {
  const gbp = (v) => '£' + Math.round(v).toLocaleString('en-GB');
  const byGdp = [...GDP_PER_HEAD_NATIONS].sort((a, b) => b.gdpPerHead - a.gdpPerHead);
  const byRegion = [...GDP_PER_HEAD_REGIONS].sort((a, b) => b.gdpPerHead - a.gdpPerHead);
  const life = (name) => LIFE_BY_NATION.find((r) => r.name === name);
  const gdp = (name) => GDP_PER_HEAD_NATIONS.find((r) => r.name === name);
  const nationRows = NATIONS.map((n) => {
    const g = gdp(n.name), l = life(n.name);
    return [n.name, fmt(n.value), fmt((100 * n.value) / 69.3), gbp(g.gdpPerHead), fmt(g.realGrowth), fmt(l.male), fmt(l.female)];
  });
  const gdpHeads = ['Nation', 'GDP per head, 2023 (£)', 'Real GDP growth, 2023 (%)'];
  return `<p class="kicker">Nations &amp; regions</p>
<h1>The nations and regions compared</h1>
<p class="lede">England holds 84.6% of the UK population, but output per head and life expectancy vary widely — between the four nations, and between London and the North East. Every figure below is for a stated year and source.</p>
<h2>Population by nation</h2>
${chartWithTable(
  barChart(NATIONS.map((n) => ({ label: n.name, value: n.value })), { unit: ' million', aria: 'Population by nation, mid-2024' }),
  tableInner(['Nation', 'Population (millions)', 'Share of UK (%)', 'Exact'], NATIONS.map((n) => [n.name, fmt(n.value), fmt((100 * n.value) / 69.3), n.exact])),
  'nations-population', 'Population by nation, mid-2024')}
<p class="chart-note">Mid-2024 population by nation, millions. Source: ONS, Mid-year population estimates, mid-2024.</p>
<h2>Output per head by nation</h2>
${chartWithTable(
  horizontalBarChart(byGdp.map((r) => ({ label: r.name, value: r.gdpPerHead })), { format: gbp, aria: 'GDP per head by nation, 2023' }),
  tableInner(gdpHeads, byGdp.map((r) => [r.name, gbp(r.gdpPerHead), fmt(r.realGrowth)])),
  'nations-gdp-head', 'GDP per head by nation, 2023')}
<p class="chart-note">GDP per head at current market prices, 2023, in pounds. England (£40,382) is above the UK average (£39,403); Wales (£29,316) is the lowest of the four nations. Source: ONS, Regional economic activity by gross domestic product, UK: 1998 to 2023 (17 April 2025; 2023 data provisional).</p>
<h2>Output per head by English region</h2>
${chartWithTable(
  horizontalBarChart(byRegion.map((r) => ({ label: r.name, value: r.gdpPerHead })), { format: gbp, aria: 'GDP per head by English region, 2023' }),
  tableInner(['Region', 'GDP per head, 2023 (£)', 'Real GDP growth, 2023 (%)'], byRegion.map((r) => [r.name, gbp(r.gdpPerHead), fmt(r.realGrowth)])),
  'regions-gdp-head', 'GDP per head by English region, 2023')}
<p class="chart-note">GDP per head at current market prices, 2023, in pounds. London (£69,077) is more than twice the North East (£28,583). The same ONS release notes that real GDP grew fastest in the North East in 2023 (+1.7%), ahead of London (+0.2%).</p>
<h2>Life expectancy by nation</h2>
${chartWithTable(
  dumbbellChart(LIFE_BY_NATION, { aria: 'Life expectancy at birth by nation, 2022 to 2024' }),
  tableInner(['Nation', 'Men (years)', 'Women (years)'], LIFE_BY_NATION.map((r) => [r.name, fmt(r.male), fmt(r.female)])),
  'nations-life', 'Life expectancy at birth by nation, 2022 to 2024')}
<p class="chart-note">Life expectancy at birth by nation, 2022–24, in years. The gap between England and Scotland is 2.3 years for men and 2.2 years for women. Source: ONS, National life tables, UK, 2022 to 2024.</p>
<h2>Data</h2>
${dataTable(['Nation', 'Population (millions)', 'Share of UK (%)', 'GDP per head, 2023 (£)', 'Real GDP growth, 2023 (%)', 'Life expectancy, men', 'Life expectancy, women'], nationRows)}
<p class="chart-source">Sources: ONS, Population estimates for the UK: mid-2024; ONS, Regional economic activity by gross domestic product, UK: 1998 to 2023; ONS, National life tables, UK, 2022 to 2024. Population shares use the UK total of 69.3 million.</p>
<p><a href="#/population">Population in full &rarr;</a> · <a href="#/health">Life expectancy &rarr;</a> · <a href="#/economy">Gross domestic product &rarr;</a></p>`;
}

export function aboutPage() {
  const cal = CALENDAR.map((c) => `<li><strong>${escape(c.release)}</strong> — ${escape(c.date)} · ${escape(c.source)}</li>`).join('');
  return `<p class="kicker">About</p>
<h1>About UKStat</h1>
<p class="lede">UKStat is an independent portal for the United Kingdom&rsquo;s official statistics. It brings the headline figures together in one place — the economy, trade, public finances, prices, jobs, people and health — with every figure cited to its source and its date.</p>
<h2>Where the figures come from</h2>
<p>Every figure on this site comes from one of three sources, and each page names its own:</p>
<ul class="facts">
  <li><strong>Office for National Statistics (ONS)</strong> — population, GDP, prices, labour market and life expectancy. The ONS is the UK&rsquo;s national statistical institute.</li>
  <li><strong>World Bank, World Development Indicators</strong> — GDP and GDP per capita in dollars, for comparison with other countries.</li>
  <li><strong>International Monetary Fund, World Economic Outlook (April 2026)</strong> — the annual real GDP growth series.</li>
</ul>
<p>UKStat is not affiliated with the ONS, the World Bank or the IMF, and it does not copy their branding, text or images. Figures are shown as published; where a source rounds its figures, the rounded values are shown and the rounding is noted.</p>
<h2>How to cite a figure</h2>
<p>Give the figure, the period and the source — for example: “UK population 69.3 million, mid-2024 (ONS, Mid-year population estimates)”. Each indicator page gives the full source line for its figures.</p>
<h2>Methods and notes</h2>
<ul class="facts">
  <li><strong>Real GDP growth</strong> is the annual change in inflation-adjusted GDP (chained volumes).</li>
  <li><strong>CPI</strong> is the Consumer Prices Index (all items, 2015 = 100). CPIH adds owner occupiers&rsquo; housing costs.</li>
  <li><strong>Unemployment</strong> is the Labour Force Survey rate for people aged 16 and over, seasonally adjusted. The ONS notes LFS estimates are less reliable than usual and should be read with workforce jobs and PAYE data.</li>
  <li><strong>Life expectancy</strong> is period life expectancy at birth — the average years a baby would live if the death rates of the period applied throughout life. It is not a forecast for any one person.</li>
  <li><strong>Population projections</strong> show what happens if current trends continue; they are not forecasts and do not predict policy or migration changes.</li>
  <li><strong>Trade shares</strong> are exports and imports of goods and services as a percentage of GDP, from the World Bank's World Development Indicators (national accounts data).</li>
  <li><strong>Public sector net debt</strong> excludes public sector banks and is measured against GDP at the end of the financial year; the ONS calls its first estimate provisional and revises it as outturn data arrive.</li>
  <li><strong>Regional GDP per head</strong> is GDP at current market prices divided by population, on a workplace basis, for 2023 (provisional). It excludes Extra-Regio — North Sea oil and gas, embassies and armed forces overseas — which cannot be assigned to a nation or region.</li>
</ul>
<h2>Release calendar</h2>
<ul class="facts">${cal}</ul>
<h2>This site</h2>
<p>UKStat runs entirely from its own files in your browser — no network request, no tracking, no account. It works on a desktop and on a phone. Built for the make.fun “Make the best national statistics site” bounty.</p>`;
}

export function missing() {
  return `<h1>Not found</h1>
<p>There is no page at this address. <a href="#/">Go to the dashboard</a> or <a href="#/datasets">browse the datasets</a>.</p>`;
}
