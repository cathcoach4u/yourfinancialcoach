/* IAS Board Pack — dashboard renderer
   Depends on ias-financial-model.js (must load first).
   Renders summary KPI pills and full per-business detail rows. */

function moneyRound(value) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: 'AUD', maximumFractionDigits: 0
  }).format(Math.round(value || 0));
}

const FORWARD_REVENUE = {
  general: { may: 76300, june: 153600 },
  life:    { may: 66500, june: 63850  }
};

const OUTSOURCING_ACTUALS = {
  ytd:  { revenue: 48137,  costs: 96795 },
  may:  { revenue: 18913,  costs: 21056 },
  june: { revenue: 18913,  costs: 21056 }
};

const VIABILITY_OVERRIDES = {
  general: {
    ytdCosts: 622100,
    ytdCostBreakdown: "April YTD: Xero $411,025 · Operations 50% $156,075 · Jo's salary 30% $55,000"
  },
  life: {
    ytdCosts: 584290,
    ytdCostBreakdown: "April YTD: Xero $483,215 · Operations 50% $156,075 · less $55,000"
  }
};

const BUSINESS_META = {
  general:     { name: 'General Insurance' },
  life:        { name: 'Life Insurance' },
  outsourcing: { name: 'Outsourcing' }
};

const COMMON_ASSUMPTIONS = [
  '<strong>Operations base:</strong> total operations $408,945 less Outsourcing carve-out $96,795 = $312,150. 50% allocated to each of General and Life ($156,075 each).',
  "<strong>Jo's salary split:</strong> 60% FP/Life · 30% General · 10% Outsourcing (annual salary $220,000)."
];

const ASSUMPTIONS = {
  general: [
    '<strong>Forward revenue:</strong> May $76,300 + June $153,600 = $229,900 of additional invoiced revenue expected.',
    "<strong>YTD costs ($622,100):</strong> Current Xero costs $411,025 + 50% of operations (post-carve-out) $156,075 + Jo's salary 30% share $55,000.",
    '<strong>Prior FY cost assumption:</strong> last year\'s total costs $1,701,459 are split 50/50 between General and Life ($850,730 each), since no per-business prior cost breakdown was supplied.',
    ...COMMON_ASSUMPTIONS,
    '<span class="question">Does the lead of the General team expect to end the year with the figures above? Any accounts in danger?</span>'
  ],
  life: [
    '<strong>Forward revenue:</strong> May $66,500 + June $63,850 = $130,350 of additional invoiced revenue expected.',
    '<strong>YTD costs ($584,290):</strong> Xero $483,215 + Operations 50% (post-carve-out) $156,075 − $55,000.',
    '<strong>Prior FY cost assumption:</strong> last year\'s total costs $1,701,459 are split 50/50 between General and Life ($850,730 each), since no per-business prior cost breakdown was supplied.',
    ...COMMON_ASSUMPTIONS
  ],
  outsourcing: [
    '<strong>Forward revenue:</strong> May $18,913 + June $18,913 = $37,826 of additional invoiced revenue expected.',
    '<strong>YTD costs ($96,795):</strong> Xero $49,795 + Leah 25% $25,000 + Jo 10% $22,000.',
    '<strong>25% of Leah\'s salary</strong> → $25,000 allocated to IAS Outsourcing (was previously shown as 20% / $5,000 — that figure was incorrect).',
    '<strong>10% of Jo\'s salary</strong> ($220,000) → $22,000 allocated to IAS Outsourcing.',
    'The $96,795 Outsourcing cost is carved out of total operations $408,945 before the remaining $312,150 is split 50/50 between General and Life.',
    'May and June expenses: supplied Xero figure $16,356 per month + 2-month pro-rata of Leah ($5,000) and Jo ($4,400) salary allocations = $42,112 total.',
    ...COMMON_ASSUMPTIONS
  ]
};

function profitClass(v) { return v == null ? null : (v >= 0 ? 'profit' : 'loss'); }

