"use server";

import { requireUser } from "@/lib/auth";
import { getVehicleHistory } from "@/lib/db/history";
import { findSimilarVocs, type SimilarQuery } from "@/lib/db/similar";

export async function lookupHistory(vin: string, partNo: string) {
  await requireUser();
  return getVehicleHistory(vin, partNo);
}

export async function lookupSimilarVocs(query: SimilarQuery) {
  await requireUser();
  return findSimilarVocs(query);
}
