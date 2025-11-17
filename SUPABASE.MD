DatumLens Development Guide: Phase 1.1 - Supabase CLI Setup
🎯 Цел на Стъпката
Да инициализираме и свържем локалния проект с отдалечения (remote) Supabase проект, използвайки Supabase CLI. Това е Best Practice за управление на схемата чрез миграции.
⚙️ Технологии
Supabase CLI
Root Project Directory (D:\myProjects\datum-lens)
Git (за commit)
⚠️ Насоки за AI Coding Buddy (Best Practice & Security)
Архитектура: Инициализацията на Supabase CLI трябва да бъде в root папката (datum-lens/), за да може да управлява целия проект.
Best Practice: Използваме CLI, а не GUI, за управление на схемата.
📝 Детайлни Инструкции (Стъпка по Стъпка)
Стъпка 1: Инсталиране на Supabase CLI (Ако вече не е инсталиран)
[Инструкция за AI Buddy]: Провери дали Supabase CLI е инсталиран. Ако не е, инсталирай го глобално според операционната система на разработчика.
(Забележка: Това е еднократна инсталация на работната машина.)
Стъпка 2: Инициализация на Локалния Supabase Проект
[Инструкция за AI Buddy]: Навигирай до root директорията на проекта (D:\myProjects\datum-lens) и инициализирай локалната Supabase структура.
code
Bash

# Изпълни в D:\myProjects\datum-lens

supabase init
Очаквано Поведение: Трябва да се създаде нова папка supabase/ с подпапки migrations/, seed.sql и config.toml.
Стъпка 3: Аутентикация и Свързване
[Инструкция за AI Buddy]: Аутентикирай CLI-то с акаунта на разработчика и свържи локалната структура с remote Supabase проекта.
Логин:
code
Bash
supabase login
Действие: Ще се отвори браузър за вход в Supabase.
Свързване:
code
Bash
supabase link --project-ref [YOUR_SUPABASE_PROJECT_ID]
Действие: Замени [YOUR_SUPABASE_PROJECT_ID] с ID-то на твоя проект (можеш да го намериш в General Settings на Supabase Dashboard).
Проверка: Трябва да получиш съобщение: Finished linking project.
Стъпка 4: Финален Commit
[Инструкция за AI Buddy]: Добави новата папка supabase/ към Git и направи commit, преди да започнем миграциите.
code
Bash

# Изпълни в D:\myProjects\datum-lens

git add supabase/
git commit -m "feat(infra): Initialize Supabase CLI structure and link project"
