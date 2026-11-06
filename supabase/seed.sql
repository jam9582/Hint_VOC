-- 가상 데이터. 기준: docs/PRD.md 9장, 10장. 실명과 실제 회사 데이터는 없다.
-- schema.sql을 실행한 뒤 한 번만 실행한다. 날짜는 실행한 날을 기준으로 만들어진다.
-- 계정(PRD 10장 10번)은 SQL이 아니라 대시보드에서 만든다.

begin;

-- 9장 코드표. voc_type만 영문 코드이고 나머지는 label과 같다. (15장 결정 2)
insert into public.code (code_group, code, label, sort)
select g, c, coalesce(l, c), s
from (values
  ('voc_type','NVH','소음·진동',1), ('voc_type','FUNC','기능 고장',2), ('voc_type','ELEC','전장·전자',3),
  ('voc_type','LEAK','누수·누유',4), ('voc_type','APPR','외관·도장',5), ('voc_type','ODOR','냄새·공조',6),
  ('voc_type','TRIM','내장 조립·마감',7), ('voc_type','ETC','기타',8),
  ('system','차체',null,1), ('system','외장',null,2), ('system','내장',null,3), ('system','샤시',null,4),
  ('system','파워트레인',null,5), ('system','전장',null,6), ('system','공조',null,7), ('system','기타',null,8),
  ('channel','고객센터',null,1), ('channel','딜러',null,2), ('channel','정비소',null,3),
  ('channel','온라인',null,4), ('channel','사내',null,5),
  ('grade','안전·법규',null,1), ('grade','기능',null,2), ('grade','감성',null,3),
  ('frequency','항상',null,1), ('frequency','간헐',null,2), ('frequency','1회',null,3),
  ('reproduced','재현됨',null,1), ('reproduced','재현 안 됨',null,2), ('reproduced','확인 전',null,3),
  ('stage','D3',null,1), ('stage','D4',null,2), ('stage','D5-D6',null,3),
  ('stage','D6검증',null,4), ('stage','D7-D8',null,5), ('stage','종결',null,6),
  ('d4_method','5Why',null,1), ('d4_method','특성요인도',null,2), ('d4_method','재현 시험',null,3), ('d4_method','기타',null,4),
  ('d4_verified','재현됨',null,1), ('d4_verified','재현 안 됨',null,2),
  ('d6_result','합격',null,1), ('d6_result','불합격',null,2),
  ('d8_customer','해결 확인',null,1), ('d8_customer','미해결',null,2), ('d8_customer','연락 안 됨',null,3),
  ('shift','주간',null,1), ('shift','야간',null,2)
) as t(g, c, l, s);

insert into public.vehicle (vin, model, model_year, prod_date, plant, line, shift) values
  ('TESTVIN0000000001','가상세단',2025,'2025-03-10','제1공장','A라인','주간'),
  ('TESTVIN0000000002','가상세단',2025,'2025-04-02','제1공장','A라인','야간'),
  ('TESTVIN0000000003','가상세단',2025,'2025-05-21','제1공장','B라인','주간'),
  ('TESTVIN0000000004','가상SUV',2025,'2025-06-11','제2공장','C라인','주간'),
  ('TESTVIN0000000005','가상SUV',2026,'2026-01-15','제2공장','C라인','야간'),
  ('TESTVIN0000000006','가상SUV',2026,'2026-02-03','제2공장','D라인','주간'),
  ('TESTVIN0000000007','가상밴',2026,'2026-02-24','제3공장','E라인','야간'),
  ('TESTVIN0000000008','가상밴',2026,'2026-03-30','제3공장','E라인','주간');

