/**
 * Unified Lead Foundation surface — re-exports shared validation + channels.
 * Frontend only; no CRM automation.
 */
export {
  LEAD_CHANNELS,
  LEAD_CHANNEL_PREFIX,
  LEAD_TYPE_TO_CHANNEL,
  isLeadChannel,
  leadReturnPath,
  type LeadChannel,
  type LeadSubmitMode,
} from "@/lib/leads/channels";

export {
  buildLeadSuccessPath,
  buildLeadErrorPath,
  parseLeadChannelParam,
  parseLeadModeParam,
  parseSingleParam,
} from "@/lib/leads/urls";

export {
  LEAD_CONTEXT_KINDS,
  LEAD_CONTEXT_PARAM,
  LEAD_CONTEXT_FIELD,
  isLeadContextKind,
  normalizeLeadContext,
  readLeadContextFromForm,
  appendLeadContextParams,
  parseLeadContextParams,
  leadContextSourcePath,
  type LeadContext,
  type LeadContextKind,
} from "@/lib/leads/context";

export {
  generateLeadReference,
  validateContactBasics,
  validateDeveloperPartnership,
  validateAgencyPartnership,
  validateListPropertyExtras,
  validateSupportMessage,
  isChecked,
  normalizeField,
  isValidEmail,
  type MarketplaceValidationCode,
  type ValidationResult,
} from "@/lib/marketplace/form-validation";
