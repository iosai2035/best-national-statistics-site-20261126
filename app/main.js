// UKStat router: hash routes, rendering, and the controls (chart switcher,
// table toggles, dataset search and filter, CSV download, site search).
// Every control here does what it says; a control with no code behind it
// is not shipped.
//
//   #/                     dashboard
//   #/economy              GDP (also #/gdp, #/earnings)
//   #/prices               consumer price inflation
//   #/labour               employment and unemployment
//   #/population           population
//   #/nations              nations and regions compared
//   #/health               life expectancy
//   #/trade                trade in goods and services
//   #/debt                 public sector net debt
//   #/datasets[?q=...]     datasets, optionally filtered
//   #/about                about, sources, methods
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { dashboard, indicatorPage, nationsPage, datasetsPage, aboutPage, missing, chartBlock, datasetCsv, allDatasetsCsv } from './views.js';

const app = document.getElementById('app');
const NAV = ['economy', 'prices', 'labour', 'population', 'nations', 'health', 'trade', 'debt', 'datasets', 'about'];

// The dashboard always opens on GDP growth as a line chart, so the
// remembered switcher state resets with it.
let dashSeries = 'gdpGrowth';
let dashType = 'line';

// Route table: each route maps to the function that renders it. The query
// string is passed through (only the datasets page uses it). Aliases point
// at the same renderer, so #/gdp and #/earnings are the economy page.
const ROUTES = {
  '': () => {
    dashSeries = 'gdpGrowth';
    dashType = 'line';
    return dashboard();
  },
  economy: () => indicatorPage('economy'),
  gdp: () => indicatorPage('economy'),
  earnings: () => indicatorPage('economy'),
  prices: () => indicatorPage('prices'),
  labour: () => indicatorPage('labour'),
  population: () => indicatorPage('population'),
  nations: () => nationsPage(),
  health: () => indicatorPage('health'),
  trade: () => indicatorPage('trade'),
  debt: () => indicatorPage('debt'),
  datasets: (q) => datasetsPage(q),
  about: () => aboutPage(),
};

const TITLES = {
  economy: 'Gross domestic product',
  prices: 'Consumer price inflation',
  labour: 'Employment and unemployment',
  population: 'Population',
  nations: 'The nations and regions compared',
  health: 'Life expectancy',
  trade: 'Trade in goods and services',
  debt: 'Public sector net debt',
  datasets: 'Datasets',
  about: 'About UKStat',
};

