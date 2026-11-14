export type Category = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  emoji: string;
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
  },
  {
    slug: 'domestic-animals',
    name: 'Domestic Animals',
    tagline: 'Dogs, cats and the pets we love',
    description:
      'Our pets and farm friends live beside us every day. Discover how they think, play and show us love.',
    image: '/images/category-domestic.jpg',
    emoji: '🐶',
  },
  {
    slug: 'animals-and-humans',
    name: 'Animals & Humans',
    tagline: 'How animals and people help each other',
    description:
      'Horses, bees, guide dogs and more — the wonderful stories of animals and humans working together.',
    image: '/images/category-humans.jpg',
    emoji: '🐴',
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryName(slug: string): string {
  return getCategory(slug)?.name ?? slug;
}
