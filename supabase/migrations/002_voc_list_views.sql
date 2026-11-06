-- schema.sql을 이미 실행한 DB에만 실행한다. 새 DB는 schema.sql에 이미 들어 있다.

begin;

-- 현황 목록용 뷰. 7장 표는 바꾸지 않고 차종만 붙여 읽는다. (PRD 15장 결정 14)
create view public.voc_list with (security_invoker = true) as
  select v.*, x.model
    from public.voc v
    left join public.vehicle x on x.vin = v.vin;

-- 현황의 차종·담당 거르기 목록.
create view public.voc_filter_options with (security_invoker = true) as
  select distinct 'model'::text as kind, model::text as value
    from public.vehicle
   where model is not null
  union
  select distinct 'owner'::text, owner::text
    from public.voc;

revoke all on public.voc_list, public.voc_filter_options from anon, authenticated;
grant select on public.voc_list, public.voc_filter_options to authenticated, service_role;

commit;