function parseHash() {
  const raw = location.hash.replace(/^#/, '');
  const [path, query] = raw.split('?');
  const route = path.replace(/^\/+/, '').replace(/\/+$/, '');
  const params = new URLSearchParams(query || '');
  return { route, q: params.get('q') || '' };
}

function pageTitle(route) {
  const name = TITLES[route];
  return name ? `${name} | UKStat` : 'UKStat — The UK National Statistics Portal';
}

// Aliases share a nav item: #/gdp and #/earnings are the economy page.
function navRoute(route) {
  return route === 'gdp' || route === 'earnings' ? 'economy' : route;
}

function render() {
  window.__shotReady = false;
  const { route, q } = parseHash();
  const view = ROUTES[route];
  app.innerHTML = view ? view(q) : missing();
  document.title = pageTitle(navRoute(route));
  markActiveNav(route);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function markActiveNav(route) {
  const current = navRoute(route);
  document.querySelectorAll('nav a').forEach((a) => {
    const r = a.getAttribute('href').replace(/^#\//, '');
    if (r === current) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

// Chart switcher on the dashboard: re-render the chart block for the
// chosen series and move the pressed state to the chosen button. The
// chosen series and chart type are remembered here so switching one does
// not reset the other.
function redrawDashboardChart() {
  const box = document.getElementById('main-chart');
  if (box) box.innerHTML = chartBlock(dashSeries, dashType);
}

// "View as table" under a chart: reveal the chart's data table, or hide
// it again, and keep the button's label and pressed state in step.
function toggleChartTable(btn) {
  const panel = document.getElementById(`chart-table-${btn.getAttribute('data-table-toggle')}`);
  if (!panel) return;
  const opening = panel.hidden;
  panel.hidden = !opening;
  btn.setAttribute('aria-expanded', String(opening));
  btn.textContent = opening ? 'Hide table' : 'View as table';
}

// CSV download: the file is built in the browser from the data on the
// page, so it works with no network.
function downloadCsv(name) {
  const file = datasetCsv(name);
  if (!file) return;
  downloadBlob(file);
}

// Every series on the site in one file.
function downloadAllCsv() {
  downloadBlob(allDatasetsCsv());
}

function downloadBlob(file) {
  const blob = new Blob([file.text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.file;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Click handling, as a table of [selector, action]: the first selector
// that matches the clicked button wins. The download-all button is listed
// before the generic CSV button because it matches both selectors.
const CLICK_ACTIONS = [
  ['button[data-series]', (btn) => {
    dashSeries = btn.getAttribute('data-series');
    redrawDashboardChart();
  }],
  ['button[data-chart-type]', (btn) => {
    dashType = btn.getAttribute('data-chart-type');
    redrawDashboardChart();
  }],
  ['button[data-table-toggle]', (btn) => toggleChartTable(btn)],
  ['#download-all-btn', () => downloadAllCsv()],
  ['button.csv-btn', (btn) => downloadCsv(btn.getAttribute('data-dataset'))],
];

app.addEventListener('click', (event) => {
  for (const [selector, action] of CLICK_ACTIONS) {
    const btn = event.target.closest(selector);
    if (btn) {
      action(btn);
      return;
    }
  }
});

// Dataset search: live filtering as you type (rows hide and show, the
// count updates, focus stays in the box), and Enter navigates to the query
// so the filtered view is a link you can share.
app.addEventListener('input', (event) => {
  if (event.target.id !== 'dataset-search') return;
  filterDatasetRows(event.target.value);
});

app.addEventListener('submit', (event) => {
  if (event.target.id !== 'dataset-search-form') return;
  event.preventDefault();
  const q = document.getElementById('dataset-search').value.trim();
  location.hash = q ? `#/datasets?q=${encodeURIComponent(q)}` : '#/datasets';
});

function filterDatasetRows(query) {
  const q = query.trim().toLowerCase();
  const tbody = document.querySelector('table.datasets tbody');
  if (!tbody) return;
  const rows = [...tbody.querySelectorAll('tr')].filter((r) => !r.classList.contains('no-results'));
  let shown = 0;
  rows.forEach((row) => {
    const hit = !q || row.textContent.toLowerCase().includes(q);
    row.style.display = hit ? '' : 'none';
    if (hit) shown += 1;
  });
  const count = document.querySelector('.result-count');
  if (count) count.textContent = `${shown} of ${rows.length} datasets${q ? ` matching “${query.trim()}”` : ''}.`;
  // When nothing matches, say so instead of leaving an empty table; the
  // row is added and removed here, and the initial render provides it when
  // the page loads with a query that matches nothing.
  let noRow = tbody.querySelector('tr.no-results');
  if (shown === 0 && q) {
    if (!noRow) {
      noRow = document.createElement('tr');
      noRow.className = 'no-results';
      tbody.appendChild(noRow);
    }
    noRow.innerHTML = `<td colspan="6">No datasets match &ldquo;${escapeHtml(query.trim())}&rdquo;. <a href="#/datasets">Show all datasets</a>.</td>`;
  } else if (noRow) {
    noRow.remove();
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Site search in the header: go to the datasets page with the query.
const siteSearch = document.getElementById('site-search-form');
if (siteSearch) {
  siteSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    const q = document.getElementById('site-search').value.trim();
    location.hash = q ? `#/datasets?q=${encodeURIComponent(q)}` : '#/datasets';
  });
}

window.addEventListener('hashchange', render);
render();
