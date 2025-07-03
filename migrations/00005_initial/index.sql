ALTER TABLE public.watch
ADD COLUMN IF NOT EXISTS last_changed timestamp(2) with time zone NOT NULL DEFAULT clock_timestamp();


ALTER TABLE public.migrations
ADD COLUMN IF NOT EXISTS last_changed timestamp(2) with time zone NOT NULL DEFAULT clock_timestamp();


ALTER TABLE public.app_user
ADD COLUMN IF NOT EXISTS last_changed timestamp(2) with time zone NOT NULL DEFAULT clock_timestamp();


-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_last_changed_column()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.last_changed = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists, then create it
-- Watch
DROP TRIGGER IF EXISTS set_last_changed ON public.watch;
CREATE TRIGGER set_last_changed
    BEFORE UPDATE ON public.watch
    FOR EACH ROW
EXECUTE FUNCTION update_last_changed_column();

-- notification
DROP TRIGGER IF EXISTS set_last_changed ON public.notification;
CREATE TRIGGER set_last_changed
    BEFORE UPDATE ON public.notification
    FOR EACH ROW
EXECUTE FUNCTION update_last_changed_column();

-- app_user
DROP TRIGGER IF EXISTS set_last_changed ON public.app_user;
CREATE TRIGGER set_last_changed
    BEFORE UPDATE ON public.app_user
    FOR EACH ROW
EXECUTE FUNCTION update_last_changed_column();
