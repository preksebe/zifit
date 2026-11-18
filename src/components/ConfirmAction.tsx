import { BTN_DANGER, BTN_DANGER_SOLID, BTN_SECOND } from "@/components/ui";
import { faraOrfane as T } from "@/lib/fara-orfane";

// Actiune cu confirmare, fara JavaScript: butonul deschide un <details> cu intrebarea si butonul „Da”.
export function ConfirmAction({
  action,
  fields,
  label,
  question,
  confirmLabel = "Da, șterge",
  danger = true,
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  label: string;
  question: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <details className="inline-block align-top">
      <summary className={`${danger ? BTN_DANGER : BTN_SECOND} cursor-pointer list-none`}>{label}</summary>
      <form action={action} className="mt-2 max-w-xs space-y-2 rounded-md border border-border bg-card p-3 text-sm">
        {Object.entries(fields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <p>{T(question)}</p>
        <button type="submit" className={`${danger ? BTN_DANGER_SOLID : BTN_SECOND} whitespace-nowrap`}>
          {confirmLabel}
        </button>
      </form>
    </details>
  );
}
