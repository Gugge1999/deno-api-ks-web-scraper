--
-- PostgreSQL database dump
--

\restrict xpuhICgbPPk7x887cXt6UowShMFUNTqZxbX6KEECB2i9XWQcqm7VuQ1YpNw8G8X

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-26 13:03:00

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
-- TOC entry 2 (class 3079 OID 16401)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 236 (class 1255 OID 16478)
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
-- TOC entry 224 (class 1259 OID 16458)
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
-- TOC entry 223 (class 1259 OID 16445)
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
-- TOC entry 222 (class 1259 OID 16444)
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
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 222
-- Name: migrations_migration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_migration_id_seq OWNED BY public.migrations.migration_id;


--
-- TOC entry 221 (class 1259 OID 16429)
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sent timestamp(2) with time zone DEFAULT clock_timestamp() NOT NULL,
    watch_id uuid CONSTRAINT notification_watch_id_v7_not_null NOT NULL
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16479)
-- Name: testing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testing (
    id uuid DEFAULT uuidv7() NOT NULL,
    name text
);


ALTER TABLE public.testing OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16412)
-- Name: watch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watch (
    label character varying NOT NULL,
    watches json NOT NULL,
    active boolean NOT NULL,
    watch_to_scrape character varying NOT NULL,
    last_email_sent timestamp(2) with time zone,
    added timestamp(2) with time zone DEFAULT clock_timestamp() NOT NULL,
    last_changed timestamp(2) with time zone DEFAULT clock_timestamp() NOT NULL,
    id uuid DEFAULT uuidv7() CONSTRAINT watch_id_v7_not_null NOT NULL
);


ALTER TABLE public.watch OWNER TO postgres;

--
-- TOC entry 4889 (class 2604 OID 16448)
-- Name: migrations migration_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN migration_id SET DEFAULT nextval('public.migrations_migration_id_seq'::regclass);


--
-- TOC entry 5064 (class 0 OID 16458)
-- Dependencies: 224
-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_user (id, username, email, password, added, last_changed) FROM stdin;
\.


--
-- TOC entry 5063 (class 0 OID 16445)
-- Dependencies: 223
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (migration_id, created_at, name, last_changed) FROM stdin;
1	2024-12-14 20:15:52.202945+01	initial	2025-07-03 21:45:48.96+02
2	2024-12-14 20:15:52.202945+01	initial	2025-07-03 21:45:48.96+02
3	2024-12-15 21:41:28.588377+01	initial	2025-07-03 21:45:48.96+02
4	2025-01-20 21:28:11.922072+01	initial	2025-07-03 21:45:48.96+02
5	2025-07-03 21:45:48.897131+02	initial	2025-07-03 21:45:49+02
6	2025-10-26 12:01:35.22501+01	initial	2025-10-26 12:01:35.29+01
\.


--
-- TOC entry 5061 (class 0 OID 16429)
-- Dependencies: 221
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, sent, watch_id) FROM stdin;
49b7f3ef-d653-4ab3-af2b-6e173fb3cf4e	2026-01-10 21:17:19.43+01	019d44f0-932f-7308-b002-c693f50f6d97
185a41a1-81e2-4110-b82e-5d0561e0a79e	2026-01-10 21:18:19.56+01	019d44f0-932f-754d-a3d6-49f3e32da3c6
74c4a63a-95cc-4369-90c8-4e819efcf54d	2026-01-10 21:19:50.1+01	019d44f0-932f-754d-a3d6-49f3e32da3c6
72711023-ab57-49b1-9d0f-57d68e4cb342	2026-01-17 13:51:19.65+01	019d44f0-932f-7308-b002-c693f50f6d97
9a16a8b3-213e-4a3f-867f-579b7763e011	2026-03-12 18:23:06.57+01	019d44f0-932f-7308-b002-c693f50f6d97
\.


