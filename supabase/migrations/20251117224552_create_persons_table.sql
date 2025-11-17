-- migration file: create_persons_table.sql

-- 1. Създаване на таблицата persons
CREATE TABLE public.persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Връзка към Supabase Auth
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Активиране на Row Level Security (RLS)
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

-- 3. Създаване на RLS Политика (Критично за Сигурността)
-- Политиката позволява SELECT, INSERT, UPDATE, DELETE
-- само ако auth.uid() (ID-то на логнатия потребител) съвпада с user_id в реда.
CREATE POLICY "Enable all for owners"
  ON public.persons
  FOR ALL
  TO authenticated -- Прилага се само за логнати потребители
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Добавяне на индекс за по-бързо търсене по user_id
CREATE INDEX idx_persons_user_id ON public.persons (user_id);
