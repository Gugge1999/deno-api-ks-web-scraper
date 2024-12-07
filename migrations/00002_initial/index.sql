CREATE TABLE IF NOT EXISTS public.notification
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "watchId" uuid NOT NULL,
    sent timestamp(2) with time zone NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_watch_id_fkey FOREIGN KEY ("watchId")
    REFERENCES public.watch (id) MATCH SIMPLE
                      ON UPDATE NO ACTION
                      ON DELETE NO ACTION
    NOT VALID
    )

    TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.notification
    OWNER to postgres;