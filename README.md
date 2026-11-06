# VOC 통합 관리 (8D)

품질·생산기술 실무자가 VOC를 8D 단계 양식 하나로 접수부터 종결까지 관리하는 웹 앱이다.
기능과 규칙의 기준은 [docs/PRD.md](docs/PRD.md)이고, 개발 중 정한 내용은 그 문서의 15장에 있다.

- 기술: Next.js 16, TypeScript, Tailwind, Supabase (PostgreSQL, Auth), Nodemailer
- 예시 데이터는 모두 가상이다. 실명과 실제 회사 데이터는 넣지 않는다.

## 실행 방법

Node.js 20.9 이상이 필요하다.

```bash
npm install
cp .env.example .env.local   # 값을 채운다
npm run dev                  # http://localhost:3000
```

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 배포용 빌드 |
| `npm run lint` | 코드 검사 |

## Supabase 준비

### 새 프로젝트

SQL Editor에서 아래 순서로 한 번씩 실행한다.

1. `supabase/schema.sql`: 표, 권한, 함수, 뷰. 이 파일에 `migrations`의 내용도 들어 있다.
2. `supabase/seed.sql`: 코드표와 가상 데이터. 임시 DB에서만 실행한다. 정식 DB에는 코드표(9장)만 넣는다.
3. Authentication에서 계정을 만든다. 계정을 만들면 `profiles`에 일반 계정 줄이 자동으로 생긴다.
4. 관리자로 쓸 계정의 유형을 바꾼다.

```sql
update public.profiles p
set name = '관리자', role = 'admin'
from auth.users u
where p.id = u.id and u.email = 'admin@voc-test.example';
```

`seed.sql` 대신 팀 구글 시트의 가상 데이터를 쓰려면 `supabase/sample-data.sql`을 실행한다. 이 파일은 지금 있는 VOC, 차량, 부품, 코드를 지우고 시트 내용으로 바꾼다. 계정은 그대로 둔다.

### 이전 schema.sql을 실행한 프로젝트

`supabase/migrations`의 파일을 번호 순서로 실행한다. 같은 파일은 두 번 실행하지 않는다.

### 정식 DB로 바꾸기

`.env.local`의 Supabase 값 3개를 바꾼다. 정식 DB에는 `schema.sql`과 같은 표, 권한, 함수, 뷰가 있어야 한다. 계정은 새로 만든다.

## 환경 변수

| 이름 | 필수 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 예 | 프로젝트 주소 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 예 | 공개 키 (`sb_publishable_`) |
| `SUPABASE_SECRET_KEY` | 예 | 비밀 키 (`sb_secret_`). 서버 코드에서만 쓴다 |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | 아니오 | 메일 설정. 없으면 메일을 보내지 않는다 |
| `CRON_SECRET` | 아니오 | 지연 알림 주소를 부를 때 쓰는 비밀 값 |

비밀 값은 `.env.local`에만 둔다. 비밀 키에 `NEXT_PUBLIC_`을 붙이면 브라우저 코드에 들어가므로 붙이지 않는다.

## 지연 알림

아래 주소를 하루에 한 번 호출한다. 예약 실행은 배포 방식이 정해진 뒤 연결한다.

```bash
curl -X POST -H "Authorization: Bearer <CRON_SECRET>" https://<사이트 주소>/api/alerts/overdue
```

같은 날 다시 호출해도 이미 알린 VOC는 다시 보내지 않는다. 일부 메일이 실패하면 다시 호출했을 때 남은 건만 보낸다.

## 구조

```text
docs/PRD.md                개발 기준 문서
supabase/                  스키마, 가상 데이터, 추가 SQL
src/app/login/             로그인
src/app/(app)/register/    등록
src/app/(app)/status/      현황
src/app/(app)/vocs/[id]/   상세, 단계 진행, 종결
src/app/(app)/admin/       관리자
src/app/api/alerts/        지연 알림 실행 주소
src/lib/db/                DB 접근 코드
src/lib/rules/             업무 규칙 (필수 검사, 단계 이동, 지표)
src/lib/auth.ts            로그인·관리자 확인
src/types/                 표, 코드, 유형별 항목 정의
```

## 개발 규칙

- 브라우저의 공개 키로는 읽기만 된다. 쓰기는 서버 코드가 비밀 키로 하므로, 쓰기 전에 반드시 `requireUser` 또는 `requireAdmin`을 부른다.
- 표 이름과 열 이름을 쓰는 코드는 `src/lib/db/`에 모은다.
- PRD 7장의 표 구조를 바꿔야 하면 DB 담당과 먼저 정한다.

## 남은 확인 사항

[docs/PRD.md](docs/PRD.md)의 14장에 모아 두었다.
