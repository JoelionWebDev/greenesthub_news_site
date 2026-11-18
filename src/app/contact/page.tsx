import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Greennest Hub",
  description:
    "Contact Greennest Hub — send a story idea, suggest a farming topic, or report a mistake.",
};

export default function ContactPage() {
  return (
    <div className="wrap">
      <article className="article">
        <h1>Contact Greennest Hub</h1>
        <div className="article-body">
          <p>
            We would love to hear from you — a story idea, a farming topic you want us to
            cover, or a mistake you spotted on the site.
          </p>
          <h2>Email us</h2>
          <p>
            <strong>info@joetech360.ng</strong>
          </p>
          <p>(That is the email for the team behind Greennest Hub.)</p>
          <h2>Have a farming question?</h2>
          <p>
            If you have a question about your crops, animals or farm business — or a strange
            experience from your farm — ask it in our{' '}
            <Link href="/community">Community</Link>. Farmers and the Greennest team answer
            there, and your question may help another farmer too.
          </p>
          <h2>Before you write</h2>
          <ul>
            <li>
              Greennest Hub teaches farming and shares animal stories. We do not sell animals
              and we cannot help with lost or sick pets — for a sick animal, please contact a
              vet near you.
            </li>
            <li>If you are under 18, please ask a parent or teacher to email us with you.</li>
            <li>We read every message and reply as soon as we can.</li>
          </ul>
        </div>
      </article>
    </div>
  );
}
