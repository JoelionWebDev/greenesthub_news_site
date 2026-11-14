import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function Home() {
  const posts = getAllPosts();
  const latest = posts.slice(0, 6);
  return (
    <>
      <section className="hero">
        <Image
          src="/images/hero-lion.jpg"
          alt="A majestic lion standing on a green savanna hill at sunrise"
          width={1920}
          height={1280}
          priority
          className="hero-image"
        />
        <div className="hero-overlay">
          <div className="wrap hero-text">
            <h1>Greennest Hub — where every animal has a story</h1>
            <p>
              Roar with lions, trumpet with elephants, purr with cats and buzz with bees.
              Fun, true animal stories for curious kids and animal lovers.
            </p>
            <Link href="#latest" className="hero-cta">
              Start exploring 🦁
            </Link>
          </div>
        </div>
      </section>
      <section className="section wrap" aria-labelledby="explore-heading">
        <div className="section-head">
          <h2 id="explore-heading">Explore the animal world 🌍</h2>
          <p>Pick a path and meet the animals that live there.</p>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <article key={c.slug} className="category-card">
              <Link href={`/category/${c.slug}`}>
                <Image src={c.image} alt={c.name} width={800} height={500} />
              </Link>
              <div className="category-card-body">
                <h3>
                  {c.emoji}
                  {c.name}
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
      <section className="section wrap" id="latest" aria-labelledby="latest-heading">
        <div className="section-head">
          <h2 id="latest-heading">Latest stories 📖</h2>
          <p>Fresh from the jungle, the farm and the garden.</p>
        </div>
        {latest.length === 0 ? (
          <p className="empty-state">No stories yet — check back soon!</p>
        ) : (
          <div className="post-grid">
            {latest.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
