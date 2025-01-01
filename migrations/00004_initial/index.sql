-- Table: public.app_user

CREATE TABLE IF NOT EXISTS public.app_user
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    email character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    added timestamp(2) with time zone NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT app_users_pkey PRIMARY KEY (id),
    CONSTRAINT unique_email UNIQUE (email)
        INCLUDE(email)
)

    TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.app_user
    OWNER to postgres;