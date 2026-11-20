export default function MarketplaceLoading() {
  return (
    <div className="wrap">
      <section className="section" aria-label="Loading marketplace">
        <div className="section-head">
          {/* Loading fallback title: looks like the page h1, but is a <p> so
              the streamed page never carries two H1s. */}
          <p className="loading-title">Produce Marketplace 🧺</p>
          <p>Loading fresh produce…</p>
        </div>
      </section>
    </div>
  );
}