function metricCell(label, value, cls, breakdown) {
  if (value == null) {
    return `<div class="metric"><span>${label}</span><strong class="placeholder">—</strong></div>`;
  }
  const c = cls ? ` class="${cls}"` : '';
  if (breakdown) {
    return `<div class="metric metric--with-detail"><div class="metric-main"><span>${label}</span><strong${c}>${moneyRound(value)}</strong></div><div class="metric-breakdown">${breakdown}</div></div>`;
  }
  return `<div class="metric"><span>${label}</span><strong${c}>${moneyRound(value)}</strong></div>`;
}

function buildCard(businessKey, period, periodSub, revenue, costs, costBreakdown, growthNote) {
  const profit = (revenue == null || costs == null) ? null : revenue - costs;
  const growthHtml = growthNote ? `<div class="card-growth ${growthNote.cls}">${growthNote.text}</div>` : '';
  return `<article class="kpi-card ${businessKey}">
    <div class="kpi-head"><h3>${period}</h3>${periodSub ? `<span class="period-sub">${periodSub}</span>` : ''}</div>
    <div class="metric-row">
      ${metricCell('Revenue', revenue)}
      ${metricCell('Costs', costs, null, costBreakdown)}
      ${metricCell('Net Profit', profit, profitClass(profit))}
    </div>
    ${growthHtml}
  </article>`;
}

function growthVsPrior(currentRevenue, priorRevenue) {
  if (priorRevenue == null || priorRevenue === 0) return null;
  const pct = ((currentRevenue - priorRevenue) / priorRevenue) * 100;
  const sign = pct >= 0 ? '+' : '';
  return {
    text: `Revenue ${sign}${pct.toFixed(1)}% vs prior FY (${moneyRound(priorRevenue)})`,
    cls: pct >= 0 ? 'up' : 'down'
  };
}

function getBusinessFigures(businessKey) {
  if (businessKey === 'outsourcing') {
    const a = OUTSOURCING_ACTUALS;
    return {
      ytdRevenue: a.ytd.revenue,
      ytdCosts: a.ytd.costs,
      ytdCostBreakdown: 'April YTD: Xero $49,795 · Leah 25% $25,000 · Jo 10% $22,000',
      mayJuneRevenue: a.may.revenue + a.june.revenue,
      mayJuneCosts: a.may.costs + a.june.costs,
      mayJuneCostBreakdown: 'Xero $32,712 ($16,356 × 2 supplied) + Leah pro-rata $5,000 + Jo pro-rata $4,400'
    };
  }
  const b = getBusiness(businessKey);
  const fwd = FORWARD_REVENUE[businessKey];
  const v   = VIABILITY_OVERRIDES[businessKey];
  const ytdCosts = v && v.ytdCosts != null ? v.ytdCosts : b.costs;
  const mayJuneCosts = (ytdCosts / 10) * 2;
  return {
    ytdRevenue: b.tradingIncome,
    ytdCosts,
    ytdCostBreakdown: v ? v.ytdCostBreakdown : null,
    mayJuneRevenue: fwd.may + fwd.june,
    mayJuneCosts,
    mayJuneCostBreakdown: businessKey === 'general'
      ? 'Pro-rata from YTD $622,100 ÷ 10 × 2 (expenses fairly consistent month to month)'
      : (businessKey === 'life'
          ? 'Pro-rata from YTD $584,290 ÷ 10 × 2 (expenses fairly consistent month to month)'
          : null)
  };
}

function buildBusinessRow(businessKey) {
  const meta = BUSINESS_META[businessKey];
  const f    = getBusinessFigures(businessKey);
  const fyRevenue = f.ytdRevenue + f.mayJuneRevenue;
  const fyCosts   = f.ytdCosts   + f.mayJuneCosts;
  const prior  = PRIOR_FY_BUSINESS[businessKey];
  const growth = prior ? growthVsPrior(fyRevenue, prior.revenue) : null;

  const cardList = [];
  if (prior) cardList.push(buildCard(businessKey, 'Prior FY (last year)', 'Actual revenue', prior.revenue, prior.costs));
  cardList.push(buildCard(businessKey, 'YTD to 30 April',   '10 months actual',  f.ytdRevenue,    f.ytdCosts,    f.ytdCostBreakdown));
  cardList.push(buildCard(businessKey, 'May + June',         'Forward estimate',  f.mayJuneRevenue, f.mayJuneCosts, f.mayJuneCostBreakdown));
  cardList.push(buildCard(businessKey, 'Potential FY total', 'YTD + estimate',    fyRevenue,       fyCosts,       null, growth));

  const gridClass = cardList.length === 4 ? 'kpi-grid--four' : 'kpi-grid--three';
  const assumptionItems = ASSUMPTIONS[businessKey].map(t => `<li>${t}</li>`).join('');

  return `<section class="business-row">
    <header class="business-row__head"><h2>${meta.name}</h2></header>
    <div class="kpi-grid ${gridClass}">${cardList.join('')}</div>
    <aside class="business-assumptions ${businessKey}">
      <h3>${meta.name} — assumptions</h3>
      <ul>${assumptionItems}</ul>
    </aside>
  </section>`;
}

const PRIOR_FY = { revenue: 1703016, costs: 1701459 };
const PRIOR_FY_BUSINESS = {
  general: { revenue: 982642, costs: PRIOR_FY.costs / 2 },
  life:    { revenue: 719671, costs: PRIOR_FY.costs / 2 }
};

function buildTotalRow() {
  const keys = ['general', 'life', 'outsourcing'];
  const figs = keys.map(getBusinessFigures);
  const totals = figs.reduce((acc, f) => ({
    ytdRevenue:    acc.ytdRevenue    + (f.ytdRevenue    || 0),
    ytdCosts:      acc.ytdCosts      + (f.ytdCosts      || 0),
    mayJuneRevenue:acc.mayJuneRevenue+ (f.mayJuneRevenue|| 0),
    mayJuneCosts:  acc.mayJuneCosts  + (f.mayJuneCosts  || 0)
  }), { ytdRevenue: 0, ytdCosts: 0, mayJuneRevenue: 0, mayJuneCosts: 0 });

  const fyRevenue = totals.ytdRevenue + totals.mayJuneRevenue;
  const fyCosts   = totals.ytdCosts   + totals.mayJuneCosts;

  const bd  = (i, p) => `General ${moneyRound(figs[0][p])} · Life ${moneyRound(figs[1][p])} · Outsourcing ${moneyRound(figs[2][p])}`;
  const bdf = (i)    => `General ${moneyRound(figs[0].ytdCosts + figs[0].mayJuneCosts)} · Life ${moneyRound(figs[1].ytdCosts + figs[1].mayJuneCosts)} · Outsourcing ${moneyRound(figs[2].ytdCosts + figs[2].mayJuneCosts)}`;

  const cards = [
    buildCard('total', 'Prior FY (last year)',  'Actual full year',                PRIOR_FY.revenue, PRIOR_FY.costs),
    buildCard('total', 'YTD to 30 April',       'All businesses · 10 months actual', totals.ytdRevenue,    totals.ytdCosts,    bd(0, 'ytdCosts')),
    buildCard('total', 'May + June',             'All businesses · forward estimate', totals.mayJuneRevenue, totals.mayJuneCosts, bd(0, 'mayJuneCosts')),
    buildCard('total', 'Potential FY total',     'All businesses · YTD + estimate',   fyRevenue, fyCosts, bdf(), growthVsPrior(fyRevenue, PRIOR_FY.revenue))
  ].join('');

  return `<section class="business-row business-row--total">
    <header class="business-row__head"><h2>IAS Total — whole business</h2></header>
    <div class="kpi-grid kpi-grid--four">${cards}</div>
  </section>`;
}

function formatDollarChange(diff) {
  const sign = diff >= 0 ? '+' : '';
  return { text: `${sign}${moneyRound(diff)}`, cls: diff >= 0 ? 'pct-up' : 'pct-down' };
}

function rowChange(prior, projected, isCost) {
  if (prior == null || prior <= 0 || projected == null) return { text: 'n/a', cls: '' };
  const diff = projected - prior;
  const pct  = (diff / prior) * 100;
  const text = `${diff >= 0 ? '+' : ''}${moneyRound(diff)} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`;
  const isGood = isCost ? pct <= 0 : pct >= 0;
  return { text, cls: isGood ? 'pct-up' : 'pct-down' };
}

function netCls(v) {
  if (v == null) return '';
  return v >= 0 ? 'pct-up' : 'pct-down';
}

