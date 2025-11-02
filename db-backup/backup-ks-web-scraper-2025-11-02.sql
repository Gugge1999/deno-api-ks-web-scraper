--
-- PostgreSQL database dump
--

\restrict gaRdKtEXeTEHamP6Fg0ba8y7M9ppu2wuap87rdaamlaok2ye2J2V40frtgasN6V

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_last_changed_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_last_changed_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_changed = clock_timestamp();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_last_changed_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_user (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    added timestamp(2) with time zone DEFAULT clock_timestamp() NOT NULL,
    last_changed timestamp(2) with time zone DEFAULT clock_timestamp() NOT NULL
);


ALTER TABLE public.app_user OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    migration_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text,
    last_changed timestamp(2) with time zone DEFAULT clock_timestamp() NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_migration_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_migration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_migration_id_seq OWNER TO postgres;

--
-- Name: migrations_migration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_migration_id_seq OWNED BY public.migrations.migration_id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    watch_id uuid NOT NULL,
    sent timestamp(2) with time zone DEFAULT clock_timestamp() NOT NULL
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- Name: testing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testing (
    id uuid DEFAULT uuidv7() NOT NULL,
    name text
);


ALTER TABLE public.testing OWNER TO postgres;

--
-- Name: watch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watch (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    label character varying NOT NULL,
    watches json NOT NULL,
    active boolean NOT NULL,
    watch_to_scrape character varying NOT NULL,
    last_email_sent timestamp(2) with time zone,
    added timestamp(2) with time zone DEFAULT clock_timestamp() NOT NULL,
    last_changed timestamp(2) with time zone DEFAULT clock_timestamp() NOT NULL
);


ALTER TABLE public.watch OWNER TO postgres;

--
-- Name: migrations migration_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN migration_id SET DEFAULT nextval('public.migrations_migration_id_seq'::regclass);


--
-- Name: watch PK_fcd14254f9a60722c954c0174d0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watch
    ADD CONSTRAINT "PK_fcd14254f9a60722c954c0174d0" PRIMARY KEY (id);


--
-- Name: app_user app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (migration_id);


--
-- Name: notification notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: testing testing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testing
    ADD CONSTRAINT testing_pkey PRIMARY KEY (id);


--
-- Name: app_user unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- Name: app_user unique_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- Name: notification notifications_watch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notifications_watch_id_fkey FOREIGN KEY (watch_id) REFERENCES public.watch(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict gaRdKtEXeTEHamP6Fg0ba8y7M9ppu2wuap87rdaamlaok2ye2J2V40frtgasN6V

