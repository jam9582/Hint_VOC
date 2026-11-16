import type { NewVoc } from "@/lib/db/vocs";
import type { Json, VocChange, VocRow } from "@/types/database";
import { getTypeDetailFields } from "@/types/type-detail";

export const EDIT_REASON_MAX_LENGTH = 200;

/** 수정으로 바꿀 수 있는 voc 값. 접수 일시는 기한의 기준이라 고치지 않는다. */
export type EditableVoc = Omit<NewVoc, "received_at">;

/** 수정 기록에 남기는 항목. similar_ids는 다시 계산한 값이라 뺀다. */
const LOGGED_FIELDS = {
  channel: "접수 경로",
  grade: "등급",
  owner: "담당",
  vin: "차대번호",
  mileage_km: "주행거리",
  voc_type: "유형",
  system: "부위 대분류",
  part_name: "부품명",
  part_no: "부품 번호",
  symptom: "증상 설명",
  frequency: "발생 빈도",
  reproduced: "재현 여부",
  media_links: "사진·영상 링크",
  due_at: "기한",
} as const satisfies Partial<Record<keyof EditableVoc, string>>;

const toText = (value: Json | undefined) =>
  value === null || value === undefined || value === ""
    ? null
    : String(value);

const toDetail = (value: Json) => (value ?? {}) as Record<string, Json>;

/** 수정 전후를 견주어 바뀐 항목만 돌려준다. */
export function getVocChanges(
  before: { voc: VocRow; team: string | null },
  after: { voc: EditableVoc; team: string | null },
): VocChange[] {
  const changes: VocChange[] = [];
  const add = (
    label: string,
    oldValue: Json | undefined,
    newValue: Json | undefined,
  ) => {
    const change = {
      label,
      before: toText(oldValue),
      after: toText(newValue),
    };
    if (change.before !== change.after) changes.push(change);
  };

  for (const [key, label] of Object.entries(LOGGED_FIELDS)) {
    const name = key as keyof typeof LOGGED_FIELDS;
    add(label, before.voc[name], after.voc[name]);
  }
  add("팀 구성", before.team, after.team);

  // 유형이 바뀌면 추가 항목도 달라지므로 양쪽 항목을 모두 본다.
  const oldDetail = toDetail(before.voc.type_detail);
  const newDetail = toDetail(after.voc.type_detail);
  const detailFields = new Map(
    [
      ...getTypeDetailFields(before.voc.voc_type),
      ...getTypeDetailFields(after.voc.voc_type),
    ].map((field) => [field.key, field.label]),
  );
  for (const [key, label] of detailFields) {
    add(label, oldDetail[key], newDetail[key]);
  }

  return changes;
}