--
-- TOC entry 5065 (class 0 OID 16479)
-- Dependencies: 225
-- Data for Name: testing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testing (id, name) FROM stdin;
019a457a-c397-7fc7-a5ea-d4fc1bc0aa39	asdasdasd
019a6487-d851-7992-9cb0-3174b2a2b728	asdasdasd
019a6487-dada-71eb-8b88-d64510e3fb29	asdasdasd
019a6487-dcad-7a6f-978e-d218f4ae16ae	asdasdasd
019a6487-dd51-7116-8e07-cdbb84d64505	asdasdasd
019a6487-ddee-7240-ab8d-f5863f79dc7c	asdasdasd
019a6487-de85-7401-8840-b8f59eebb47b	asdasdasd
019a6487-df28-7d63-a544-bd21251224df	asdasdasd
019a6487-dfc5-7363-9a9c-e29ea12a4984	asdasdasd
019a6487-e064-7ad4-993a-6d9b096f78c1	asdasdasd
019a6487-e104-78f9-8b8a-7dd6f7d56fc8	asdasdasd
019a6487-e1a9-723d-bc26-b74510d69f2f	asdasdasd
019a6487-e249-7a87-8707-441f2be3fc5d	asdasdasd
019a6487-e2e3-7d1e-a691-f2c2757014c3	asdasdasd
019a6487-e37b-7496-9106-0a4ae709a9e9	asdasdasd
019a6487-e45b-75d2-9d3a-2c264e034b13	asdasdasd
019a6487-e49b-74cd-bf2e-9a76f64461ee	asdasdasd
019a6487-e4ff-74c8-ba03-e80ae0c24793	asdasdasd
019a6487-e54f-7889-ae80-7c9b98c50af3	asdasdasd
019a6487-e59f-77ad-95d9-00127ec8e026	asdasdasd
019a6487-e5f3-777c-95be-3648ee5dce24	asdasdasd
019a6487-e63f-731c-b793-4a4b186b803d	asdasdasd
019a6487-e68b-7389-8e1a-17cd5fd6edf3	asdasdasd
019a6487-e6eb-74c4-a556-3537805dde66	asdasdasd
019a6487-e793-706a-986b-8fa73a9921fe	asdasdasd
019a6487-e7d6-7e08-b444-9c44a34a07bc	asdasdasd
019a6487-e837-71f5-9e1e-c1a1b32c7638	asdasdasd
019a6487-e883-768b-a863-d711ac272020	asdasdasd
019a6487-e8df-782a-bc68-58c7dac0bb94	asdasdasd
019a6487-e923-702b-a960-56677b22f28c	asdasdasd
019a6487-e993-7717-8245-4e669fc9f9d8	asdasdasd
019a6487-e9e3-72be-a530-3384fe04605d	asdasdasd
019a6487-ea4b-762e-848a-b43aa6b229f3	asdasdasd
019a6487-eae2-7eca-8532-90aaba65216d	asdasdasd
019a6487-ebab-71c2-8a0f-a85bb3130dee	asdasdasd
019a6487-ebf7-713f-84ca-bab18f71db84	asdasdasd
019a6487-ec63-72de-ba6b-a474d85945ad	asdasdasd
019a6487-ecb0-73fa-a219-3f6c6b24790d	asdasdasd
019a6487-ed16-7e8e-8418-5233f2b7df33	asdasdasd
019a6487-edd7-733e-95e9-eb89816345f9	asdasdasd
019a6487-ee86-761a-b6c5-e6e6722d2a8d	asdasdasd
019a6487-eed2-713c-8c9e-ed49dfc5f678	asdasdasd
019a6487-ef43-7a54-9054-41bcf5672ba9	asdasdasd
019a6487-ef82-7d1c-b112-73e6ff46449d	asdasdasd
019a6487-effa-75a6-8c9b-bc44ed5feca0	asdasdasd
019a6487-f03b-715f-af35-1eaa0b8262bb	asdasdasd
019a6487-f0ae-791e-b555-bb17781bb2d2	asdasdasd
019a6487-f0fc-7462-9e2b-a1d1cb418621	asdasdasd
019a6487-f167-7022-89a7-790977f15314	asdasdasd
019a6487-f1b7-7d53-b3d5-e29fc0d7e152	asdasdasd
019a6487-f21c-7ff0-ade4-f6f227f63bd6	asdasdasd
019a6487-f26e-7de1-95da-73edf0fb947c	asdasdasd
019a6487-f2c3-7a41-97bc-6f10149ddd26	asdasdasd
019a6487-f327-7935-b878-aa531da91ec9	asdasdasd
019a6487-f388-7430-85df-f12bf61a09e2	asdasdasd
019a6487-f3db-7128-a2a1-96d3c2e6ea46	asdasdasd
019a6487-f446-7fcc-bee5-e237613dc666	asdasdasd
019a6487-f49b-75dc-8167-c4061d3dae50	asdasdasd
019a6487-f50b-75ed-b1e8-fe6fb82d17ac	asdasdasd
019a6487-f563-78ae-a542-95ea50ce2091	asdasdasd
019a6487-f5cb-7105-8fe1-c5bd2345d80f	asdasdasd
019a6487-f623-737b-bb9f-3f23d6fc793c	asdasdasd
019a6487-f687-7340-b2af-61f0e45a4984	asdasdasd
019a6487-f6de-70eb-950d-0d66dc8b9bbf	asdasdasd
019a6487-f745-7efe-8218-b6105bbbbc8b	asdasdasd
019a6487-f79e-7e5e-9c7b-c2528876a30b	asdasdasd
019a6487-f807-7319-a209-8f64f731cba3	asdasdasd
019a6487-f859-7d42-88ed-1693d6c181ea	asdasdasd
019a6487-f8ca-7d89-9f9b-795c378f991f	asdasdasd
019a6487-f91a-7bb4-9cb7-58279e87e1b9	asdasdasd
019a6487-f986-7fd8-93f3-80202f4e815e	asdasdasd
019a6487-f9de-7cbe-b8f5-c4f3d5a1a1b5	asdasdasd
019a6487-fa4a-7b1f-97de-059f995865a7	asdasdasd
019a6487-faa2-7582-8875-cbfc75d6ae4b	asdasdasd
019a6487-fb0d-7aa5-b77d-93d7c742f068	asdasdasd
019a6487-fb69-7ddf-9ac9-b14befbeaa26	asdasdasd
019a6487-fbd9-7ca5-b956-6d18d09449d2	asdasdasd
019a6487-fc2d-7d53-a548-0fe8dc181059	asdasdasd
019a6487-fca2-78ca-9af0-a8bc2e7c6dc7	asdasdasd
019a6487-fcf6-7194-9179-4c835eb19ea4	asdasdasd
019a6487-fd66-7214-b89e-a72e054bf2b2	asdasdasd
019a6487-fdc2-7885-b424-01653936087b	asdasdasd
019a6487-fe2d-7f4d-bd98-842c7fed83da	asdasdasd
019a6487-fe7d-7ce3-8064-8d52499f4441	asdasdasd
019a6487-fede-74b9-8c8c-05735f93dfb4	asdasdasd
019a6487-ff26-7451-bed3-00ab29c8aa30	asdasdasd
019a6487-ff91-7cb6-92dc-7dccfc58cd43	asdasdasd
019a6487-ffe9-79a1-848e-27567dc3ac26	asdasdasd
019a6488-0045-7d0b-af57-6d0aa2d4634a	asdasdasd
019a6488-009e-70b6-932b-334e21a5bcb6	asdasdasd
019a6488-0109-7a37-b29d-c54979ec9e0b	asdasdasd
019a6488-0165-78f9-92eb-5f25456e7886	asdasdasd
019a6488-01d2-70f1-a566-1820bb88242e	asdasdasd
019a6488-0235-7944-9c6a-eaa008d89c8e	asdasdasd
019a6488-02a1-7f7b-b57e-c8e2e40804c6	asdasdasd
019a6488-02fd-7c50-be27-f0472281db1c	asdasdasd
019a6488-036d-791b-9547-cedf423869d9	asdasdasd
019a6488-03c5-77f2-aac8-520cba3fd984	asdasdasd
019a6488-0432-7870-9f79-f55fa031704e	asdasdasd
019a6488-0485-7d6a-bbc2-877e78072947	asdasdasd
019a6488-04e5-7a01-bf69-1c147bf69f12	asdasdasd
019a6488-0549-7fe5-bb86-c096d50ce573	asdasdasd
019a6488-05aa-7dbc-87a0-26873cde1971	asdasdasd
019a6488-060d-7ae9-a5c7-f0a373516418	asdasdasd
019a6488-0665-7cd5-8507-f16fe9e34794	asdasdasd
\.


