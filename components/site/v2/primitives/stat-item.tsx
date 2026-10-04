export function StatItem({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  return <div className={`ps-stat ${className}`.trim()}><strong>{value}</strong><span>{label}</span></div>;
}
