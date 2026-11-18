/**
 * Planting calendar — typical planting windows for Nigeria.
 * Months are 1–12. These are general guides: the exact start of the rains
 * varies by year and by place, so always confirm with your local
 * agricultural extension officer.
 */

export type PlantingEntry = {
  crop: string;
  emoji: string;
  /** Months to plant in the South (1 = January). */
  monthsSouth: number[];
  /** Months to plant in the North (1 = January). */
  monthsNorth: number[];
  harvest: string;
  tip: string;
};

export const PLANTING_DATA: PlantingEntry[] = [
  {
    crop: 'Maize',
    emoji: '🌽',
    monthsSouth: [3, 4, 8, 9],
    monthsNorth: [5, 6],
    harvest: '3–4 months after planting',
    tip: 'Plant at the start of the rains. Late maize suffers when the rains stop early.',
  },
  {
    crop: 'Cassava',
    emoji: '🌱',
    monthsSouth: [4, 5, 6, 7, 8, 9],
    monthsNorth: [5, 6, 7],
    harvest: '9–18 months after planting',
    tip: 'Plant stem cuttings at the start of the rains. Cassava tolerates poor soil.',
  },
  {
    crop: 'Yam',
    emoji: '🍠',
    monthsSouth: [2, 3, 4],
    monthsNorth: [3, 4],
    harvest: 'August – December',
    tip: 'Make the mounds before the rains start, and use clean seed yams.',
  },
  {
    crop: 'Rice (lowland)',
    emoji: '🍚',
    monthsSouth: [5, 6, 7],
    monthsNorth: [6, 7],
    harvest: 'October – December',
    tip: 'Lowland rice needs standing water. Transplant seedlings when they are 3–4 weeks old.',
  },
  {
    crop: 'Sorghum',
    emoji: '🌾',
    monthsSouth: [4, 5],
    monthsNorth: [5, 6],
    harvest: 'October – November',
    tip: 'A hardy northern crop — it handles dry weather better than maize.',
  },
  {
    crop: 'Millet',
    emoji: '🌾',
    monthsSouth: [],
    monthsNorth: [5, 6],
    harvest: 'September – October',
    tip: 'One of the earliest cereals in the far north. Needs little rain.',
  },
  {
    crop: 'Groundnut',
    emoji: '🥜',
    monthsSouth: [4, 5, 6],
    monthsNorth: [5, 6],
    harvest: 'August – October',
    tip: 'Needs well-drained, sandy soil. Harvest before the rains end.',
  },
  {
    crop: 'Cowpea (beans)',
    emoji: '🫘',
    monthsSouth: [7, 8],
    monthsNorth: [6, 7],
    harvest: '60–70 days after planting',
    tip: 'Plant after the first rains. Watch out for pod borers.',
  },
  {
    crop: 'Tomato',
    emoji: '🍅',
    monthsSouth: [10, 11, 12],
    monthsNorth: [10, 11],
    harvest: '2–3 months after planting',
    tip: 'Dry-season tomatoes earn well, but they need watering.',
  },
  {
    crop: 'Okra',
    emoji: '🥒',
    monthsSouth: [3, 4, 8, 9],
    monthsNorth: [5, 6],
    harvest: '50–60 days after planting',
    tip: 'Pick the pods every 2–3 days so they stay tender.',
  },
  {
    crop: 'Plantain',
    emoji: '🍌',
    monthsSouth: [4, 5, 6],
    monthsNorth: [5, 6],
    harvest: '12–18 months after planting',
    tip: 'Plant suckers at the start of the rains and keep the plot weeded.',
  },
  {
    crop: 'Cocoa',
    emoji: '🍫',
    monthsSouth: [3, 4, 5, 6],
    monthsNorth: [],
    harvest: 'September – January',
    tip: 'Shade young seedlings. The first real harvest takes 3–5 years.',
  },
];

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const REGIONS = ['South', 'North'] as const;
export type Region = (typeof REGIONS)[number];
