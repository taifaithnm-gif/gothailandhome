import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ContactChannelLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** Optional data attribute for QA / analytics hooks. */
  "data-contact-channel"?: string;
  "data-slot"?: string;
} & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "children" | "className"
>;

/**
 * External / tel deep-link for contact channels.
 * Keeps styling minimal so it fits Contact page and PCS cards.
 */
export function ContactChannelLink({
  href,
  children,
  className,
  "data-contact-channel": channel,
  "data-slot": slot,
  ...rest
}: ContactChannelLinkProps) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={cn(
        "rounded-sm font-medium underline-offset-2 outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/60",
        className,
      )}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      data-contact-channel={channel}
      data-slot={slot}
      {...rest}
    >
      {children}
    </a>
  );
}