--
-- TOC entry 5060 (class 0 OID 16412)
-- Dependencies: 220
-- Data for Name: watch; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.watch (label, watches, active, watch_to_scrape, last_email_sent, added, last_changed, id) FROM stdin;
seiko	[{"name":"Seiko srpl93","postedDate":"2026-01-10T15:17:25.000Z","link":"https://klocksnack.se/threads/seiko-srpl93.205020/"},{"name":"Seiko 7C43-7010 | Citizen Aqualand JP2000-08E","postedDate":"2026-01-09T14:51:22.000Z","link":"https://klocksnack.se/threads/seiko-7c43-7010-citizen-aqualand-jp2000-08e.204989/"},{"name":"uncle seiko jubilee tudor bb58","postedDate":"2026-01-09T13:39:13.000Z","link":"https://klocksnack.se/threads/uncle-seiko-jubilee-tudor-bb58.204987/"},{"name":"Bytes Grand Seiko SBGX343","postedDate":"2026-01-09T08:31:44.000Z","link":"https://klocksnack.se/threads/grand-seiko-sbgx343.204979/"},{"name":"Citizen Promaster Eco-Drive BN0150-10E","postedDate":"2026-01-08T20:40:56.000Z","link":"https://klocksnack.se/threads/citizen-promaster-eco-drive-bn0150-10e.204971/"},{"name":"Seiko Speedtimer Srq053j1","postedDate":"2026-01-08T17:57:28.000Z","link":"https://klocksnack.se/threads/seiko-speedtimer-srq053j1.204963/"},{"name":"Vintage Seiko 6105-8110 Willard, Seiko 7548-7000","postedDate":"2026-01-08T11:52:36.000Z","link":"https://klocksnack.se/threads/seiko-6105-8110-willard-seiko-7548-7000.204955/"},{"name":"Seiko Speedtimer SSC813P1","postedDate":"2026-01-08T10:43:49.000Z","link":"https://klocksnack.se/threads/seiko-speedtimer-ssc813p1.204952/"},{"name":"Seiko Seiko SPB183 - PB","postedDate":"2026-01-06T20:24:21.000Z","link":"https://klocksnack.se/threads/seiko-spb183-pb.204919/"},{"name":"Seiko spb213","postedDate":"2026-01-06T19:37:22.000Z","link":"https://klocksnack.se/threads/seiko-spb213.204915/"},{"name":"Seiko SPB143","postedDate":"2026-01-06T12:03:34.000Z","link":"https://klocksnack.se/threads/seiko-spb143.204893/"},{"name":"Omega Seamaster 200m Prebond quartz  Seiko Automatic SSK023 Field GMT","postedDate":"2026-01-05T18:02:25.000Z","link":"https://klocksnack.se/threads/omega-seamaster-200m-prebond-quartz-seiko-automatic-ssk023-field-gmt.204870/"},{"name":"SEIKO 5 Sports SRPD63K1","postedDate":"2026-01-04T20:16:44.000Z","link":"https://klocksnack.se/threads/seiko-5-sports-srpd63k1.204841/"},{"name":"Länk till Seiko 6139 6012 bruce lee","postedDate":"2026-01-03T09:44:34.000Z","link":"https://klocksnack.se/threads/l%C3%A4nk-till-seiko-6139-6012-bruce-lee.204787/"},{"name":"Seiko PADI SRPA21","postedDate":"2026-01-02T13:59:34.000Z","link":"https://klocksnack.se/threads/seiko-padi-srpa21.204774/"},{"name":"Seiko 7548-dykare","postedDate":"2026-01-01T12:58:34.000Z","link":"https://klocksnack.se/threads/seiko-7548-dykare.204749/"},{"name":"Citizen aqualand 40th anyversary Black. Limited Ed.","postedDate":"2025-12-29T12:10:50.000Z","link":"https://klocksnack.se/threads/citizen-aqualand-40th-anyversary-black-limited-ed.204680/"},{"name":"Seiko 5 GMT SSK035SBSC019","postedDate":"2025-12-29T09:37:25.000Z","link":"https://klocksnack.se/threads/seiko-5-gmt-ssk035-sbsc019.204671/"},{"name":"Chocolate Bar Uncle Seiko","postedDate":"2025-12-28T16:58:02.000Z","link":"https://klocksnack.se/threads/chocolate-bar-uncle-seiko.204663/"},{"name":"Seiko 6105-8000","postedDate":"2025-12-28T15:06:28.000Z","link":"https://klocksnack.se/threads/seiko-6105-8000.204660/"},{"name":"Omega Seiko Omega Globemaster | Omega 2254.50 | Seiko SPB 383","postedDate":"2025-12-28T13:31:06.000Z","link":"https://klocksnack.se/threads/omega-globemaster-omega-2254-50-ohpf-seiko-spb-383.204659/"},{"name":"Seiko SRPL93","postedDate":"2025-12-28T11:43:39.000Z","link":"https://klocksnack.se/threads/seiko-srpl93.204653/"},{"name":"Seiko Presage Coctail SRPB43J1","postedDate":"2025-12-27T13:16:48.000Z","link":"https://klocksnack.se/threads/seiko-presage-coctail-srpb43j1.204626/"},{"name":"Seiko SPB317","postedDate":"2025-12-26T11:18:23.000Z","link":"https://klocksnack.se/threads/seiko-spb317.204602/"},{"name":"Grand Seiko SBGN013","postedDate":"2025-12-25T10:11:05.000Z","link":"https://klocksnack.se/threads/grand-seiko-sbgn013.204580/"},{"name":"Grand Seiko SBGW001, Grand Seiko SBGR051J, Seiko Prospex SLA073J1","postedDate":"2025-12-21T15:06:05.000Z","link":"https://klocksnack.se/threads/grand-seiko-sbgw001-grand-seiko-sbgr051j-seiko-prospex-sla073j1.204519/"},{"name":"Seiko SLA019 MM300 Grön","postedDate":"2025-12-19T15:43:07.000Z","link":"https://klocksnack.se/threads/seiko-sla019-mm300-gr%C3%B6n.204479/"},{"name":"Seiko SRP777","postedDate":"2025-12-18T08:37:32.000Z","link":"https://klocksnack.se/threads/seiko-srp777.204458/"},{"name":"SSK001 Seiko GMT","postedDate":"2025-12-17T19:18:30.000Z","link":"https://klocksnack.se/threads/ssk001-seiko-gmt.204451/"},{"name":"Grand Seiko SBGT235","postedDate":"2025-12-17T07:53:39.000Z","link":"https://klocksnack.se/threads/grand-seiko-sbgt235.204440/"}]	f	https://klocksnack.se/search/1/?q=seiko&t=post&c[child_nodes]=1&c[nodes][0]=11&c[title_only]=1&o=date	2026-01-10 21:19:50.09+01	2025-11-22 21:25:03.93+01	2025-11-22 21:25:03.93+01	019d44f0-932f-754d-a3d6-49f3e32da3c6
seiko	[{"name":"Seiko SPB513","postedDate":"2026-03-12T10:07:15.000Z","link":"https://klocksnack.se/threads/seiko-spb513.206573/"},{"name":"Seiko 7A38-7280 PB","postedDate":"2026-03-11T06:55:59.000Z","link":"https://klocksnack.se/threads/seiko-7a38-7280-pb.206546/"},{"name":"Vintage  Seiko kronograf 7t32-6b89","postedDate":"2026-03-09T19:40:29.000Z","link":"https://klocksnack.se/threads/seiko-kronograf-7t32-6b89.206521/"},{"name":"Vintage  Seiko 6105-8000","postedDate":"2026-03-09T16:49:18.000Z","link":"https://klocksnack.se/threads/seiko-6105-8000.206516/"},{"name":"Boxig retro Seiko (70–90-tal)","postedDate":"2026-03-09T14:53:25.000Z","link":"https://klocksnack.se/threads/boxig-retro-seiko-70%E2%80%9390-tal.206514/"},{"name":"Grand Seiko 57GS (5722-9990)","postedDate":"2026-03-09T13:17:35.000Z","link":"https://klocksnack.se/threads/grand-seiko-57gs-5722-9990.206512/"},{"name":"Seiko Quartz kronograf, Flightmaster 7T34-6A00","postedDate":"2026-03-09T07:10:32.000Z","link":"https://klocksnack.se/threads/seiko-quartz-kronograf-flightmaster-7t34-6a00.206506/"},{"name":"Seiko - Snygg Salmon Dial","postedDate":"2026-03-08T21:28:10.000Z","link":"https://klocksnack.se/threads/seiko-snygg-salmon-dial.206504/"},{"name":"Seiko  Seiko Turtle SRP777","postedDate":"2026-03-08T17:53:11.000Z","link":"https://klocksnack.se/threads/seiko-turtle-srp777.206495/"},{"name":"Seiko SRPH17","postedDate":"2026-03-08T14:35:49.000Z","link":"https://klocksnack.se/threads/seiko-srph17.206487/"},{"name":"PB2 Grand Seiko SBGW231","postedDate":"2026-03-08T11:42:28.000Z","link":"https://klocksnack.se/threads/pb2-grand-seiko-sbgw231.206477/"},{"name":"Vintage Seiko Grand Quartz 9943-8000","postedDate":"2026-03-07T17:33:06.000Z","link":"https://klocksnack.se/threads/seiko-grand-quartz-9943-8000.206460/"},{"name":"Grand Seiko “White Birch” SLGA009G","postedDate":"2026-03-07T16:42:06.000Z","link":"https://klocksnack.se/threads/grand-seiko-%E2%80%9Cwhite-birch%E2%80%9D-slga009g.206459/"},{"name":"Seiko SPB155 Baby Alpinist Grön","postedDate":"2026-03-06T16:41:08.000Z","link":"https://klocksnack.se/threads/seiko-spb155-baby-alpinist-gr%C3%B6n.206439/"},{"name":"Grand Seiko SBGJ259","postedDate":"2026-03-06T13:07:10.000Z","link":"https://klocksnack.se/threads/grand-seiko-sbgj259.206430/"},{"name":"Seiko snxs79","postedDate":"2026-03-06T10:12:35.000Z","link":"https://klocksnack.se/threads/seiko-snxs79.206422/"},{"name":"Seiko A169-5010","postedDate":"2026-03-05T14:11:54.000Z","link":"https://klocksnack.se/threads/seiko-a169-5010.206403/"},{"name":"Grand Seiko  Grand Seiko SBGM221 GMT","postedDate":"2026-03-05T11:08:09.000Z","link":"https://klocksnack.se/threads/grand-seiko-sbgm221-gmt.206396/"},{"name":"Seiko 6458-600A","postedDate":"2026-03-05T08:01:44.000Z","link":"https://klocksnack.se/threads/seiko-6458-600a.206391/"},{"name":"Rolex Datejust 1601","postedDate":"2026-03-04T12:48:37.000Z","link":"https://klocksnack.se/threads/rolex-datejust-1601.206370/"},{"name":"Grand Seiko  Grand Seiko SBGN003, 19.500kr","postedDate":"2026-03-04T08:49:48.000Z","link":"https://klocksnack.se/threads/grand-seiko-sbgn003-19-500kr.206366/"},{"name":"Seiko Seiko SRPD01K1 LE","postedDate":"2026-03-04T00:35:53.000Z","link":"https://klocksnack.se/threads/seiko-srpd01k1-le.206361/"},{"name":"Seiko SRPE93 eller SRP777!","postedDate":"2026-03-03T22:41:33.000Z","link":"https://klocksnack.se/threads/seiko-srpe93-eller-srp777.206360/"},{"name":"Seiko SKX009","postedDate":"2026-03-03T06:38:04.000Z","link":"https://klocksnack.se/threads/seiko-skx009.206337/"},{"name":"Seiko 7T27-7A20 Försvarsmakten","postedDate":"2026-03-02T14:51:32.000Z","link":"https://klocksnack.se/threads/seiko-7t27-7a20-f%C3%B6rsvarsmakten.206322/"},{"name":"Seiko King Turtle SRPE03K1","postedDate":"2026-03-02T10:18:43.000Z","link":"https://klocksnack.se/threads/seiko-king-turtle-srpe03k1.206317/"},{"name":"Seiko SKX007","postedDate":"2026-03-02T10:07:21.000Z","link":"https://klocksnack.se/threads/seiko-skx007.206316/"},{"name":"Seiko SDGM003 PB","postedDate":"2026-03-01T14:23:19.000Z","link":"https://klocksnack.se/threads/seiko-sdgm003-pb.206295/"},{"name":"Uncle Straps Executive Bracelet (Seiko 5 SNXS)","postedDate":"2026-02-28T16:05:21.000Z","link":"https://klocksnack.se/threads/uncle-straps-executive-bracelet-seiko-5-snxs.206265/"},{"name":"Seiko SPB143","postedDate":"2026-02-28T08:56:34.000Z","link":"https://klocksnack.se/threads/seiko-spb143.206250/"}]	f	https://klocksnack.se/search/1/?q=seiko&t=post&c[child_nodes]=1&c[nodes][0]=11&c[title_only]=1&o=date	2026-03-12 18:23:06.5+01	2025-11-22 21:23:33.03+01	2025-11-22 21:23:33.03+01	019d44f0-932f-7308-b002-c693f50f6d97
Hejsan	[{"name":"Rolex Sea-Dweller 16600","postedDate":"2026-04-25T09:05:15.000Z","link":"https://klocksnack.se/threads/rolex-sea-dweller-16600.207821/"},{"name":"Rolex GMT-Master II 126711CHNR","postedDate":"2026-04-24T09:18:00.000Z","link":"https://klocksnack.se/threads/rolex-gmt-master-ii-126711chnr.207791/"},{"name":"Rolex Explorer, 114270","postedDate":"2026-04-24T08:40:11.000Z","link":"https://klocksnack.se/threads/rolex-explorer-114270.207788/"},{"name":"Rolex GMT Master 2 116710BLNR","postedDate":"2026-04-23T15:38:30.000Z","link":"https://klocksnack.se/threads/rolex-gmt-master-2-116710blnr.207765/"},{"name":"Rolex Datejust 41mm","postedDate":"2026-04-23T15:34:21.000Z","link":"https://klocksnack.se/threads/rolex-datejust-41mm.207764/"},{"name":"Rolex Daytona 116518","postedDate":"2026-04-22T15:11:26.000Z","link":"https://klocksnack.se/threads/rolex-daytona-116518.207739/"},{"name":"Rolex Submariner 116610LV","postedDate":"2026-04-22T11:28:27.000Z","link":"https://klocksnack.se/threads/rolex-submariner-116610lv.207735/"},{"name":"Rolex Datejust 16234","postedDate":"2026-04-22T10:27:41.000Z","link":"https://klocksnack.se/threads/rolex-datejust-16234.207733/"},{"name":"Rolex Explorer II 21657","postedDate":"2026-04-22T10:19:37.000Z","link":"https://klocksnack.se/threads/rolex-explorer-ii-21657.207732/"},{"name":"16610 sökes!","postedDate":"2026-04-21T21:42:25.000Z","link":"https://klocksnack.se/threads/16610-s%C3%B6kes.207723/"},{"name":"Rolex DJ31 278274 -","postedDate":"2026-04-21T13:56:33.000Z","link":"https://klocksnack.se/threads/rolex-dj31-278274.207712/"},{"name":"Rolex 14270 PB2","postedDate":"2026-04-21T13:12:35.000Z","link":"https://klocksnack.se/threads/rolex-14270-pb2.207710/"},{"name":"Rolex Submariner 16610LV","postedDate":"2026-04-21T10:01:19.000Z","link":"https://klocksnack.se/threads/rolex-submariner-16610lv.207709/"},{"name":"Rolex Datejust 41 126334 Dia","postedDate":"2026-04-21T09:56:51.000Z","link":"https://klocksnack.se/threads/rolex-datejust-41-126334-dia.207708/"},{"name":"Rolex GMT-Master 16700","postedDate":"2026-04-20T19:25:24.000Z","link":"https://klocksnack.se/threads/rolex-gmt-master-16700.207696/"},{"name":"Rolex Explorer I 114270","postedDate":"2026-04-20T16:03:00.000Z","link":"https://klocksnack.se/threads/rolex-explorer-i-114270.207689/"},{"name":"Rolex Explorer 124270","postedDate":"2026-04-20T14:39:28.000Z","link":"https://klocksnack.se/threads/rolex-explorer-124270.207688/"},{"name":"Rolex Yacht-Master 40 116655","postedDate":"2026-04-20T09:31:20.000Z","link":"https://klocksnack.se/threads/rolex-yacht-master-40-116655.207679/"},{"name":"Rolex Submariner 126610LV","postedDate":"2026-04-20T09:11:20.000Z","link":"https://klocksnack.se/threads/rolex-submariner-126610lv.207677/"},{"name":"Rolex Explorer 224270","postedDate":"2026-04-19T16:08:09.000Z","link":"https://klocksnack.se/threads/rolex-explorer-224270.207662/"},{"name":"Rolex Submariner 126610LV","postedDate":"2026-04-19T16:02:39.000Z","link":"https://klocksnack.se/threads/rolex-submariner-126610lv.207659/"},{"name":"Rolex Cellini 4014 vitguld PB 234","postedDate":"2026-04-19T15:01:03.000Z","link":"https://klocksnack.se/threads/rolex-cellini-4014-vitguld-pb-23-4.207654/"},{"name":"Rolex datejust 126300","postedDate":"2026-04-19T06:47:57.000Z","link":"https://klocksnack.se/threads/rolex-datejust-126300.207644/"},{"name":"Rolex Explorer II 16570","postedDate":"2026-04-17T22:37:31.000Z","link":"https://klocksnack.se/threads/rolex-explorer-ii-16570.207616/"},{"name":"Rolex Datejust 16220","postedDate":"2026-04-17T17:43:23.000Z","link":"https://klocksnack.se/threads/rolex-datejust-16220.207608/"},{"name":"Rolex Explorer II 16570 – Polar","postedDate":"2026-04-16T17:46:56.000Z","link":"https://klocksnack.se/threads/rolex-explorer-ii-16570-%E2%80%93-polar.207579/"},{"name":"Rolex Daytona 126500LN","postedDate":"2026-04-16T15:18:31.000Z","link":"https://klocksnack.se/threads/rolex-daytona-126500ln.207574/"},{"name":"Rolex Submariner Vitguld 126619LB","postedDate":"2026-04-16T15:17:46.000Z","link":"https://klocksnack.se/threads/rolex-submariner-vitguld-126619lb.207573/"},{"name":"Rolex Datejust 36 126234 Wimbledon PB1","postedDate":"2026-04-16T09:23:12.000Z","link":"https://klocksnack.se/threads/rolex-datejust-36-126234-wimbledon-pb1.207559/"},{"name":"Rolex Datejust 16233 62K","postedDate":"2026-04-15T06:28:11.000Z","link":"https://klocksnack.se/threads/rolex-datejust-16233-62k.207525/"}]	t	https://klocksnack.se/search/1/?q=rolex&t=post&c[child_nodes]=1&c[nodes][0]=11&c[title_only]=1&o=date	\N	2026-04-25 16:01:40.36+02	2026-04-25 16:01:40.36+02	019dc4f2-3303-741c-9d2e-cc5efc15e4e4
\.


