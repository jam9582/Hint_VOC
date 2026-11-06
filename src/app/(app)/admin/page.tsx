import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { listAccounts, listAllCodes } from "@/lib/db/admin";
import {
  CODE_GROUPS,
  LOCKED_CODE_GROUPS,
  type CodeGroup,
} from "@/types/codes";
import type { CodeRow } from "@/types/database";
import { PageHeader } from "../page-header";
import { ActionForm } from "./action-form";
import { addCodeAction, updateCodeAction, updateRoleAction } from "./actions";

const fieldClass =
  "min-h-8 rounded-md border border-line bg-card px-2 py-1 text-[13px] font-medium";
const buttonClass = "btn btn-light btn-sm";

const GROUP_LABELS: Record<CodeGroup, string> = {
  voc_type: "유형",
  system: "부위",
  channel: "접수 경로",
  grade: "등급",
  frequency: "발생 빈도",
  reproduced: "재현 여부",
  stage: "단계",
  d4_method: "D4 분석 방법",
  d4_verified: "D4 재현 검증",
  d6_result: "D6 검증 결과",
  d8_customer: "D8 고객 확인",
  shift: "근무조",
};

function CodeItem({ row, locked }: { row: CodeRow; locked: boolean }) {
  if (locked) {
    return (
      <li className="text-[13px] font-medium text-ink-2">
        {row.code} · {row.label}
      </li>
    );
  }
  return (
    <li>
      <ActionForm
        action={updateCodeAction}
        className="flex flex-wrap items-center gap-2 text-sm"
      >
        <input type="hidden" name="code_group" value={row.code_group} />
        <input type="hidden" name="code" value={row.code} />
        <span className="w-24 break-words">{row.code}</span>
        <input
          name="label"
          aria-label={`${row.code} 이름`}
          defaultValue={row.label ?? ""}
          maxLength={50}
          className={`${fieldClass} min-w-0 flex-1`}
        />
        <input
          name="sort"
          type="number"
          aria-label={`${row.code} 순서`}
          defaultValue={row.sort ?? 0}
          className={`${fieldClass} w-16`}
        />
        <label className="flex items-center gap-1">
          <input
            name="active"
            type="checkbox"
            defaultChecked={row.active ?? false}
          />
          사용
        </label>
        <button type="submit" className={buttonClass}>
          저장
        </button>
      </ActionForm>
    </li>
  );
}

function CodeGroupBlock({ group, rows }: { group: CodeGroup; rows: CodeRow[] }) {
  const locked = LOCKED_CODE_GROUPS.includes(group);
  return (
    <details data-group={group} className="rounded-lg border border-line p-3.5">
      <summary className="cursor-pointer text-[13px] font-semibold">
        {GROUP_LABELS[group]} ({rows.length})
        {locked && (
          <span className="ml-2 text-xs font-medium text-ink-3">
            규칙에서 쓰는 값이라 바꿀 수 없음
          </span>
        )}
      </summary>
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map((row) => (
          <CodeItem key={row.code} row={row} locked={locked} />
        ))}
      </ul>
      {!locked && (
        <ActionForm
          action={addCodeAction}
          resetOnSuccess
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm"
        >
          <input type="hidden" name="code_group" value={group} />
          <input
            name="code"
            placeholder={group === "voc_type" ? "코드 (영문 대문자)" : "코드 값"}
            maxLength={20}
            className={`${fieldClass} min-w-0 flex-1`}
          />
          <input
            name="label"
            placeholder="화면 이름"
            maxLength={50}
            className={`${fieldClass} min-w-0 flex-1`}
          />
          <input
            name="sort"
            type="number"
            placeholder="순서"
            className={`${fieldClass} w-16`}
          />
          <button type="submit" className={buttonClass}>
            추가
          </button>
        </ActionForm>
      )}
    </details>
  );
}

async function AdminContent() {
  const admin = await requireAdmin();
  const [codes, accounts] = await Promise.all([listAllCodes(), listAccounts()]);

  return (
    <>
      <PageHeader title="관리자" />

      <section className="card p-5">
        <h2 className="card-title">코드 관리</h2>
        <p className="mt-1 text-xs font-medium text-ink-3">
          기존 VOC가 쓰는 값이라 코드는 지우지 않고 사용을 끕니다. 코드 값은 바꿀
          수 없습니다.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {CODE_GROUPS.map((group) => (
            <CodeGroupBlock
              key={group}
              group={group}
              rows={codes.filter((code) => code.code_group === group)}
            />
          ))}
        </div>
      </section>

      <section className="card mt-[22px] p-5">
        <h2 className="card-title">계정 관리</h2>
        <ul className="mt-3 flex flex-col divide-y divide-line">
          {accounts.map((account) => (
            <li
              key={account.id}
              data-account={account.email ?? account.id}
              className="py-3 first:pt-0 last:pb-0"
            >
              <ActionForm
                action={updateRoleAction}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <input type="hidden" name="id" value={account.id} />
                <span className="min-w-0 flex-1 break-words">
                  {account.name} · {account.email ?? "메일 없음"}
                </span>
                {account.id === admin.id ? (
                  <span className="tag bg-primary-bg text-primary">
                    관리자 계정 (본인)
                  </span>
                ) : (
                  <>
                    <select
                      name="role"
                      aria-label={`${account.name} 계정 유형`}
                      defaultValue={account.role}
                      className={fieldClass}
                    >
                      <option value="user">일반 계정</option>
                      <option value="admin">관리자 계정</option>
                    </select>
                    <button type="submit" className={buttonClass}>
                      변경
                    </button>
                  </>
                )}
              </ActionForm>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-5 lg:px-7 lg:py-[22px]">
      <Suspense fallback={<div className="card h-96 animate-pulse" />}>
        <AdminContent />
      </Suspense>
    </main>
  );
}
