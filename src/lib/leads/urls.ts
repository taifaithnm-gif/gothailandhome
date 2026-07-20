import { localePath } from "@/lib/i18n/metadata";
import type { Locale } from "@/config/locales";
import {
  isLeadChannel,
  type LeadChannel,
  type LeadSubmitMode,
} from "@/lib/leads/channels";
import {
  appendLeadContextParams,
  type LeadContext,
} from "@/lib/leads/context";

export function buildLeadSuccessPath(
  locale: Locale | string,
  channel: LeadChannel,
  reference: string,
  mode: LeadSubmitMode,
  context?: LeadContext | null,
): string {
  const params = new URLSearchParams({
    channel,
    ref: reference,
    mode,
  });
  appendLeadContextParams(params, context);
  return `${localePath(locale as Locale, "/leads/success")}?${params.toString()}`;
}

export function buildLeadErrorPath(
  locale: Locale | string,
  channel: LeadChannel,
  code: string,
): string {
  const params = new URLSearchParams({
    channel,
    code,
  });
  return `${localePath(locale as Locale, "/leads/error")}?${params.toString()}`;
}

export function parseLeadChannelParam(
  value: string | string[] | undefined,
): LeadChannel | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !isLeadChannel(raw)) return null;
  return raw;
}

export function parseLeadModeParam(
  value: string | string[] | undefined,
): LeadSubmitMode {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "stored" ? "stored" : "placeholder";
}

export function parseSingleParam(
  value: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed || null;
}
