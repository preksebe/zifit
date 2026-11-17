import { faraOrfane as T } from "@/lib/fara-orfane";
import type { DayItem } from "@/lib/plans";

function Element({ item }: { item: DayItem }) {
  if (item.kind === "masa") {
    return (
      <li className="py-3">
        <p className="font-medium">{T(item.name)}</p>
        {item.details && <p className="text-sm text-muted">{T(item.details)}</p>}
      </li>
    );
  }
  const parti = [
    item.sets && item.reps ? `${item.sets} × ${item.reps}` : item.reps,
    item.rest_seconds ? `pauză ${item.rest_seconds} secunde` : null,
  ].filter(Boolean);
  return (
    <li className="py-3">
      <p className="font-medium">{T(item.name)}</p>
      {parti.length > 0 && <p className="text-sm text-muted">{parti.join(" · ")}</p>}
      {item.details && <p className="text-sm text-muted">{T(item.details)}</p>}
    </li>
  );
}

// Lista exercitiilor sau a meselor dintr-o zi.
export function DayItems({ items }: { items: DayItem[] }) {
  return (
    <ul className="mt-3 divide-y divide-border">
      {items.map((it) => (
        <Element key={`${it.position}-${it.name}`} item={it} />
      ))}
    </ul>
  );
}
