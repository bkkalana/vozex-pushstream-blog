import { Star } from "lucide-react";

export function RatingStars({ value, outOf = 5, showValue = true, className = "" }: { value: number; outOf?: number; showValue?: boolean; className?: string }) {
  const safe = Math.max(0, Math.min(outOf, value));
  return <span className={`ps-rating-stars ${className}`.trim()} aria-label={`${safe.toFixed(1)} out of ${outOf}`}>{Array.from({ length: outOf }, (_, i) => <Star key={i} size={14} fill={i < Math.round(safe) ? "currentColor" : "none"} aria-hidden="true" />)}{showValue ? <strong>{safe.toFixed(1)}</strong> : null}</span>;
}