-- 1, 3, 4번 차량은 같은 부품 번호와 같은 LOT다. (유사 VOC 조건 ①)
insert into public.vehicle_part (vin, part_no, part_name, part_lot, supplier, received_date) values
  ('TESTVIN0000000001','CC-1001','센터 콘솔 수납함','LOT-A01','가상협력사A','2025-03-01'),
  ('TESTVIN0000000001','PW-2001','파워윈도 모터','LOT-P11','가상협력사B','2025-03-02'),
  ('TESTVIN0000000002','PW-2001','파워윈도 모터','LOT-P11','가상협력사B','2025-03-25'),
  ('TESTVIN0000000002','DS-3001','도어 웨더스트립','LOT-D21','가상협력사C','2025-03-26'),
  ('TESTVIN0000000003','CC-1001','센터 콘솔 수납함','LOT-A01','가상협력사A','2025-05-10'),
  ('TESTVIN0000000003','EC-5001','계기판 모듈','LOT-E31','가상협력사D','2025-05-11'),
  ('TESTVIN0000000004','CC-1001','센터 콘솔 수납함','LOT-A01','가상협력사A','2025-06-01'),
  ('TESTVIN0000000004','PT-4001','범퍼 커버','LOT-T41','가상협력사E','2025-06-02'),
  ('TESTVIN0000000005','EC-5001','계기판 모듈','LOT-E32','가상협력사D','2026-01-05'),
  ('TESTVIN0000000005','PW-2001','파워윈도 모터','LOT-P12','가상협력사B','2026-01-06'),
  ('TESTVIN0000000006','DS-3001','도어 웨더스트립','LOT-D22','가상협력사C','2026-01-25'),
  ('TESTVIN0000000006','PT-4001','범퍼 커버','LOT-T42','가상협력사E','2026-01-26'),
  ('TESTVIN0000000007','PT-4001','범퍼 커버','LOT-T42','가상협력사E','2026-02-15'),
  ('TESTVIN0000000007','DS-3001','도어 웨더스트립','LOT-D22','가상협력사C','2026-02-16'),
  ('TESTVIN0000000008','CC-1001','센터 콘솔 수납함','LOT-B02','가상협력사A','2026-03-20'),
  ('TESTVIN0000000008','EC-5001','계기판 모듈','LOT-E32','가상협력사D','2026-03-21');

