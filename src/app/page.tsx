import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import MarketStrip from "@/components/MarketStrip";
import WeatherStrip from "@/components/WeatherStrip";

const TOOLS = [
  {
    href: '/tools/fertilizer-calculator',
    emoji: '🧪',
    name: 'Fertilizer Calculator',
    tagline: 'How many bags of fertilizer your land needs.',
  },
  {
    href: '/tools/planting-calendar',
    emoji: '📅',
    name: 'Planting Calendar',
    tagline: 'When to plant each crop, North and South.',
  },
  {
    href: '/tools/profit-calculator',
    emoji: '💵',
    name: 'Profit Calculator',
    tagline: 'Will your harvest make money? Find out first.',
  },
  {
    href: '/tools/feed-calculator',
    emoji: '🐔',
    name: 'Feed Calculator',
    tagline: 'How much feed your birds and goats need.',
  },
  {
    href: '/tools/market-prices',
    emoji: '📈',
    name: 'Market Prices',
    tagline: "Today's prices for rice, maize, garri and more.",
  },
  {
    href: '/tools/weather',
    emoji: '🌦️',
    name: 'Farm Weather',
    tagline: 'Rain, sun and wind for your area, 5 days ahead.',
  },
  {
    href: '/tools/unit-converter',
    emoji: '📏',
    name: 'Unit Converter',
    tagline: 'Hectares, acres, plots, bags and kilos — converted.',
  },
];

export default function Home() {
  const posts = getAllPosts();
  const latest = posts.slice(0, 5);
  const farming = CATEGORIES.filter((c) => c.group === 'farming');
  const animals = CATEGORIES.filter((c) => c.group === 'animals');

  return (
    <>
      <section className="hero">
        <Image
          src="/images/hero-farm.jpg"
          alt="A Nigerian farmer standing in a maize field at sunrise"
          width={1920}
          height={1280}
          priority
          className="hero-image"
        />
        <div className="hero-overlay">
          <div className="wrap hero-text">
            <h1>Greennest Hub — farming knowledge, tools and market prices for Nigeria and Africa</h1>
            <p>
              Learn modern farming, use free tools, check market prices and weather, and ask
              farmers&rsquo; questions — for village and city farmers, and agriculture students.
            </p>
            <div className="hero-cta-row">
              <Link href="/tools" className="hero-cta">
                Use free tools 🧰
              </Link>
              <Link href="/community" className="hero-cta hero-cta-secondary">
                Ask a question 💬
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketStrip />
      <WeatherStrip />

      <section className="section wrap" id="latest" aria-labelledby="latest-heading">
        <div className="section-head">
          <h2 id="latest-heading">Newest blogs 📖</h2>
          <p>The latest 5 articles — fresh from the farm, the forest and the market.</p>
        </div>
        {latest.length === 0 ? (
          <p className="empty-state">No stories yet — check back soon!</p>
        ) : (
          <div className="post-grid">
            {latest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="section wrap" aria-labelledby="tools-heading">
        <div className="section-head">
          <h2 id="tools-heading">Free farmer tools 🧰</h2>
          <p>Built for daily farm work. Free to use, no account needed.</p>
        </div>
        <div className="tools-grid">
          {TOOLS.map((t) => (
            <article key={t.href} className="tool-card">
              <Link href={t.href}>
                <span className="tool-card-emoji" aria-hidden="true">
                  {t.emoji}
                </span>
                <h3>{t.name}</h3>
                <p>{t.tagline}</p>
                <span className="category-card-link">Open tool →</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap" aria-labelledby="farming-heading">
        <div className="section-head">
          <h2 id="farming-heading">Learn farming 🌾</h2>
          <p>Crops, livestock, selling your produce, research help and more.</p>
        </div>
        <div className="category-grid">
          {farming.map((c) => (
            <article key={c.slug} className="category-card">
              <Link href={`/category/${c.slug}`}>
                <Image src={c.image} alt={c.name} width={800} height={500} />
              </Link>
              <div className="category-card-body">
                <h3>
                  {c.emoji} {c.name}
                </h3>
                <p>{c.tagline}</p>
                <Link href={`/category/${c.slug}`} className="category-card-link">
                  Start learning →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap" aria-labelledby="community-heading">
        <div className="section-head">
          <h2 id="community-heading">Farmers&rsquo; questions &amp; strange experiences 💬</h2>
          <p>
            A sick crop, a strange animal, a market problem — ask it here and farmers and the
            Greennest team will answer.
          </p>
        </div>
        <div className="community-teaser">
          <p>
            Every farmer has seen something strange on the farm. Share it — someone else has
            probably seen it too.
          </p>
          <Link href="/community" className="btn btn-primary">
            Visit the community →
          </Link>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="animals-heading">
        <div className="section-head">
          <h2 id="animals-heading">Explore the animal world 🌍</h2>
          <p>Wild animals, domestic animals, and animals and humans helping each other.</p>
        </div>
        <div className="category-grid">
          {animals.map((c) => (
            <article key={c.slug} className="category-card">
              <Link href={`/category/${c.slug}`}>
                <Image src={c.image} alt={c.name} width={800} height={500} />
              </Link>
              <div className="category-card-body">
                <h3>
                  {c.emoji} {c.name}
                </h3>
                <p>{c.tagline}</p>
                <Link href={`/category/${c.slug}`} className="category-card-link">
                  Meet the animals →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap founder" aria-labelledby="founder-heading">
        <div className="founder-inner">
          <div>
            <h2 id="founder-heading">Why Greennest Hub exists 🌱</h2>
            <p>
              Greennest Hub was founded by <strong>Igono Joel</strong>. He studied Agricultural
              Economics and Extension at university, then became a tech expert — and now he is
              using both skills to help local farmers in villages and cities across Nigeria and
              Africa.
            </p>
            <p>
              This platform brings farming innovation, practical knowledge and awareness to the
              people who feed us — and gives agriculture students a place to learn and find
              material for their final-year projects and research.
            </p>
            <Link href="/about" className="category-card-link">
              Read our story →
            </Link>
          </div>
          <div className="stats-row">
            <div className="stat">
              <strong>{posts.length}+</strong>
              <span>articles published</span>
            </div>
            <div className="stat">
              <strong>7</strong>
              <span>free farmer tools</span>
            </div>
            <div className="stat">
              <strong>10</strong>
              <span>sections to explore</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
