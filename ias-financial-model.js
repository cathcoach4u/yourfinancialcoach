/* IAS Board financial dashboard model — YTD April P&L, reallocations and forecast logic.
   Adapted for coach4U colour palette; all figures unchanged. */
const COLORS = {
  general: '#1E3A8A', life: '#059669', outsourcing: '#7C3AED',
  accent:  '#0D9488',
  costs: '#DC2626', shared: '#9CA3AF',
  nav: '#003366'
};

const rawData = {
  meta: { ytdMonths: 10, forecastMonths: 12, cutoff: 'April', currency: 'AUD' },
  revenue: [
    { name: 'Merchant Fee Recovery',        group: 'Trading income', general: 424.49,    insurance: 0,        life: 0 },
    { name: 'Other Income',                 group: 'Trading income', general: 214.98,    insurance: 0,        life: 0 },
    { name: 'New Business',                 group: 'Trading income', general: 77623.54,  insurance: 0,        life: 32593.82 },
    { name: 'Travel Insurance (Renewals)',  group: 'Trading income', general: 3824.98,   insurance: 0,        life: 0 },
    { name: 'Renewal Income',               group: 'Trading income', general: 693474.89, insurance: 0,        life: 0 },
    { name: 'Premium Funding',              group: 'Trading income', general: 28764.70,  insurance: 0,        life: 0 },
    { name: 'Endorsements',                 group: 'Trading income', general: 16715.05,  insurance: 0,        life: 0 },
    { name: 'Advice SOA Fee',               group: 'Trading income', general: 0,         insurance: 0,        life: 39700.00 },
    { name: 'Financial Planning (Recurring)',group: 'Trading income', general: 0,         insurance: 0,        life: 194843.26 },
    { name: 'Insurer Ongoing',              group: 'Trading income', general: 0,         insurance: 0,        life: 356021.83 },
    { name: 'Interest Income',              group: 'Shared income',  general: 0,         insurance: 518.37,   life: 0 },
    { name: 'Other Revenue',                group: 'Shared income',  general: 0,         insurance: 1109.26,  life: 0 },
    { name: 'Dividend Received',            group: 'Shared income',  general: 0,         insurance: 3219.02,  life: 0 },
    { name: 'P&L revenue reclassification', group: 'Adjustments',   general: -3275.70,  insurance: -3285.69, life: 66.67 }
  ],
  expenses: [
    { name: 'Paraplanning (Life)',          group: 'Cost of Sales',           category: 'People',      general: 0,         insurance: 0,         life: 4870.04 },
    { name: 'Accounting Fees',             group: 'Admin / Overheads',        category: 'Admin',       general: 3200.00,   insurance: 4009.08,   life: 3200.00 },
    { name: 'Bank Fees',                   group: 'Admin / Overheads',        category: 'Admin',       general: 300.00,    insurance: 338.67,    life: 300.00 },
    { name: 'Merchant Fees',               group: 'Admin / Overheads',        category: 'Admin',       general: 3281.49,   insurance: 0,         life: 0 },
    { name: 'Office Expenses',             group: 'Admin / Overheads',        category: 'Admin',       general: 1600.00,   insurance: 2568.43,   life: 1600.00 },
    { name: 'Rent',                        group: 'Admin / Overheads',        category: 'Admin',       general: 7000.00,   insurance: 13444.90,  life: 7000.00 },
    { name: 'Printing & Stationery',       group: 'Admin / Overheads',        category: 'Admin',       general: 500.00,    insurance: 434.75,    life: 500.00 },
    { name: 'Telephone & Internet',        group: 'Admin / Overheads',        category: 'Admin',       general: 2500.00,   insurance: 3774.84,   life: 2500.00 },
    { name: 'Advertising & Marketing',     group: 'Marketing',                category: 'Marketing',   general: 23000.00,  insurance: 2277.18,   life: 24000.00 },
    { name: 'Client Gifts',                group: 'Marketing',                category: 'Marketing',   general: 150.00,    insurance: 69.09,     life: 150.00 },
    { name: 'Marketing Entertainment',     group: 'Marketing',                category: 'Marketing',   general: 150.00,    insurance: 9.39,      life: 150.00 },
    { name: 'Client Workshops & Events',   group: 'Marketing',                category: 'Marketing',   general: 12000.00,  insurance: 8928.15,   life: 22000.00 },
    { name: 'Software Subscriptions',      group: 'Technology',               category: 'Technology',  general: 17000.00,  insurance: 31762.98,  life: 17000.00 },
    { name: 'Computer Hardware',           group: 'Technology',               category: 'Technology',  general: 500.00,    insurance: 770.00,    life: 500.00 },
    { name: 'Computer Software',           group: 'Technology',               category: 'Technology',  general: 40.00,     insurance: 59.91,     life: 40.00 },
    { name: 'IT Support',                  group: 'Technology',               category: 'Technology',  general: 2500.00,   insurance: 5280.00,   life: 2500.00 },
    { name: 'Wages & Salaries',            group: 'People Costs',             category: 'People',      general: 210000.00, insurance: 143992.25, life: 270000.00 },
    { name: 'Superannuation',              group: 'People Costs',             category: 'People',      general: 25000.00,  insurance: 20144.07,  life: 35000.00 },
    { name: 'Outsourced Staff',            group: 'People Costs',             category: 'People',      general: 60000.00,  insurance: 43680.49,  life: 60000.00 },
    { name: 'Training & Development',      group: 'People Costs',             category: 'People',      general: 1600.00,   insurance: 1614.10,   life: 1600.00 },
    { name: 'Income Protection',           group: 'People Costs',             category: 'People',      general: 2700.00,   insurance: 3325.73,   life: 2700.00 },
    { name: 'Additional Insurance',        group: 'People Costs',             category: 'People',      general: 1700.00,   insurance: 2350.04,   life: 1700.00 },
    { name: 'Additional Super',            group: 'People Costs',             category: 'People',      general: 500.00,    insurance: 540.03,    life: 500.00 },
    { name: 'Amenities',                   group: 'People Costs',             category: 'People',      general: 1000.00,   insurance: 1656.35,   life: 1000.00 },
    { name: 'Coaching',                    group: 'People Costs',             category: 'People',      general: 4000.00,   insurance: 3454.50,   life: 4000.00 },
    { name: 'Gifts & Bonuses',             group: 'People Costs',             category: 'People',      general: 100.00,    insurance: 82.55,     life: 100.00 },
    { name: 'Insurance',                   group: 'Insurance & Compliance',   category: 'Insurance',   general: 7000.00,   insurance: 16752.67,  life: 7000.00 },
    { name: 'Compliance',                  group: 'Insurance & Compliance',   category: 'Insurance',   general: 6000.00,   insurance: 3888.95,   life: 10000.00 },
    { name: 'Cleaning',                    group: 'Property / Utilities',     category: 'Admin',       general: 1800.00,   insurance: 2502.73,   life: 1800.00 },
    { name: 'Light, Power',                group: 'Property / Utilities',     category: 'Admin',       general: 500.00,    insurance: 707.58,    life: 500.00 },
    { name: 'International Travel',        group: 'Travel',                   category: 'Admin',       general: 7000.00,   insurance: 1825.08,   life: 7000.00 },
    { name: 'National Travel',             group: 'Travel',                   category: 'Admin',       general: 2500.00,   insurance: 2903.63,   life: 2500.00 },
    { name: 'Donations',                   group: 'Other',                    category: 'Admin',       general: 200.00,    insurance: 207.30,    life: 200.00 },
    { name: 'Currency Gains',              group: 'Other',                    category: 'Admin',       general: 40.00,     insurance: 43.87,     life: 40.00 },
    { name: 'Interest Expense',            group: 'Other',                    category: 'Admin',       general: 4500.00,   insurance: 5536.43,   life: 4500.00 },
    { name: 'Seminars & Conferences',      group: 'Other',                    category: 'Admin',       general: 3000.00,   insurance: 3254.64,   life: 3000.00 },
    { name: 'Memberships & Subscriptions', group: 'Other',                    category: 'Admin',       general: 5000.00,   insurance: 5628.30,   life: 5000.00 },
    { name: 'Motor Vehicle Expenses',      group: 'Other',                    category: 'Admin',       general: 4000.00,   insurance: 2155.86,   life: 4000.00 },
    { name: 'P&L expense reclassification',group: 'Other',                    category: 'Admin',       general: -24757.66, insurance: 130927.05, life: -68400.31 }
  ]
};

