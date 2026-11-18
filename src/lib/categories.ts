export type Category = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  emoji: string;
  /** 'animals' = the original animal stories; 'farming' = the agricultural platform. */
  group: 'animals' | 'farming';
};

export const CATEGORIES: Category[] = [
  {
    slug: 'wild-animals',
    name: 'Wild Animals',
    tagline: 'Lions, elephants and friends of the wild',
    description:
      'Meet the amazing animals that live free in forests, savannas, oceans and mountains — and learn how they survive in the wild.',
    image: '/images/category-wild.jpg',
    emoji: '🦁',
    group: 'animals',
  },
  {
    slug: 'domestic-animals',
    name: 'Domestic Animals',
    tagline: 'Dogs, cats and the pets we love',
    description:
      'Our pets and farm friends live beside us every day. Discover how they think, play and show us love.',
    image: '/images/category-domestic.jpg',
    emoji: '🐶',
    group: 'animals',
  },
  {
    slug: 'animals-and-humans',
    name: 'Animals & Humans',
    tagline: 'How animals and people help each other',
    description:
      'Horses, bees, guide dogs and more — the wonderful stories of animals and humans working together.',
    image: '/images/category-humans.jpg',
    emoji: '🐴',
    group: 'animals',
  },
  {
    slug: 'crops',
    name: 'Crops',
    tagline: 'Maize, cassava, yam, rice and more — how to grow them well',
    description:
      'Practical guides for growing Nigeria and Africa’s main crops — planting, caring for the crop, pests and diseases, harvest and storage.',
    image: '/images/hero-farm.jpg',
    emoji: '🌾',
    group: 'farming',
  },
  {
    slug: 'livestock',
    name: 'Livestock',
    tagline: 'Poultry, goats, cattle, pigs and fish — raising animals that pay',
    description:
      'How to raise farm animals well — feeding, housing, health, breeding and turning livestock into steady income.',
    image: '/images/category-domestic.jpg',
    emoji: '🐄',
    group: 'farming',
  },
  {
    slug: 'farm-business',
    name: 'Farm Business & Sales',
    tagline: 'Sell your produce for a good price',
    description:
      'How to sell farm produce well — pricing, finding buyers, markets, cooperatives, packaging, transport and keeping records.',
    image: '/images/farmer-market.jpg',
    emoji: '💰',
    group: 'farming',
  },
  {
    slug: 'student-research',
    name: 'Student Research Hub',
    tagline: 'Final-year project topics, guides and data for agriculture students',
    description:
      'A learning home for agriculture students — final-year project topics and ideas, research guides, data and how to write each chapter.',
    image: '/images/category-humans.jpg',
    emoji: '🎓',
    group: 'farming',
  },
  {
    slug: 'safe-crops',
    name: 'Safe Crops',
    tagline: 'Harmful and non-harmful crops — what is safe to eat, plant and handle',
    description:
      'Which crops and plants are safe and which can harm people or animals — and how to process and handle them safely. Every article here is carefully verified.',
    image: '/images/category-wild.jpg',
    emoji: '⚠️',
    group: 'farming',
  },
  {
    slug: 'learn',
    name: 'Learn Farming',
    tagline: 'Step-by-step guides and modern methods',
    description:
      'Learn modern farming step by step — irrigation, organic farming, climate-smart farming, soil care and new ideas that work in Nigeria and Africa.',
    image: '/images/bees.jpg',
    emoji: '📖',
    group: 'farming',
  },
  {
    slug: 'news-innovation',
    name: 'News & Innovation',
    tagline: 'Agriculture news, new methods and technology for African farmers',
    description:
      'What is new in agriculture — news, new farming methods, new technology, and government programmes farmers should know about.',
    image: '/images/hero-farm.jpg',
    emoji: '📰',
    group: 'farming',
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryName(slug: string): string {
  return getCategory(slug)?.name ?? slug;
}