--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 222
-- Name: migrations_migration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_migration_id_seq', 1, false);


--
-- TOC entry 4897 (class 2606 OID 17562)
-- Name: watch PK_fcd14254f9a60722c954c0174d0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watch
    ADD CONSTRAINT "PK_fcd14254f9a60722c954c0174d0" PRIMARY KEY (id);


--
-- TOC entry 4905 (class 2606 OID 16473)
-- Name: app_user app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);


--
-- TOC entry 4903 (class 2606 OID 16457)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (migration_id);


--
-- TOC entry 4901 (class 2606 OID 16438)
-- Name: notification notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4911 (class 2606 OID 16487)
-- Name: testing testing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testing
    ADD CONSTRAINT testing_pkey PRIMARY KEY (id);


--
-- TOC entry 4907 (class 2606 OID 16477)
-- Name: app_user unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- TOC entry 4909 (class 2606 OID 16475)
-- Name: app_user unique_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- TOC entry 4899 (class 2606 OID 17555)
-- Name: watch watch_id_v7_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watch
    ADD CONSTRAINT watch_id_v7_unique UNIQUE (id);


--
-- TOC entry 4912 (class 2606 OID 17556)
-- Name: notification notification_watch_id_v7_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_watch_id_v7_fkey FOREIGN KEY (watch_id) REFERENCES public.watch(id);


-- Completed on 2026-04-26 13:03:01

--
-- PostgreSQL database dump complete
--

\unrestrict xpuhICgbPPk7x887cXt6UowShMFUNTqZxbX6KEECB2i9XWQcqm7VuQ1YpNw8G8X

