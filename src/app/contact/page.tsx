import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Greennest Hub — send a story idea, suggest a farming topic, or report a mistake. We reply to farmers' messages and fix errors fast.",
  alternates: { canonical: `${SITE_URL}/contact` },
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
          <h2>Chat with the developer on WhatsApp</h2>
          <p>
            The fastest way to reach the developer, Igono Joel, is on WhatsApp —{' '}
            <strong>08167099131</strong>.
          </p>
          <p>
            <Link
              className="btn btn-primary"
              href="https://wa.me/2348167099131?text=Hello%20Joel%2C%20I%20have%20a%20question%20about%20Greennest%20Hub"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp →
            </Link>
          </p>
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
