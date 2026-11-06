import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { listAccounts, listAllCodes } from "@/lib/db/admin";
import {
  CODE_GROUPS,
  LOCKED_CODE_GROUPS,
  type CodeGroup,
} from "@/types/codes";
import type { CodeRow } from "@/types/database";
import { ActionForm } from "./action-form";
import { addCodeAction, updateCodeAction, updateRoleAction } from "./actions";

const fieldClass = "rounded border border-zinc-400 bg-white p-1";
const buttonClass = "rounded border border-zinc-500 px-3 py-1 text-sm";

function CodeItem({ row, locked }: { row: CodeRow; locked: boolean }) {
  if (locked) {
    return (
      <li className="text-sm">
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
    <details data-group={group} className="rounded border border-zinc-300 p-3">
      <summary className="cursor-pointer font-medium">
        {group} ({rows.length}){locked && " · 규칙에서 쓰는 값이라 바꿀 수 없음"}
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
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-200 pt-3 text-sm"
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
      <h1 className="text-xl font-semibold">관리자</h1>

      <section className="mt-6">
        <h2 className="font-medium">코드 관리</h2>
        <p className="mt-1 text-sm text-zinc-600">
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

      <section className="mt-8">
        <h2 className="font-medium">계정 관리</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {accounts.map((account) => (
            <li key={account.id} data-account={account.email ?? account.id}>
              <ActionForm
                action={updateRoleAction}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <input type="hidden" name="id" value={account.id} />
                <span className="min-w-0 flex-1 break-words">
                  {account.name} · {account.email ?? "메일 없음"}
                </span>
                {account.id === admin.id ? (
                  <span>관리자 계정 (본인)</span>
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
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-8">
      <Suspense fallback={<p>확인 중입니다.</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}