insert into public.voc (
  voc_id, received_at, channel, grade, owner, vin, mileage_km, voc_type, system,
  part_name, part_no, symptom, frequency, reproduced, type_detail, stage, due_at, closed_at
) values
  -- 종결. 0003이 90일 안에 같은 부품·유형으로 다시 접수됐다. (재발률)
  ('VOC-2026-0001', now() - interval '90 days', '고객센터','감성','품질 담당','TESTVIN0000000001',12000,'NVH','내장','센터 콘솔 수납함','CC-1001',
   '방지턱을 넘을 때 수납함에서 덜그럭 소리가 난다.','간헐','재현됨','{"sound_kind":"덜그럭","road":"요철·방지턱","press_test":"멈춤"}','종결',current_date - 47, now() - interval '40 days'),
  -- 종결. 재발 없음.
  ('VOC-2026-0002', now() - interval '140 days','딜러','기능','생산기술 담당','TESTVIN0000000002',23500,'FUNC','전장','파워윈도 모터','PW-2001',
   '운전석 파워윈도가 간헐적으로 올라가지 않는다.','간헐','재현됨','{"failure_mode":"간헐 작동","warning_lamp":"없음"}','종결',current_date - 107, now() - interval '100 days'),
  -- 0003, 0004, 0012는 같은 부품·LOT의 미종결 건이다. (같은 문제 묶음 경고)
  ('VOC-2026-0003', now() - interval '3 days','정비소','감성','품질 담당','TESTVIN0000000003',8400,'NVH','내장','센터 콘솔 수납함','CC-1001',
   '비포장 도로에서 수납함 쪽 소음이 난다.','항상','재현됨','{"sound_kind":"덜그럭","road":"비포장","speed":"저속"}','D4',current_date + 4,null),
  ('VOC-2026-0004', now() - interval '1 day','온라인','감성','품질 담당','TESTVIN0000000004',15100,'NVH','내장','센터 콘솔 수납함','CC-1001',
   '저속 주행 중 수납함 덮개가 떨린다.','간헐','확인 전','{"sound_kind":"떨림","road":"평탄한 길도"}','D3',current_date + 1,null),
  ('VOC-2026-0005', now() - interval '5 days','딜러','기능','생산기술 담당','TESTVIN0000000005',4300,'ELEC','전장','계기판 모듈','EC-5001',
   '시동 직후 계기판 화면이 몇 초간 꺼진다.','간헐','재현됨','{"warning_lamp":"있음","dtc":"U0100,B1234","sw_version":"1.2.0"}','D5-D6',current_date + 9,null),
  ('VOC-2026-0006', now() - interval '12 days','고객센터','기능','품질 담당','TESTVIN0000000006',6100,'LEAK','차체','도어 웨더스트립','DS-3001',
   '세차 후 뒷좌석 바닥이 젖는다.','항상','재현됨','{"fluid":"물","trigger":"세차"}','D6검증',current_date + 12,null),
  ('VOC-2026-0007', now() - interval '20 days','사내','감성','생산기술 담당','TESTVIN0000000007',900,'APPR','외장','범퍼 커버','PT-4001',
   '범퍼 도장이 일부 들떠 있다.','1회','재현 안 됨','{"damage":"들뜸","size_mm":12,"since_delivery":"예"}','D7-D8',current_date + 3,null),
  -- 안전·법규 등급이고 기한이 어제다. (빨간색 확인)
  ('VOC-2026-0008', now() - interval '1 day','고객센터','안전·법규','품질 담당','TESTVIN0000000002',24800,'FUNC','전장','파워윈도 모터','PW-2001',
   '파워윈도 끼임 방지가 작동하지 않는다.','항상','확인 전','{"failure_mode":"오작동"}','D3',current_date - 1,null),
  -- vehicle에 없는 차대번호다. (이력 없음 확인)
  ('VOC-2026-0009', now(),'온라인','기능','품질 담당','TESTVIN9999999999',31000,'LEAK','차체','도어 웨더스트립','DS-3001',
   '비가 온 뒤 앞문 안쪽에 물기가 있다.','간헐','확인 전','{"fluid":"물","trigger":"우천"}','D3',current_date + 2,null),
  -- D6 불합격으로 2일 전 D4로 돌아왔다. 기한은 되돌린 날 + 7일이다. (15장 결정 7, 8)
  ('VOC-2026-0010', now() - interval '25 days','정비소','감성','생산기술 담당','TESTVIN0000000008',2200,'NVH','내장','센터 콘솔 수납함','CC-1001',
   '가속할 때 수납함 쪽에서 찌익 소리가 난다.','항상','재현됨','{"sound_kind":"찌익","road":"평탄한 길도","repair_history":"없음"}','D4',current_date + 5,null),
  ('VOC-2026-0011', now() - interval '6 days','고객센터','감성','품질 담당','TESTVIN0000000001',12600,'ODOR','공조','에어컨 필터',null,
   '냉방을 켜면 곰팡이 냄새가 난다.','항상','재현됨','{"odor_kind":"곰팡이","hvac_mode":"냉방"}','D5-D6',current_date + 8,null),
  -- 유형은 달라도 부품·LOT가 같다. (유사 VOC 조건 ①만 해당)
  ('VOC-2026-0012', now() - interval '2 days','딜러','감성','생산기술 담당','TESTVIN0000000004',15200,'TRIM','내장','센터 콘솔 수납함','CC-1001',
   '수납함 덮개와 주변 패널의 틈이 고르지 않다.','항상','재현됨','{"defect":"단차"}','D4',current_date + 5,null),
  ('VOC-2026-0013', now(),'사내','감성','품질 담당','TESTVIN0000000006',6200,'ETC','기타','기타 부품',null,
   '분류가 어려운 기타 문의다.','1회','확인 전','{"repair_history":"용품 장착"}','D3',current_date + 2,null);

