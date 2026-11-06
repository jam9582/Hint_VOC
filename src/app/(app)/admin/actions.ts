"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { addCode, updateAccountRole, updateCode } from "@/lib/db/admin";
import {
  CODE_GROUPS,
  LOCKED_CODE_GROUPS,
  type CodeGroup,
} from "@/types/codes";

export type AdminResult = { ok: boolean; message: string };

const failed = (message: string): AdminResult => ({ ok: false, message });

const isEditableGroup = (group: string) =>
  (CODE_GROUPS as readonly string[]).includes(group) &&
  !LOCKED_CODE_GROUPS.includes(group as CodeGroup);

function readSort(formData: FormData) {
  const sort = Number(String(formData.get("sort") ?? "").trim() || NaN);
  return Number.isInteger(sort) ? sort : null;
}

export async function addCodeAction(formData: FormData): Promise<AdminResult> {
  await requireAdmin();

  const group = String(formData.get("code_group") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const sort = readSort(formData);

  if (!isEditableGroup(group)) return failed("바꿀 수 없는 묶음입니다.");
  if (!code || !label || sort === null) {
    return failed("코드 값, 이름, 순서를 모두 입력해 주세요.");
  }
  if (code.length > 20 || label.length > 50) {
    return failed("코드 값은 20자, 이름은 50자까지 입력할 수 있습니다.");
  }
  if (group === "voc_type" && !/^[A-Z]+$/.test(code)) {
    return failed("유형의 코드 값은 영문 대문자여야 합니다.");
  }

  try {
    const added = await addCode({ code_group: group, code, label, sort });
    if (!added) return failed("이미 있는 코드입니다.");
  } catch (error) {
    console.error("코드 추가 실패", error);
    return failed("코드를 추가하지 못했습니다.");
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "추가했습니다." };
}

export async function updateCodeAction(
  formData: FormData,
): Promise<AdminResult> {
  await requireAdmin();

  const group = String(formData.get("code_group") ?? "");
  const code = String(formData.get("code") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const sort = readSort(formData);

  if (!isEditableGroup(group)) return failed("바꿀 수 없는 묶음입니다.");
  if (!label || label.length > 50 || sort === null) {
    return failed("이름(50자까지)과 순서를 확인해 주세요.");
  }

  try {
    await updateCode(group, code, {
      label,
      sort,
      active: formData.get("active") === "on",
    });
  } catch (error) {
    console.error("코드 수정 실패", error);
    return failed("코드를 저장하지 못했습니다.");
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "저장했습니다." };
}

export async function updateRoleAction(
  formData: FormData,
): Promise<AdminResult> {
  const admin = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (id === admin.id) return failed("자기 계정의 유형은 바꿀 수 없습니다.");
  if (role !== "user" && role !== "admin") {
    return failed("계정 유형을 다시 선택해 주세요.");
  }

  try {
    await updateAccountRole(id, role);
  } catch (error) {
    console.error("계정 유형 변경 실패", error);
    return failed("계정 유형을 바꾸지 못했습니다.");
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "바꿨습니다." };
}
