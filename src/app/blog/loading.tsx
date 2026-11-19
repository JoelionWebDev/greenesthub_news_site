export default function Loading() {
  return (
    <div className="wrap">
      <section className="section" aria-label="Loading blogs">
        <div className="section-head">
          {/* Plain text, not an h1: the real page already renders its own h1,
              and a second one in the streamed loading fallback would give
              every /blog URL two H1s. */}
          <p className="loading-title">All blogs 📖</p>
          <p>Loading the articles…</p>
        </div>
      </section>
    </div>
  );
}
