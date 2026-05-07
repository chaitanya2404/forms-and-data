export const DEPARTMENTS = ["IT", "HR", "Facilities", "Procurement"] as const;
export type Department = (typeof DEPARTMENTS)[number];

export type MonthlyRow = {
  month: string;
  IT: number;
  HR: number;
  Facilities: number;
  Procurement: number;
};

// 12 months of mock page-view counts ending May 2026.
// Numbers were hand-picked to show seasonality (December dip, spring recovery)
// and an upward trend on IT, with HR and Procurement growing more modestly.
export const MONTHLY_DATA: MonthlyRow[] = [
  { month: "Jun '25", IT: 4200, HR: 3100, Facilities: 2400, Procurement: 2900 },
  { month: "Jul '25", IT: 4400, HR: 3000, Facilities: 2500, Procurement: 3000 },
  { month: "Aug '25", IT: 4800, HR: 3200, Facilities: 2300, Procurement: 3100 },
  { month: "Sep '25", IT: 5200, HR: 3500, Facilities: 2600, Procurement: 3400 },
  { month: "Oct '25", IT: 5600, HR: 3700, Facilities: 2700, Procurement: 3500 },
  { month: "Nov '25", IT: 5300, HR: 3500, Facilities: 2400, Procurement: 3300 },
  { month: "Dec '25", IT: 4900, HR: 3000, Facilities: 2200, Procurement: 2800 },
  { month: "Jan '26", IT: 5800, HR: 3900, Facilities: 2900, Procurement: 3700 },
  { month: "Feb '26", IT: 6100, HR: 4100, Facilities: 3000, Procurement: 3900 },
  { month: "Mar '26", IT: 6400, HR: 4300, Facilities: 3100, Procurement: 4100 },
  { month: "Apr '26", IT: 6700, HR: 4500, Facilities: 3200, Procurement: 4300 },
  { month: "May '26", IT: 7000, HR: 4700, Facilities: 3300, Procurement: 4600 },
];

export const CATEGORIES = [
  "Forms",
  "Help docs",
  "Reports",
  "Dashboards",
  "Knowledge base",
] as const;
export type Category = (typeof CATEGORIES)[number];

// Approximate share of each page category across the site. Used to break down
// total filtered views into a category mix for the pie chart.
export const CATEGORY_SHARES: Record<Category, number> = {
  Forms: 0.32,
  "Help docs": 0.24,
  Reports: 0.2,
  Dashboards: 0.15,
  "Knowledge base": 0.09,
};

export const DEPARTMENT_COLORS: Record<Department, string> = {
  IT: "#1d4ed8",
  HR: "#047857",
  Facilities: "#b45309",
  Procurement: "#be123c",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  Forms: "#1d4ed8",
  "Help docs": "#047857",
  Reports: "#b45309",
  Dashboards: "#be123c",
  "Knowledge base": "#7c3aed",
};
