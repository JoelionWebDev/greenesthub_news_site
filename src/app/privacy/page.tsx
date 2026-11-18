import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Greennest Hub",
  description:
    "Privacy Policy for Greennest Hub (greennesthub.com.ng) — what information we collect and what we do with it, in plain words.",
};

export default function PrivacyPage() {
  return (
    <div className="wrap">
      <article className="article">
        <h1>Privacy Policy</h1>
        <p className="article-meta">Last updated: 18 November 2026</p>
        <div className="article-body">
          <p>
            Greennest Hub (greennesthub.com.ng) is an agricultural platform for Nigeria and
            Africa — farming knowledge, free tools, market prices and a farmers&rsquo;
            community. This page explains what information we collect and what we do with it,
            in plain words.
          </p>
          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>We do not ask you to create an account, and we do not ask children for
              personal information.</strong>{' '}
              You can read every article and use every tool without giving us anything about
              yourself.
            </li>
            <li>
              <strong>If you ask a question in our Community</strong>, we store the name,
              location and question you type in, so it can be published and answered. Do not
              put your phone number or home address in a question — it will be visible to
              everyone.
            </li>
            <li>
              <strong>If you email us</strong>, we receive your email address and whatever you
              write in the message. We use it only to read your message and reply to you. We
              do not sell it or share it with anyone else.
            </li>
            <li>
              <strong>Basic visit information.</strong> Like most websites, our hosting provider
              may record technical details such as the pages visited and the type of device used,
              so the site keeps working well. We do not use this to identify individual visitors.
            </li>
            <li>
              <strong>Weather.</strong> When you check the weather tool, your chosen city is
              sent to the weather provider (Open-Meteo) to fetch the forecast. No account or
              personal detail is sent with it.
            </li>
          </ul>
          <h2>Cookies and adverts</h2>
          <ul>
            <li>
              This site may show adverts (for example through Google AdSense) when that is
              switched on. Advertising partners may use cookies to show adverts that fit what you
              like. You can control cookies in your browser settings.
            </li>
            <li>We do not run adverts aimed at collecting personal information from children.</li>
          </ul>
          <h2>Links to other sites</h2>
          <p>
            Some articles may link to other websites. We are not responsible for the content or
            privacy practices of those sites.
          </p>
          <h2>Parents</h2>
          <p>
            If you are a parent and you have a question about your child&rsquo;s privacy on this
            site, please email us at info@joetech360.ng and we will help.
          </p>
          <h2>Changes</h2>
          <p>If this policy changes, we will update this page and change the date at the top.</p>
        </div>
      </article>
    </div>
  );
}
