import { cn } from "@/lib/utils";

type ImagesComingSoonProps = {
  title: string;
  body?: string;
  className?: string;
};

/**
 * Professional empty-media notice for project galleries with no approved photos.
 * Never renders green empty panels or internal workflow copy.
 */
export function ImagesComingSoon({
  title,
  body,
  className,
}: ImagesComingSoonProps) {
  return (
    <div
      className={cn(
        "flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-[var(--brand-soft)] px-6 py-10 text-center sm:min-h-[14rem]",
        className,
      )}
      data-slot="images-coming-soon"
      role="status"
    >
      <p className="font-heading text-lg text-[var(--brand-deep)] sm:text-xl">
        {title}
      </p>
      {body ? (
        <p className="max-w-md text-sm leading-relaxed text-stone-600">{body}</p>
      ) : null}
    </div>
  );
}
