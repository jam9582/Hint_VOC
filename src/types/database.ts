import type { Stage, VocType } from "./codes";

/**
 * PRD 7장 표 구조. 이름과 NOT NULL은 7장 그대로다.
 * 7장에 NOT NULL 표시가 없는 열은 null이 될 수 있는 것으로 둔다.
 * 코드 열은 code 표에 있는 값이며, 업무 규칙이 쓰는 stage와 voc_type만 좁은 타입으로 둔다.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** 7-1 */
export type VocRow = {
  voc_id: string;
  received_at: string;
  channel: string;
  grade: string;
  owner: string;
  vin: string;
  mileage_km: number;
  voc_type: VocType;
  system: string;
  part_name: string;
  part_no: string | null;
  symptom: string;
  frequency: string;
  reproduced: string;
  type_detail: Json | null;
  media_links: string | null;
  similar_ids: string | null;
  stage: Stage;
  due_at: string;
  created_at: string;
  closed_at: string | null;
  alerted_on: string | null;
};

/** 7-2 voc_id만 NOT NULL이다. */
export type Voc8dRow = {
  voc_id: string;
  team: string | null;
  d3_scope: string | null;
  d3_action: string | null;
  d3_done_at: string | null;
  d4_occur_cause: string | null;
  d4_escape_cause: string | null;
  d4_method: string | null;
  d4_verified: string | null;
  d4_done_at: string | null;
  d5_occur_action: string | null;
  d5_escape_action: string | null;
  d6_cutover: string | null;
  d6_criteria: string | null;
  d6_result: string | null;
  d6_evidence: string | null;
  d7_docs: string | null;
  d7_horizontal: string | null;
  d8_customer: string | null;
};

/** 7-3 */
export type VocStageLogRow = {
  log_id: number;
  voc_id: string;
  from_stage: Stage | null;
  to_stage: Stage;
  changed_by: string;
  changed_at: string;
  note: string | null;
};

/** 7-4 */
export type VehicleRow = {
  vin: string;
  model: string | null;
  model_year: number | null;
  prod_date: string | null;
  plant: string | null;
  line: string | null;
  shift: string | null;
};

/** 7-5 */
export type VehiclePartRow = {
  vin: string;
  part_no: string;
  part_name: string | null;
  part_lot: string | null;
  supplier: string | null;
  received_date: string | null;
};

/** 7-6 */
export type CodeRow = {
  code_group: string;
  code: string;
  label: string | null;
  sort: number | null;
  active: boolean | null;
};

/** 7-7 */
export type ProfileRow = {
  id: string;
  name: string;
  role: "user" | "admin";
  created_at: string;
};

/** 유사 VOC 한 건. matched는 맞은 조건 번호(1, 2, 3)다. */
export type SimilarVoc = Pick<
  VocRow,
  "voc_id" | "received_at" | "part_name" | "stage"
> & { matched: number[] };

type Table<Row, Insert = Row> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: [];
};

/** voc_id, 등록 일시 등 DB가 채우는 열은 넣지 않아도 된다. */
type VocInsert = Omit<VocRow, "voc_id" | "created_at"> & {
  voc_id?: string;
  created_at?: string;
};
type StageLogInsert = Omit<VocStageLogRow, "log_id" | "changed_at"> & {
  log_id?: number;
  changed_at?: string;
};
type ProfileInsert = Omit<ProfileRow, "created_at"> & { created_at?: string };

export type Database = {
  public: {
    Tables: {
      voc: Table<VocRow, VocInsert>;
      voc_8d: Table<Voc8dRow, Pick<Voc8dRow, "voc_id"> & Partial<Voc8dRow>>;
      voc_stage_log: Table<VocStageLogRow, StageLogInsert>;
      vehicle: Table<VehicleRow>;
      vehicle_part: Table<VehiclePartRow>;
      code: Table<CodeRow>;
      profiles: Table<ProfileRow, ProfileInsert>;
    };
    Views: Record<string, never>;
    Functions: {
      register_voc: {
        Args: { p_voc: Json; p_team: string; p_changed_by: string };
        Returns: string;
      };
      find_similar_vocs: {
        Args: {
          p_vin: string;
          p_part_no: string;
          p_voc_type: string;
          p_system: string;
          p_exclude_voc_id?: string;
        };
        Returns: SimilarVoc[];
      };
      advance_voc_stage: {
        Args: {
          p_voc_id: string;
          p_from_stage: Stage;
          p_to_stage: Stage;
          p_due_at: string;
          p_8d: Json;
          p_changed_by: string;
          p_note?: string;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