insert into public.voc_8d (
  voc_id, team, d3_scope, d3_action, d3_done_at, d4_occur_cause, d4_escape_cause, d4_method, d4_verified, d4_done_at,
  d5_occur_action, d5_escape_action, d6_cutover, d6_criteria, d6_result, d6_evidence, d7_docs, d7_horizontal, d8_customer
) values
  ('VOC-2026-0001','품질·생산기술','LOT-A01, 최근 3개월','재고 전수 점검',now()-interval '88 days','덮개 고정 클립 치수 편차','출하 검사 항목 누락','5Why','재현됨',now()-interval '80 days',
   '클립 금형 수정','출하 검사 항목 추가','LOT-A02','14일 동안 동일 소음 접수 0건','합격','14일 동안 접수 0건','가상-표준-001','없음','해결 확인'),
  ('VOC-2026-0002','품질','LOT-P11, 최근 1개월','교환 부품 확보',now()-interval '138 days','모터 커넥터 접촉 불량','단자 검사 기준 미흡','특성요인도','재현됨',now()-interval '130 days',
   '커넥터 사양 변경','단자 검사 기준 강화','LOT-P12','30일 동안 동일 고장 0건','합격','30일 동안 접수 0건','가상-표준-002','후속 차종','해결 확인'),
  ('VOC-2026-0003',null,'LOT-A01, 최근 1개월','고객 차량 임시 고정',now()-interval '2 days',null,null,null,null,null,null,null,null,null,null,null,null,null,null),
  ('VOC-2026-0004',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),
  ('VOC-2026-0005','전장 품질','LOT-E32','재고 출하 보류',now()-interval '4 days','부팅 순서 오류','시동 시험 조건 누락','재현 시험','재현됨',now()-interval '1 day',null,null,null,null,null,null,null,null,null),
  ('VOC-2026-0006','품질','LOT-D22, 가상SUV','실링 보강',now()-interval '11 days','웨더스트립 접합부 틈','물샘 시험 시간 부족','재현 시험','재현됨',now()-interval '7 days',
   '접합부 형상 변경','물샘 시험 시간 연장','LOT-D23','세차 시험 10회 누수 0건',null,null,null,null,null),
  ('VOC-2026-0007','도장 품질','LOT-T42','출하 전 육안 점검',now()-interval '19 days','도장 전 세척 부족','검사 조명 부족','5Why','재현 안 됨',now()-interval '15 days',
   '세척 시간 조정','검사 조명 교체','LOT-T43','신규 LOT 100대 들뜸 0건','합격','100대 점검 들뜸 0건',null,null,null),
  ('VOC-2026-0008',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),
  ('VOC-2026-0009',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),
  ('VOC-2026-0010','품질','LOT-B02','재고 점검',now()-interval '24 days','덮개 힌지 마찰','마찰 소음 시험 없음','5Why','재현됨',now()-interval '18 days',
   '힌지 윤활 추가','소음 시험 추가','LOT-B03','14일 동안 동일 소음 0건',null,null,null,null,null),
  ('VOC-2026-0011','공조 품질','가상세단 2025년식','필터 교체 안내',now()-interval '5 days','증발기 배수 불량','배수 점검 누락','5Why','재현됨',now()-interval '1 day',null,null,null,null,null,null,null,null,null),
  ('VOC-2026-0012',null,'LOT-A01','조립 상태 점검',now()-interval '1 day',null,null,null,null,null,null,null,null,null,null,null,null,null,null),
  ('VOC-2026-0013',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null);

