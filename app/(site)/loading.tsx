export default function SiteLoading() {
  return (
    <main className="ps-loading-page" aria-busy="true" aria-label="Loading PushStream content">
      <section className="ps-loading-hero">
        <div className="ps-container ps-loading-hero-inner">
          <div>
            <div className="ps-skeleton ps-loading-eyebrow" />
            <div className="ps-skeleton ps-loading-title" />
            <div className="ps-skeleton ps-loading-title ps-loading-title-short" />
            <div className="ps-skeleton ps-loading-copy" />
            <div className="ps-skeleton ps-loading-copy ps-loading-copy-short" />
          </div>
          <div className="ps-skeleton ps-loading-visual" />
        </div>
      </section>
      <section className="ps-section">
        <div className="ps-container">
          <div className="ps-loading-grid">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="ps-loading-card ps-card" key={index}>
                <div className="ps-skeleton ps-loading-card-media" />
                <div className="ps-skeleton ps-loading-card-line" />
                <div className="ps-skeleton ps-loading-card-line ps-loading-card-line-short" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
