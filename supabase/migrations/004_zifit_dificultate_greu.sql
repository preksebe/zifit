-- Dificultatea „avansat” devine „greu” (nivelurile: usor, mediu, greu).
alter table public.zifit_plans drop constraint if exists zifit_plans_difficulty_check;
update public.zifit_plans set difficulty = 'greu' where difficulty = 'avansat';
alter table public.zifit_plans
  add constraint zifit_plans_difficulty_check check (difficulty in ('usor', 'mediu', 'greu'));
