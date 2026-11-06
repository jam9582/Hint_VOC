import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { VehiclePartRow, VehicleRow } from "@/types/database";

export type VehicleHistory = {
  vehicle: Pick<
    VehicleRow,
    "model" | "prod_date" | "plant" | "line" | "shift"
  > | null;
  part: Pick<VehiclePartRow, "part_lot" | "supplier"> | null;
};

/** 차대번호로 차량 이력을, 부품 번호까지 있으면 그 차량의 부품 이력을 읽는다. */
export async function getVehicleHistory(
  vin: string,
  partNo: string,
): Promise<VehicleHistory> {
  const supabase = await createClient();

  const [vehicle, part] = await Promise.all([
    supabase
      .from("vehicle")
      .select("model, prod_date, plant, line, shift")
      .eq("vin", vin)
      .maybeSingle(),
    partNo
      ? supabase
          .from("vehicle_part")
          .select("part_lot, supplier")
          .eq("vin", vin)
          .eq("part_no", partNo)
          .maybeSingle()
      : null,
  ]);

  if (vehicle.error) throw new Error(vehicle.error.message);
  if (part?.error) throw new Error(part.error.message);
  return { vehicle: vehicle.data, part: part?.data ?? null };
}
