create or replace view "public"."trending_templates" as  SELECT templates.id,
    templates.title,
    trending.activity_count
   FROM (templates
     JOIN ( SELECT ta.template_id,
            count(ta.id) AS activity_count
           FROM template_activity ta
          WHERE (ta.action <> 'flag'::template_activity_id)
          GROUP BY ta.template_id
          ORDER BY (count(ta.id)) DESC
         LIMIT 10) trending ON ((templates.id = trending.template_id)));



