-- Create the public Storage bucket for project asset images
-- (character/scene/prop/style reference images uploaded or generated).
insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', true)
on conflict (id) do nothing;

-- Public read access for objects in this bucket.
create policy "project-assets public read"
on storage.objects for select
using (bucket_id = 'project-assets');

-- Authenticated users can upload/update/delete within this bucket.
create policy "project-assets authed insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'project-assets');

create policy "project-assets authed update"
on storage.objects for update
to authenticated
using (bucket_id = 'project-assets');

create policy "project-assets authed delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'project-assets');