function money(value, compact = false) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: 'AUD',
    maximumFractionDigits: compact ? 0 : 2,
    notation: compact ? 'compact' : 'standard'
  }).format(value || 0);
}
function sum(items, key) { return items.reduce((total, item) => total + (item[key] || 0), 0); }
function clone(data) { return JSON.parse(JSON.stringify(data)); }

function applyAdjustments(data) {
  const adjusted = clone(data);
  adjusted.adjustments = [
    { step: 'Jo adjustment', description: 'Expense transfer from Life to General', general: 60000, life: -60000, outsourcing: 0 },
    { step: 'Outsourcing allocation', description: 'Salary carved out before shared expense split', general: 0, life: 0, outsourcing: 50000 }
  ];
  return adjusted;
}

function calculateForecast(valueOrData) {
  const months = rawData.meta.ytdMonths;
  const fullYear = rawData.meta.forecastMonths;
  if (typeof valueOrData === 'number') return (valueOrData / months) * fullYear;
  return Object.fromEntries(Object.entries(valueOrData).map(([key, value]) => [key, (value / months) * fullYear]));
}

function buildBusinessModel() {
  const data = applyAdjustments(rawData);
  const directRevenue = { general: sum(data.revenue, 'general'), life: sum(data.revenue, 'life'), outsourcing: 0 };
  const sharedRevenue = sum(data.revenue, 'insurance');
  const directCosts = { general: sum(data.expenses, 'general'), life: sum(data.expenses, 'life'), outsourcing: 0 };
  const sharedCostsBeforeCarveOut = sum(data.expenses, 'insurance');
  const outsourcingCost = 50000;
  const sharedCosts = sharedCostsBeforeCarveOut - outsourcingCost;
  const jo = 60000;
  const businesses = {
    general: {
      name: 'General', color: COLORS.general,
      tradingIncome: directRevenue.general, sharedIncome: sharedRevenue / 2, adjustmentsRevenue: 0,
      directCosts: directCosts.general, sharedCosts: sharedCosts / 2, adjustmentsCosts: jo, outsourcingCost: 0,
      sourceRevenueKey: 'general', sourceExpenseKey: 'general'
    },
    life: {
      name: 'Life', color: COLORS.life,
      tradingIncome: directRevenue.life, sharedIncome: sharedRevenue / 2, adjustmentsRevenue: 0,
      directCosts: directCosts.life, sharedCosts: sharedCosts / 2, adjustmentsCosts: -jo, outsourcingCost: 0,
      sourceRevenueKey: 'life', sourceExpenseKey: 'life'
    },
    outsourcing: {
      name: 'Outsourcing', color: COLORS.outsourcing,
      tradingIncome: 0, sharedIncome: 0, adjustmentsRevenue: 0,
      directCosts: 0, sharedCosts: 0, adjustmentsCosts: 0, outsourcingCost,
      sourceRevenueKey: null, sourceExpenseKey: null
    }
  };
  Object.values(businesses).forEach((b) => {
    b.revenue = b.tradingIncome + b.sharedIncome + b.adjustmentsRevenue;
    b.costs   = b.directCosts + b.sharedCosts + b.adjustmentsCosts + b.outsourcingCost;
    b.profit  = b.revenue - b.costs;
    b.forecastRevenue = calculateForecast(b.revenue);
    b.forecastCosts   = calculateForecast(b.costs);
    b.forecastProfit  = calculateForecast(b.profit);
  });
  const beforeProfit = (directRevenue.general + directRevenue.life + sharedRevenue) -
                       (directCosts.general + directCosts.life + sharedCostsBeforeCarveOut);
  const afterProfit = businesses.general.profit + businesses.life.profit + businesses.outsourcing.profit;
  const continuingProfit = businesses.general.profit + businesses.life.profit;
  return { data, businesses, sharedRevenue, sharedCostsBeforeCarveOut, sharedCosts,
           outsourcingCost, beforeProfit, afterProfit, continuingProfit,
           validationDelta: afterProfit - beforeProfit };
}

