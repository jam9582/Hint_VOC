"use server";

import { requireUser } from "@/lib/auth";
import { getVehicleHistory } from "@/lib/db/history";

export async function lookupHistory(vin: string, partNo: string) {
  await requireUser();
  return getVehicleHistory(vin, partNo);
}
