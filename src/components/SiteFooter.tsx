import { faraOrfane } from "@/lib/fara-orfane";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted">
        <p className="font-display text-lg uppercase tracking-wide text-foreground">
          ZI<span className="text-sport">FIT</span>
        </p>
        <p className="mt-2">{faraOrfane("Conținut de test. Nu e sfat de antrenament sau de nutriție.")}</p>
      </div>
    </footer>
  );
}
