-- schema.sql을 이미 실행한 DB에만 실행한다. 새 DB는 schema.sql에 이미 들어 있다.

begin;

-- 유사 VOC 조건 ①②③ (PRD 5장 Must 4). matched에 맞은 조건 번호가 들어간다.
create function public.find_similar_vocs(
  p_vin text,
  p_part_no text,
  p_voc_type text,
  p_system text,
  p_exclude_voc_id text default null
)
returns table (
  voc_id varchar,
  received_at timestamptz,
  part_name varchar,
  stage varchar,
  matched integer[]
)
language sql
stable
set search_path = ''
as $$
  with target as (
    select
      (select vp.part_lot from public.vehicle_part vp
        where vp.vin = p_vin and vp.part_no = p_part_no) as part_lot,
      (select x.model from public.vehicle x where x.vin = p_vin) as model
  )
  select v.voc_id, v.received_at, v.part_name, v.stage,
         array_remove(array[
           case when m.same_lot then 1 end,
           case when m.same_part then 2 end,
           case when m.same_model then 3 end
         ], null)
    from public.voc v
    left join public.vehicle_part vp on vp.vin = v.vin and vp.part_no = v.part_no
    left join public.vehicle x on x.vin = v.vin
   cross join target t
   cross join lateral (
     select
       coalesce(v.part_no = p_part_no and vp.part_lot = t.part_lot, false) as same_lot,
       coalesce(v.voc_type = p_voc_type and v.system = p_system and v.part_no = p_part_no, false) as same_part,
       coalesce(x.model = t.model and v.voc_type = p_voc_type and v.system = p_system, false) as same_model
   ) m
   where (m.same_lot or m.same_part or m.same_model)
     and v.voc_id is distinct from p_exclude_voc_id
   order by v.received_at desc, v.voc_id desc;
$$;

revoke execute on function public.find_similar_vocs(text, text, text, text, text)
  from public, anon;
grant execute on function public.find_similar_vocs(text, text, text, text, text)
  to authenticated, service_role;

commit;
