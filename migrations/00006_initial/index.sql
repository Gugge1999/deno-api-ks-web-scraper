ALTER TABLE public.notification
    ADD COLUMN IF NOT EXISTS last_changed timestamp(2) with time zone NOT NULL DEFAULT clock_timestamp();