insert into public.voc_stage_log (voc_id, from_stage, to_stage, changed_by, changed_at, note) values
  ('VOC-2026-0001',null,'D3','품질 담당',now()-interval '90 days',null),
  ('VOC-2026-0001','D3','D4','품질 담당',now()-interval '88 days',null),
  ('VOC-2026-0001','D4','D5-D6','품질 담당',now()-interval '80 days',null),
  ('VOC-2026-0001','D5-D6','D6검증','품질 담당',now()-interval '70 days',null),
  ('VOC-2026-0001','D6검증','D7-D8','품질 담당',now()-interval '54 days',null),
  ('VOC-2026-0001','D7-D8','종결','품질 담당',now()-interval '40 days',null),
  ('VOC-2026-0002',null,'D3','생산기술 담당',now()-interval '140 days',null),
  ('VOC-2026-0002','D3','D4','생산기술 담당',now()-interval '138 days',null),
  ('VOC-2026-0002','D4','D5-D6','생산기술 담당',now()-interval '130 days',null),
  ('VOC-2026-0002','D5-D6','D6검증','생산기술 담당',now()-interval '126 days',null),
  ('VOC-2026-0002','D6검증','D7-D8','생산기술 담당',now()-interval '114 days',null),
  ('VOC-2026-0002','D7-D8','종결','생산기술 담당',now()-interval '100 days',null),
  ('VOC-2026-0003',null,'D3','품질 담당',now()-interval '3 days',null),
  ('VOC-2026-0003','D3','D4','품질 담당',now()-interval '2 days',null),
  ('VOC-2026-0004',null,'D3','품질 담당',now()-interval '1 day',null),
  ('VOC-2026-0005',null,'D3','생산기술 담당',now()-interval '5 days',null),
  ('VOC-2026-0005','D3','D4','생산기술 담당',now()-interval '4 days',null),
  ('VOC-2026-0005','D4','D5-D6','생산기술 담당',now()-interval '1 day',null),
  ('VOC-2026-0006',null,'D3','품질 담당',now()-interval '12 days',null),
  ('VOC-2026-0006','D3','D4','품질 담당',now()-interval '11 days',null),
  ('VOC-2026-0006','D4','D5-D6','품질 담당',now()-interval '7 days',null),
  ('VOC-2026-0006','D5-D6','D6검증','품질 담당',now()-interval '2 days',null),
  ('VOC-2026-0007',null,'D3','생산기술 담당',now()-interval '20 days',null),
  ('VOC-2026-0007','D3','D4','생산기술 담당',now()-interval '19 days',null),
  ('VOC-2026-0007','D4','D5-D6','생산기술 담당',now()-interval '15 days',null),
  ('VOC-2026-0007','D5-D6','D6검증','생산기술 담당',now()-interval '10 days',null),
  ('VOC-2026-0007','D6검증','D7-D8','생산기술 담당',now()-interval '4 days',null),
  ('VOC-2026-0008',null,'D3','품질 담당',now()-interval '1 day',null),
  ('VOC-2026-0009',null,'D3','품질 담당',now(),null),
  ('VOC-2026-0010',null,'D3','생산기술 담당',now()-interval '25 days',null),
  ('VOC-2026-0010','D3','D4','생산기술 담당',now()-interval '24 days',null),
  ('VOC-2026-0010','D4','D5-D6','생산기술 담당',now()-interval '18 days',null),
  ('VOC-2026-0010','D5-D6','D6검증','생산기술 담당',now()-interval '15 days',null),
  ('VOC-2026-0010','D6검증','D4','생산기술 담당',now()-interval '2 days','D6 불합격: 14일 안에 동일 소음 1건 재접수'),
  ('VOC-2026-0011',null,'D3','품질 담당',now()-interval '6 days',null),
  ('VOC-2026-0011','D3','D4','품질 담당',now()-interval '5 days',null),
  ('VOC-2026-0011','D4','D5-D6','품질 담당',now()-interval '1 day',null),
  ('VOC-2026-0012',null,'D3','생산기술 담당',now()-interval '2 days',null),
  ('VOC-2026-0012','D3','D4','생산기술 담당',now()-interval '1 day',null),
  ('VOC-2026-0013',null,'D3','품질 담당',now(),null);

commit;
