-- Chats table to store conversation threads
create table if not exists chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text default 'New Chat',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table to store individual messages within a chat
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references chats(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Chats
alter table chats enable row level security;

create policy "Users can view own chats" on chats
  for select to authenticated using (auth.uid() = user_id);

create policy "Users can insert own chats" on chats
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update own chats" on chats
  for update to authenticated using (auth.uid() = user_id);

create policy "Users can delete own chats" on chats
  for delete to authenticated using (auth.uid() = user_id);

-- RLS for Messages
alter table messages enable row level security;

-- Users can see messages if they own the chat
create policy "Users can view own chat messages" on messages
  for select to authenticated using (
    exists (
      select 1 from chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

-- Users can insert messages to their own chats
create policy "Users can insert own chat messages" on messages
  for insert to authenticated with check (
    exists (
      select 1 from chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );
