export default function StatsLoading() {
  return (
    <div className="wrap">
      <section className="section" aria-label="Loading statistics">
        <div className="section-head">
          {/* Loading fallback title: looks like the page h1, but is a <p> so
              the streamed page never carries two H1s. */}
          <p className="loading-title">Site Statistics 📊</p>
          <p>Loading visit counts…</p>
        </div>
      </section>
    </div>
  );
}