function buildSummaryPill(label, key, priorRevenue, projRevenue, priorCosts, projCosts) {
  const priorNet = (priorRevenue != null && priorCosts != null) ? priorRevenue - priorCosts : null;
  const projNet  = (projRevenue  != null && projCosts  != null) ? projRevenue  - projCosts  : null;
  const fmt      = v => v != null ? moneyRound(v) : '—';
  const revChange  = rowChange(priorRevenue, projRevenue, false);
  const costChange = rowChange(priorCosts,   projCosts,   true);
  const netChange  = (priorNet != null && projNet != null)
    ? formatDollarChange(projNet - priorNet)
    : { text: 'n/a', cls: '' };
  return `<article class="summary-pill ${key}" data-area="${key}">
    <header class="summary-head">
      <h3>${label}</h3>
      <button class="btn btn-navy print-btn" type="button" onclick="printArea('${key}')">Print PDF</button>
    </header>
    <table class="pill-table">
      <thead><tr><th></th><th>Last FY</th><th>Projected</th><th>Change</th></tr></thead>
      <tbody>
        <tr><th>Revenue</th>   <td>${fmt(priorRevenue)}</td><td>${fmt(projRevenue)}</td><td class="${revChange.cls}">${revChange.text}</td></tr>
        <tr><th>Costs</th>     <td>${fmt(priorCosts)}</td>  <td>${fmt(projCosts)}</td>  <td class="${costChange.cls}">${costChange.text}</td></tr>
        <tr class="net-row"><th>Net Profit</th><td class="${netCls(priorNet)}">${fmt(priorNet)}</td><td class="${netCls(projNet)}">${fmt(projNet)}</td><td class="${netChange.cls}">${netChange.text}</td></tr>
      </tbody>
    </table>
  </article>`;
}

function printArea(areaKey) {
  document.body.classList.add('printing-' + areaKey);
  window.print();
  setTimeout(() => document.body.classList.remove('printing-' + areaKey), 200);
}

function renderKpis() {
  const wrap = document.getElementById('kpiGrid');
  if (!wrap) return;
  const keys = ['general', 'life', 'outsourcing'];
  const figs = keys.map(getBusinessFigures);
  const totalFYRev  = figs.reduce((acc, f) => acc + (f.ytdRevenue    || 0) + (f.mayJuneRevenue || 0), 0);
  const totalFYCost = figs.reduce((acc, f) => acc + (f.ytdCosts      || 0) + (f.mayJuneCosts   || 0), 0);
  const priorRev  = b => PRIOR_FY_BUSINESS[b] && PRIOR_FY_BUSINESS[b].revenue;
  const priorCost = b => PRIOR_FY_BUSINESS[b] && PRIOR_FY_BUSINESS[b].costs;
  const totalPill = buildSummaryPill('IAS Total', 'total', PRIOR_FY.revenue, totalFYRev, PRIOR_FY.costs, totalFYCost);
  const businessPills = [
    buildSummaryPill('General Insurance', 'general',     priorRev('general'),     figs[0].ytdRevenue + figs[0].mayJuneRevenue, priorCost('general'),     figs[0].ytdCosts + figs[0].mayJuneCosts),
    buildSummaryPill('Life Insurance',    'life',        priorRev('life'),        figs[1].ytdRevenue + figs[1].mayJuneRevenue, priorCost('life'),        figs[1].ytdCosts + figs[1].mayJuneCosts),
    buildSummaryPill('Outsourcing',       'outsourcing', null,                    figs[2].ytdRevenue + figs[2].mayJuneRevenue, null,                    figs[2].ytdCosts + figs[2].mayJuneCosts)
  ];
  wrap.innerHTML = `
    <div class="total-row">${totalPill}</div>
    <div class="summary-grid summary-grid--three">${businessPills.join('')}</div>
  `;
}

function renderAllBusinessDetails() {
  const wrap = document.getElementById('kpiDetails');
  if (!wrap) return;
  wrap.innerHTML = buildTotalRow() + ['general', 'life', 'outsourcing'].map(buildBusinessRow).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderKpis();
  renderAllBusinessDetails();
});