const model = buildBusinessModel();

function getVisibleBusinesses(selection) {
  const keys = selection === 'all' ? ['general', 'life', 'outsourcing'] : [selection];
  return keys.map((key) => model.businesses[key]);
}
function getBusiness(key) { return model.businesses[key]; }
function byGroup(items, key, column) {
  return items.reduce((acc, item) => {
    const group = item[key] || 'Other';
    acc[group] = (acc[group] || 0) + (item[column] || 0);
    return acc;
  }, {});
}
function linesFor(items, column) {
  return items.map((item) => ({
    name: item.name, group: item.group, category: item.category, value: item[column] || 0
  })).filter((item) => Math.abs(item.value) > 0.001);
}

/* Chart.js defaults — only applied when Chart.js is loaded (chart pages, not the board pack) */
if (typeof Chart !== 'undefined') {
  Chart.defaults.font.family = 'Aptos, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  Chart.defaults.color = '#888888';
  Chart.defaults.plugins.tooltip.backgroundColor = '#003366';
  if (window.ChartDataLabels) Chart.register(ChartDataLabels);
}

const labelPluginConfig = typeof Chart !== 'undefined' ? {
  color: '#333333', anchor: 'end', align: 'top', clamp: true, clip: false,
  font: { size: 10, weight: '700' },
  formatter: (v) => Math.abs(v) < 1 ? '' : money(v, true)
} : {};

function chartOptions(stacked = false) {
  return {
    responsive: true, maintainAspectRatio: false, animation: { duration: 550 },
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
      datalabels: labelPluginConfig,
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${money(ctx.parsed.y ?? ctx.parsed)}` } }
    },
    scales: {
      x: { stacked, grid: { display: false } },
      y: { stacked, ticks: { callback: (v) => money(v, true) }, grid: { color: '#EEF2F7' } }
    }
  };
}
