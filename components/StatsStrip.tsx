export default function StatsStrip() {
  return (
    <div className="stats-strip">
      <div className="container stats-strip__inner">
        <div className="stat">
          <span className="stat__num">18<sup>+</sup></span>
          <span className="stat__label">Months in business</span>
        </div>
        <span className="stat__divider" aria-hidden="true" />
        <div className="stat">
          <span className="stat__num">50<sup>+</sup></span>
          <span className="stat__label">Events covered</span>
        </div>
        <span className="stat__divider" aria-hidden="true" />
        <div className="stat stat--text">
          <span className="stat__tag">Zamboanga City&rsquo;s</span>
          <span className="stat__label">premium event photographer</span>
        </div>
      </div>
    </div>
  )
}
