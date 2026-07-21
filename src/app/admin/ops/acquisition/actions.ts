"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  publishAcquisitionCase,
  transitionAcquisitionCase,
  unpublishLinkedProperty,
} from "@/lib/acquisition/service";
import { requireAdmin } from "@/lib/auth/admin";
import { isPhase2AcquisitionEnabled } from "@/lib/feature-flags";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateAcquisitionStatusAction(formData: FormData) {
  if (!isPhase2AcquisitionEnabled()) redirect("/admin");
  const { user } = await requireAdmin();
  const caseId = formString(formData, "caseId");
  const toStatus = formString(formData, "status");
  const note = formString(formData, "note");
  const result = await transitionAcquisitionCase({
    caseId,
    toStatus,
    actorUserId: user.id,
    note: note || null,
  });
  revalidatePath("/admin/ops/acquisition");
  revalidatePath(`/admin/ops/acquisition/${caseId}`);
  if (!result.ok) {
    redirect(`/admin/ops/acquisition/${caseId}?error=${encodeURIComponent(result.message)}`);
  }
  redirect(`/admin/ops/acquisition/${caseId}`);
}

export async function publishAcquisitionAction(formData: FormData) {
  if (!isPhase2AcquisitionEnabled()) redirect("/admin");
  const { user } = await requireAdmin();
  const caseId = formString(formData, "caseId");
  const locationId = formString(formData, "locationId");
  const publishNow = formString(formData, "publishNow") === "1";
  const result = await publishAcquisitionCase({
    caseId,
    actorUserId: user.id,
    locationId,
    publishNow,
  });
  revalidatePath("/admin/ops/acquisition");
  revalidatePath(`/admin/ops/acquisition/${caseId}`);
  if (!result.ok) {
    redirect(`/admin/ops/acquisition/${caseId}?error=${encodeURIComponent(result.message)}`);
  }
  redirect(`/admin/ops/acquisition/${caseId}?linked=${result.propertyId}`);
}

export async function unpublishAcquisitionAction(formData: FormData) {
  if (!isPhase2AcquisitionEnabled()) redirect("/admin");
  const { user } = await requireAdmin();
  const caseId = formString(formData, "caseId");
  await unpublishLinkedProperty({ caseId, actorUserId: user.id });
  revalidatePath(`/admin/ops/acquisition/${caseId}`);
  redirect(`/admin/ops/acquisition/${caseId}`);
}
