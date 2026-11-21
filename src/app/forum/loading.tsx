export default function ForumLoading() {
  return (
    <div className="wrap">
      <section className="section" aria-label="Loading forum">
        <div className="section-head">
          {/* Loading fallback title: looks like the page h1, but is a <p> so
              the streamed page never carries two H1s. */}
          <p className="loading-title">Farmers Forum 💬</p>
          <p>Loading topics…</p>
        </div>
      </section>
    </div>
  );
}
