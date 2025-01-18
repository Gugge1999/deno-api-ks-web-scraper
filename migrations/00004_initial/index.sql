-- Table: public.app_user

CREATE TABLE IF NOT EXISTS public.app_user (
    id UUID NOT NULL DEFAULT UUID_GENERATE_V4 (),
    username CHARACTER VARYING COLLATE PG_CATALOG."default" NOT NULL,
    email CHARACTER VARYING COLLATE PG_CATALOG."default" NOT NULL,
    password CHARACTER VARYING COLLATE PG_CATALOG."default" NOT NULL,
    added TIMESTAMP(2) WITH TIME ZONE NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    CONSTRAINT app_users_pkey PRIMARY KEY (id),
    CONSTRAINT unique_email UNIQUE (email) INCLUDE (email),
    CONSTRAINT unique_username UNIQUE (username) INCLUDE (username)
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.app_user OWNER TO postgres;
