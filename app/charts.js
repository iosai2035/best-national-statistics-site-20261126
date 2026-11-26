// UKStat charts: every chart is hand-built SVG — no library, no network,
// no JavaScript chart code loaded from anywhere else. Coordinates are
// computed from the data passed in, so a chart cannot display a value that
// is not in the data. Text is escaped before it reaches the SVG.
//
// The charts share two small pieces of machinery: svgFrame wraps any inner
// markup in the <svg> element with its size, role and label, and
// horizontalGrid draws the gridlines and y-axis labels for the charts that
// plot values against a vertical scale. Each chart function then only
// describes its own marks.

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Round a number to dp decimal places and drop trailing zeros, so 2.0
// prints as 2 and 2.50 as 2.5. Non-numbers print as an em dash.
export function fmt(n, dp = 1) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return v.toFixed(dp).replace(/\.0$/, '').replace(/(\.\d)0$/, '$1');
}

// The <svg> wrapper every chart shares. cls is 'chart' for the large
// charts and 'spark' for the dashboard sparklines.
function svgFrame(width, height, aria, inner, cls = 'chart') {
  const label = aria ? ` role="img" aria-label="${escape(aria)}"` : ' aria-hidden="true"';
  return `<svg viewBox="0 0 ${width} ${height}"${label} class="${cls}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}

// Gridlines plus y-axis labels for a vertical scale. y maps a data value
// to a pixel row; ticks are the values to draw; left and right are the
// plot edges. Each line carries its label at the left, right-aligned.
function horizontalGrid(y, ticks, left, right) {
  return ticks.map((t) => {
    const yy = y(t).toFixed(1);
    return `<line x1="${left}" y1="${yy}" x2="${right}" y2="${yy}" class="grid"/>` +
      `<text x="${left - 8}" y="${(+yy + 4).toFixed(1)}" class="ylab" text-anchor="end">${escape(fmt(t))}</text>`;
  }).join('');
}

// A zero line, drawn only when the plotted range crosses zero.
function zeroLine(y, left, right) {
  return `<line x1="${left}" y1="${y(0).toFixed(1)}" x2="${right}" y2="${y(0).toFixed(1)}" class="zero"/>`;
}

// Axis ticks that a reader can do arithmetic with: the step comes from
// 1, 2, 5 or 10 times a power of ten, whichever fits the span best.
function niceTicks(lo, hi, count = 5) {
  const span = hi - lo || 1;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const ticks = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) {
    ticks.push(Math.round(v * 1e6) / 1e6);
  }
  return ticks;
}

// A function that turns a data value into a pixel row between top and
// bottom (top is the smaller pixel number, as in SVG).
function yScale(lo, hi, top, bottom) {
  return (v) => bottom - ((v - lo) / (hi - lo)) * (bottom - top);
}

// Pick a plotting range for a set of values: pad by a fraction of the
// span, round outwards, and pull the bottom down to zero when the values
// are all positive and zero is close — a bar-like baseline reads better
// than a floating one.
function paddedRange(values, padFraction, includeZero) {
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (includeZero) {
    lo = Math.min(0, lo);
    hi = Math.max(0, hi);
  }
  const pad = (hi - lo || 1) * padFraction;
  lo = Math.floor(lo - pad);
  hi = Math.ceil(hi + pad);
  if (!includeZero && lo > 0 && lo < (hi - lo) * 0.25) lo = 0;
  return [lo, hi];
}

// Line chart. points is [[year, value], ...]. Negative values are handled:
// the range spans zero and a zero line is drawn (real GDP growth was
// −10.0% in 2020). The last point is filled and labelled with its value.
export function lineChart(points, opts = {}) {
  const W = 720, H = 280, L = 46, R = 14, T = 14, B = 30;
  const color = opts.color || '#0e7c6b';
  const unit = opts.unit || '';
  const values = points.map((p) => p[1]);
  const [lo, hi] = paddedRange(values, 0.12, false);
  const y = yScale(lo, hi, T, H - B);
  const x = (i) => L + (i * (W - L - R)) / Math.max(points.length - 1, 1);
  const grid = horizontalGrid(y, niceTicks(lo, hi, 5), L, W - R);
  const zero = (lo < 0 && hi > 0) ? zeroLine(y, L, W - R) : '';
  const trace = points.map((p, i) => `${x(i).toFixed(1)},${y(p[1]).toFixed(1)}`).join(' ');
  const dots = points.map((p, i) => {
    const last = i === points.length - 1;
    return `<circle cx="${x(i).toFixed(1)}" cy="${y(p[1]).toFixed(1)}" r="${last ? 5 : 3.5}" class="${last ? 'dot-last' : 'dot'}">` +
      `<title>${escape(p[0])}: ${escape(fmt(p[1]))}${escape(unit)}</title></circle>`;
  }).join('');
  const last = points[points.length - 1];
  const lastLabel = `<text x="${x(points.length - 1).toFixed(1)}" y="${(y(last[1]) - 12).toFixed(1)}" class="last-label" text-anchor="end">${escape(fmt(last[1]))}${escape(unit)}</text>`;
  const years = points.map((p, i) =>
    `<text x="${x(i).toFixed(1)}" y="${H - 8}" class="${i % 2 === 1 ? 'xlab minor' : 'xlab'}" text-anchor="middle">${escape(p[0])}</text>`).join('');
  return svgFrame(W, H, opts.aria || 'Line chart',
    grid + zero +
    `<polyline points="${trace}" class="line" style="stroke:${color}"/>` +
    dots + lastLabel + years);
}

// Vertical bar chart. items is [{label, value}]. Bars grow down from the
// zero line when a value is negative, and the value sits on top of each
// bar (or just below it, for a negative one).
export function barChart(items, opts = {}) {
  const W = 720, H = 260, L = 46, R = 14, T = 26, B = 30;
  const color = opts.color || '#0e7c6b';
  const unit = opts.unit || '';
  const [lo, hi] = paddedRange(items.map((d) => d.value), 0.08, true);
  const y = yScale(lo, hi, T, H - B);
  const grid = horizontalGrid(y, niceTicks(lo, hi, 4), L, W - R);
  const zero = (lo < 0 && hi > 0) ? zeroLine(y, L, W - R) : '';
  const slot = (W - L - R) / items.length;
  const bw = Math.min(84, slot * 0.58);
  const bars = items.map((d, i) => {
    const cx = L + slot * i + slot / 2;
    const top = y(Math.max(d.value, 0)).toFixed(1);
    const height = Math.abs(y(d.value) - y(0)).toFixed(1);
    const labelY = d.value >= 0 ? (y(d.value) - 8).toFixed(1) : (y(d.value) + 16).toFixed(1);
    return `<rect x="${(cx - bw / 2).toFixed(1)}" y="${top}" width="${bw.toFixed(1)}" height="${height}" rx="3" fill="${color}">` +
      `<title>${escape(d.label)}: ${escape(fmt(d.value))}${escape(unit)}</title></rect>` +
      `<text x="${cx.toFixed(1)}" y="${labelY}" class="bar-label" text-anchor="middle">${escape(fmt(d.value))}</text>` +
      `<text x="${cx.toFixed(1)}" y="${H - 8}" class="xlab" text-anchor="middle">${escape(d.label)}</text>`;
  }).join('');
  return svgFrame(W, H, opts.aria || 'Bar chart', grid + zero + bars);
}

// Horizontal bar chart: one row per item, label on the left, value at the
// end of the bar. The right choice when labels are long (region names) or
// the values span a wide range — a vertical chart would squeeze the labels,
// and a bar from zero is honest here because every value is positive and
// the axis starts at zero. items is [{label, value}]; the caller sorts.
export function horizontalBarChart(items, opts = {}) {
  // The left gutter fits the longest label ("Yorkshire and The Humber",
  // about 190px at 13px) so no label is cut off at the left edge.
  const rowH = 36, L = 200, R = 76, T = 12, B = 10;
  const W = 720, H = T + items.length * rowH + B;
  const color = opts.color || '#0e7c6b';
  const format = opts.format || ((v) => fmt(v));
  const hi = Math.ceil(Math.max(...items.map((d) => d.value)) * 1.08);
  const x = (v) => L + (v / hi) * (W - L - R);
  const rows = items.map((d, i) => {
    const cy = T + i * rowH + rowH / 2;
    const width = Math.max(x(d.value) - L, 2).toFixed(1);
    return `<text x="${L - 10}" y="${(cy + 4).toFixed(1)}" class="row-label" text-anchor="end">${escape(d.label)}</text>` +
      `<rect x="${L}" y="${(cy - 10).toFixed(1)}" width="${width}" height="20" rx="3" fill="${color}">` +
      `<title>${escape(d.label)}: ${escape(format(d.value))}</title></rect>` +
      `<text x="${(x(d.value) + 8).toFixed(1)}" y="${(cy + 4).toFixed(1)}" class="hbar-value">${escape(format(d.value))}</text>`;
  }).join('');
  return svgFrame(W, H, opts.aria || 'Horizontal bar chart', rows);
}

// Grouped bar chart: two series side by side for each year, so two shares
// can be compared year by year. seriesA and seriesB are [[year, value]].
// The colours are fixed (teal for the first series, navy for the second)
// and named in the legend, so the chart reads without the page text.
export function groupedBarChart(seriesA, seriesB, opts = {}) {
  const W = 720, H = 280, L = 46, R = 14, T = 34, B = 30;
  const colorA = opts.colorA || '#0e7c6b';
  const colorB = opts.colorB || '#10233f';
  const labelA = opts.labelA || 'Series A';
  const labelB = opts.labelB || 'Series B';
  const all = [...seriesA, ...seriesB].map((p) => p[1]);
  const hi = Math.ceil(Math.max(...all) * 1.08);
  const y = yScale(0, hi, T, H - B);
  const grid = horizontalGrid(y, niceTicks(0, hi, 4), L, W - R);
  const slot = (W - L - R) / seriesA.length;
  const bw = Math.min(26, slot * 0.36);
  const pair = (year, value, bx, color, label) =>
    `<rect x="${bx.toFixed(1)}" y="${y(value).toFixed(1)}" width="${bw.toFixed(1)}" height="${(H - B - y(value)).toFixed(1)}" rx="2" fill="${color}">` +
    `<title>${escape(year)}, ${escape(label)}: ${escape(fmt(value))}% of GDP</title></rect>`;
  const bars = seriesA.map((p, i) => {
    const cx = L + slot * i + slot / 2;
    return pair(p[0], p[1], cx - bw - 1.5, colorA, labelA) +
      pair(p[0], seriesB[i][1], cx + 1.5, colorB, labelB) +
      `<text x="${cx.toFixed(1)}" y="${H - 8}" class="xlab" text-anchor="middle">${escape(p[0])}</text>`;
  }).join('');
  // The legend entries sit far enough apart that a long series name (up to
  // about 30 characters) cannot run into the next one.
  const legend = `<text x="${L}" y="16" class="legend-f">■ ${escape(labelA)}</text>` +
    `<text x="${L + 280}" y="16" class="legend-m">■ ${escape(labelB)}</text>`;
  return svgFrame(W, H, opts.aria || 'Grouped bar chart', legend + grid + bars);
}

// Dumbbell chart: two dots (men, women) joined by a line, one row per
// nation, on a shared axis. Honest for values in a narrow range — bars
// from zero would hide the differences. rows is [{label, male, female}].
export function dumbbellChart(rows, opts = {}) {
  const W = 720, rowH = 44, L = 150, R = 46, T = 26, B = 28;
  const H = T + rows.length * rowH + B;
  const all = rows.flatMap((r) => [r.male, r.female]);
  const lo = Math.floor(Math.min(...all) - 1);
  const hi = Math.ceil(Math.max(...all) + 1);
  const x = (v) => L + ((v - lo) / (hi - lo)) * (W - L - R);
  const grid = niceTicks(lo, hi, 5).map((t) => {
    const xx = x(t).toFixed(1);
    return `<line x1="${xx}" y1="${T - 8}" x2="${xx}" y2="${H - B}" class="grid-v"/>` +
      `<text x="${xx}" y="${H - 8}" class="xlab" text-anchor="middle">${escape(fmt(t, 0))}</text>`;
  }).join('');
  const head = `<text x="${x(rows[0].female) + 10}" y="${T - 12}" class="legend-f">● Women</text>` +
    `<text x="${x(rows[0].male) - 10}" y="${T - 12}" class="legend-m" text-anchor="end">● Men</text>`;
  const body = rows.map((r, i) => {
    const cy = T + i * rowH + rowH / 2;
    const xm = x(r.male).toFixed(1), xf = x(r.female).toFixed(1);
    return `<text x="${L - 12}" y="${(cy + 4).toFixed(1)}" class="row-label" text-anchor="end">${escape(r.label)}</text>` +
      `<line x1="${xm}" y1="${cy}" x2="${xf}" y2="${cy}" class="dumbbell-line"/>` +
      `<circle cx="${xm}" cy="${cy}" r="6" class="dot-m"><title>${escape(r.label)}, men: ${escape(fmt(r.male))} years</title></circle>` +
      `<circle cx="${xf}" cy="${cy}" r="6" class="dot-f"><title>${escape(r.label)}, women: ${escape(fmt(r.female))} years</title></circle>` +
      `<text x="${xm}" y="${(cy - 11).toFixed(1)}" class="dot-label" text-anchor="middle">${escape(fmt(r.male))}</text>` +
      `<text x="${xf}" y="${(cy - 11).toFixed(1)}" class="dot-label" text-anchor="middle">${escape(fmt(r.female))}</text>`;
  }).join('');
  return svgFrame(W, H, opts.aria || 'Dumbbell chart', grid + head + body);
}

// Sparkline: a tiny line chart with no axes, for the dashboard cards. The
// frame helper is used with the 'spark' class and no accessible label —
// the card's text already says the figure, so the sparkline is decorative.
export function sparkline(values, opts = {}) {
  const W = 120, H = 36;
  const color = opts.color || '#0e7c6b';
  const lo = Math.min(...values), hi = Math.max(...values);
  const span = hi - lo || 1;
  const x = (i) => 2 + (i * (W - 4)) / Math.max(values.length - 1, 1);
  const y = (v) => 3 + (1 - (v - lo) / span) * (H - 6);
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last = values[values.length - 1];
  const inner = `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<circle cx="${x(values.length - 1).toFixed(1)}" cy="${y(last).toFixed(1)}" r="3" fill="${color}"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="spark" aria-hidden="true" preserveAspectRatio="none">${inner}</svg>`;
}
