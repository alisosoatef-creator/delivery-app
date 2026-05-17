export function QuoteStrip({ state, t, compact }) {
  const quote = state.quote;
  return (
    <div className={`quote-strip ${compact ? "compact" : ""}`}>
      <span><small>{t.fare}</small><strong>{quote.fareIls} ₪</strong></span>
      <span><small>{t.distance}</small><strong>{quote.distanceKm} km</strong></span>
      <span><small>{t.eta}</small><strong>{quote.etaMinutes} min</strong></span>
    </div>
  );
}
