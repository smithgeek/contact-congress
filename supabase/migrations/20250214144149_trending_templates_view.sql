create type "public"."template_access" as enum ('public', 'private');

drop policy "Enable read access for anyone" on "public"."templates";

drop policy "Enable delete for users based on author_id" on "public"."templates";

drop policy "Enable update for users based on author id" on "public"."templates";

alter table "public"."templates" add column "access" template_access not null default 'private'::template_access;

create or replace view "public"."trending_templates" as  SELECT templates.id,
    templates.title,
    trending.activity_count
   FROM (templates
     JOIN ( SELECT ta.template_id,
            count(ta.id) AS activity_count
           FROM (template_activity ta
             JOIN templates t ON ((ta.template_id = t.id)))
          WHERE ((ta.action <> 'flag'::template_activity_id) AND (t.access = 'public'::template_access))
          GROUP BY ta.template_id
          ORDER BY (count(ta.id)) DESC
         LIMIT 10) trending ON ((templates.id = trending.template_id)));


create policy "Allow author to view their templates"
on "public"."templates"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = author_id));


create policy "Enable read access for anyone if public"
on "public"."templates"
as permissive
for select
to public
using ((access = 'public'::template_access));


create policy "Enable delete for users based on author_id"
on "public"."templates"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = author_id));


create policy "Enable update for users based on author id"
on "public"."templates"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = author_id))
with check ((( SELECT auth.uid() AS uid) = author_id));



