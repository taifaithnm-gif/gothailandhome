import type { Dictionary } from "@/lib/i18n/get-dictionary";

type FormAssuranceProps = {
  dict: Dictionary;
  className?: string;
};

/**
 * Shared buyer-assurance copy for every contact / lead form:
 * expected response time · business hours · next step.
 * Response time stays generic when no SLA is configured in contacts.json
 * (do not fabricate numeric SLAs).
 */
export function FormAssurance({ dict, className }: FormAssuranceProps) {
  const a = dict.formAssurance;

  return (
    <div
      data-slot="form-assurance"
      className={
        className ??
        "space-y-1 rounded-xl border border-[var(--brand-line)]/70 bg-[var(--brand-soft)]/40 px-3 py-2.5 text-xs leading-relaxed text-stone-600"
      }
    >
      <p data-slot="form-response-time">{a.responseTime}</p>
      <p data-slot="form-business-hours">{a.businessHours}</p>
      <p data-slot="form-next-step">{a.nextStep}</p>
    </div>
  );
}
