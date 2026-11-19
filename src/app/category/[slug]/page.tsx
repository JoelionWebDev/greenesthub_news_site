import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { getPostsByCategory } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import PostCard from "@/components/PostCard";

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  const url = `${SITE_URL}/category/${slug}`;
  return {
    title: `${category.name} Stories`,
    description: category.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Greennest Hub",
      url,
      title: `${category.name} | Greennest Hub`,
      description: category.description,
      images: [{ url: category.image, width: 1920, height: 1280, alt: category.name }],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const posts = getPostsByCategory(slug);
  
  return (
    <div className="wrap">
      <header className="page-head">
        <h1>
          {category.emoji} {category.name}
        </h1>
        <p>{category.description}</p>
        <Image src={category.image} alt={category.name} width={1200} height={600} priority />
      </header>
      {posts.length === 0 ? (
        <p className="empty-state">No stories in this category yet — check back soon!</p>
      ) : (
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
