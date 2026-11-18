import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Greennest Hub",
  description:
    "Greennest Hub is Nigeria and Africa's agricultural platform — farming knowledge, free tools, market prices and a farmers' community. Founded by Igono Joel, B.Sc. Agricultural Economics & Extension.",
};

export default function AboutPage() {
  return (
    <div className="wrap">
      <article className="article">
        <h1>About Greennest Hub</h1>
        <div className="article-body">
          <p>
            Greennest Hub is an agricultural platform for Nigeria and Africa — bringing farming
            innovation, practical knowledge and awareness to local farmers in villages and
            cities, and a learning home for agriculture students.
          </p>
          <h2>What you will find here</h2>
          <ul>
            <li>
              <strong>Crops</strong> — how to grow maize, cassava, yam, rice and more, well.
            </li>
            <li>
              <strong>Livestock</strong> — poultry, goats, cattle, pigs and fish farming.
            </li>
            <li>
              <strong>Farm Business &amp; Sales</strong> — how to sell your produce for a good
              price.
            </li>
            <li>
              <strong>Student Research Hub</strong> — final-year project topics, research guides
              and data.
            </li>
            <li>
              <strong>Safe Crops</strong> — harmful and non-harmful crops, carefully verified.
            </li>
            <li>
              <strong>Free farmer tools</strong> — fertilizer, planting calendar, profit and feed
              calculators, market prices, weather and unit converter.
            </li>
            <li>
              <strong>Community</strong> — ask a question or share a strange experience from
              your farm, and get answers.
            </li>
            <li>
              <strong>Animals</strong> — wild animals, domestic animals, and animals and humans
              helping each other.
            </li>
          </ul>
          <h2>Who is behind it</h2>
          <p>
            Greennest Hub was founded by <strong>Igono Joel</strong>, in Lagos, Nigeria. He
            studied <strong>Agricultural Economics and Extension</strong> at Kogi State
            University, then became a tech expert — and now he is using both skills to assist
            the local farmers who feed us.
          </p>
          <p>
            <em>Built by Joetech360.</em>
          </p>
          <h2>Our goal</h2>
          <p>
            To become one of the biggest agricultural platforms in Africa — 5,000 articles of
            farming knowledge, free tools every farmer can use, and a community where no farmer
            faces a problem alone.
          </p>
          <p>
            Want to say hello, suggest a topic, or report a mistake? Visit our{' '}
            <Link href="/contact">Contact page</Link>, or ask the farmers in our{' '}
            <Link href="/community">Community</Link>.
          </p>
        </div>
      </article>
    </div>
  );
}
