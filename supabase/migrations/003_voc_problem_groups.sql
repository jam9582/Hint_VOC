-- schema.sql을 이미 실행한 DB에만 실행한다. 새 DB는 schema.sql에 이미 들어 있다.

begin;

-- 같은 문제 묶음 경고. 유사 조건 ① 또는 ②에 맞는 미종결 VOC가 2건 이상인 묶음.
create view public.voc_problem_groups with (security_invoker = true) as
  select 'lot'::text as kind,
         v.part_no::text as part_no,
         p.part_lot::text as part_lot,
         null::text as voc_type,
         null::text as system,
         array_agg(v.voc_id::text order by v.received_at desc) as voc_ids
    from public.voc v
    join public.vehicle_part p on p.vin = v.vin and p.part_no = v.part_no
   where v.stage <> '종결' and p.part_lot is not null
   group by v.part_no, p.part_lot
  having count(*) >= 2
  union all
  select 'part'::text,
         v.part_no::text,
         null::text,
         v.voc_type::text,
         v.system::text,
         array_agg(v.voc_id::text order by v.received_at desc)
    from public.voc v
   where v.stage <> '종결' and v.part_no is not null
   group by v.part_no, v.voc_type, v.system
  having count(*) >= 2;

revoke all on public.voc_problem_groups from anon, authenticated;
grant select on public.voc_problem_groups to authenticated, service_role;

commit;
