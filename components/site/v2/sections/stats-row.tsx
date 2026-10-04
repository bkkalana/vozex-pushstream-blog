import { StatItem } from "../primitives/stat-item";

export function StatsRow({ items }: { items: Array<{ value: string; label: string }> }) {
  return <div className="ps-stats-row">{items.map((item) => <StatItem key={`${item.value}-${item.label}`} {...item} />)}</div>;
}
