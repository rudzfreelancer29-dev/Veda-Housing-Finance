--
-- PostgreSQL database dump
--

\restrict EmSbsxKWRAAThuoUVNe0zIkOPqKCRUMdColmXa7xYuxT46ekLCHtKsY2CKpddTF

-- Dumped from database version 18.6 (Postgres.app)
-- Dumped by pg_dump version 18.6 (Postgres.app)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_notifications; Type: TABLE; Schema: public; Owner: rudz
--

CREATE TABLE public.admin_notifications (
    id integer NOT NULL,
    actor_user_id integer,
    message character varying(255) NOT NULL,
    entity character varying(60),
    entity_id integer,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_notifications OWNER TO rudz;

--
-- Name: admin_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: rudz
--

CREATE SEQUENCE public.admin_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_notifications_id_seq OWNER TO rudz;

--
-- Name: admin_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudz
--

ALTER SEQUENCE public.admin_notifications_id_seq OWNED BY public.admin_notifications.id;


--
-- Name: applications; Type: TABLE; Schema: public; Owner: rudz
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    status character varying(30) DEFAULT 'new_registration'::character varying NOT NULL,
    assigned_to integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT applications_status_check CHECK (((status)::text = ANY ((ARRAY['new_registration'::character varying, 'under_review'::character varying, 'documents_pending'::character varying, 'eligible'::character varying, 'payment_pending'::character varying, 'payment_completed'::character varying, 'loan_processing'::character varying, 'completed'::character varying, 'rejected'::character varying, 'on_hold'::character varying])::text[])))
);


ALTER TABLE public.applications OWNER TO rudz;

--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: rudz
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO rudz;

--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudz
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: rudz
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(60) NOT NULL,
    entity character varying(60),
    entity_id integer,
    details text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO rudz;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: rudz
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO rudz;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudz
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: rudz
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    reference_id character varying(20) NOT NULL,
    full_name character varying(120) NOT NULL,
    mobile_number character varying(20) NOT NULL,
    email character varying(160),
    date_of_birth date,
    pan_number character varying(20),
    aadhaar_number character varying(20),
    employment_details character varying(160),
    monthly_income numeric(14,2),
    loan_requirement_details text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO rudz;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: rudz
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO rudz;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudz
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: rudz
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    doc_type character varying(60) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    uploaded_by integer,
    uploaded_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documents OWNER TO rudz;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: rudz
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_id_seq OWNER TO rudz;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudz
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: rudz
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    application_id integer NOT NULL,
    amount numeric(14,2) NOT NULL,
    fee_type character varying(60) DEFAULT 'processing_fee'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    gateway_order_id character varying(120),
    gateway_payment_id character varying(120),
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'successful'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO rudz;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: rudz
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO rudz;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudz
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: rudz
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(120) NOT NULL,
    email character varying(160) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'manager'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    reset_token_hash character varying(255),
    reset_token_expires timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    mobile_number character varying(15),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['super_admin'::character varying, 'manager'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO rudz;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: rudz
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO rudz;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudz
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admin_notifications id; Type: DEFAULT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.admin_notifications ALTER COLUMN id SET DEFAULT nextval('public.admin_notifications_id_seq'::regclass);


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admin_notifications; Type: TABLE DATA; Schema: public; Owner: rudz
--

COPY public.admin_notifications (id, actor_user_id, message, entity, entity_id, is_read, created_at) FROM stdin;
1	2	Manager Priya registered a new customer: Ramesh Patel	customers	1	f	2026-09-19 21:13:23.609595
2	2	Manager Priya registered a new customer: Priya Shah	customers	2	f	2026-09-19 21:13:23.612556
3	2	Manager Priya registered a new customer: Amit Verma	customers	3	f	2026-09-19 21:13:23.614054
4	2	Manager Priya registered a new customer: Sneha Joshi	customers	4	f	2026-09-19 21:13:23.615212
5	3	Test1909 registered a new customer: Rudra Rajput (VF-2026-00005)	customers	5	f	2026-09-19 22:29:47.944597
6	3	Test1909 registered a new customer: Xyz (VF-2026-00006)	customers	6	f	2026-09-19 22:34:21.044303
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: rudz
--

COPY public.applications (id, customer_id, status, assigned_to, created_at, updated_at) FROM stdin;
1	1	under_review	2	2026-09-19 21:13:23.607884	2026-09-19 21:13:23.607884
2	2	eligible	2	2026-09-19 21:13:23.612101	2026-09-19 21:13:23.612101
3	3	completed	2	2026-09-19 21:13:23.613695	2026-09-19 21:13:23.613695
4	4	rejected	2	2026-09-19 21:13:23.614897	2026-09-19 21:13:23.614897
5	5	new_registration	3	2026-09-19 22:29:47.940569	2026-09-19 22:29:47.940569
6	6	eligible	3	2026-09-19 22:34:21.041159	2026-09-20 14:43:51.866318
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: rudz
--

COPY public.audit_logs (id, user_id, action, entity, entity_id, details, created_at) FROM stdin;
1	1	login	users	1	super_admin logged in	2026-09-19 21:22:41.125899
2	1	create_manager	users	3	Created manager account: test@gmail.com	2026-09-19 22:27:59.624009
3	3	login	users	3	manager logged in	2026-09-19 22:28:31.671411
4	3	register_customer	customers	5	Registered customer: Rudra Rajput (VF-2026-00005)	2026-09-19 22:29:47.943313
5	3	login	users	3	manager logged in	2026-09-19 22:30:58.307383
6	3	login	users	3	manager logged in	2026-09-19 22:31:04.272356
7	3	login	users	3	manager logged in	2026-09-19 22:31:09.445889
8	1	login	users	1	super_admin logged in	2026-09-19 22:31:39.018472
9	3	login	users	3	manager logged in	2026-09-19 22:33:15.437131
10	3	register_customer	customers	6	Registered customer: Xyz (VF-2026-00006)	2026-09-19 22:34:21.043435
11	3	login	users	3	manager logged in	2026-09-19 22:35:30.786241
12	1	login	users	1	super_admin logged in	2026-09-19 22:52:39.408434
13	3	login	users	3	manager logged in	2026-09-19 22:54:49.201352
14	1	login	users	1	super_admin logged in	2026-09-19 23:16:39.803116
15	1	login	users	1	super_admin logged in	2026-09-20 14:29:48.749646
16	1	login	users	1	super_admin logged in	2026-09-20 14:29:53.585715
17	1	login	users	1	super_admin logged in	2026-09-20 14:30:50.977381
18	1	update_application_status	applications	6	Status changed to 'eligible' (Super Admin override)	2026-09-20 14:43:51.870026
19	1	login	users	1	super_admin logged in	2026-09-21 22:14:55.316143
20	1	login	users	1	super_admin logged in	2026-09-24 23:00:25.181846
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: rudz
--

COPY public.customers (id, reference_id, full_name, mobile_number, email, date_of_birth, pan_number, aadhaar_number, employment_details, monthly_income, loan_requirement_details, created_by, created_at) FROM stdin;
1	VF-2026-00001	Ramesh Patel	9876543210	ramesh@example.com	\N	\N	\N	\N	45000.00	\N	2	2026-09-19 21:13:23.604434
2	VF-2026-00002	Priya Shah	9876500011	priya.shah@example.com	\N	\N	\N	\N	60000.00	\N	2	2026-09-19 21:13:23.610955
3	VF-2026-00003	Amit Verma	9876500022	amit@example.com	\N	\N	\N	\N	32000.00	\N	2	2026-09-19 21:13:23.612926
4	VF-2026-00004	Sneha Joshi	9876500033	sneha@example.com	\N	\N	\N	\N	28000.00	\N	2	2026-09-19 21:13:23.614282
5	VF-2026-00005	Rudra Rajput	8160453917	yoursrudra29@gmail.com	2006-08-29	HFJR2828L	786434897653	BDS	1000000.00	Medical	3	2026-09-19 22:29:47.936599
6	VF-2026-00006	Xyz	7777777777	rur@gmail.com	9222-09-29	JHHHHHHHH	343434343432	BCD	500000.00	ncnc	3	2026-09-19 22:34:21.037576
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: rudz
--

COPY public.documents (id, customer_id, doc_type, file_name, file_path, uploaded_by, uploaded_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: rudz
--

COPY public.payments (id, application_id, amount, fee_type, status, created_at, gateway_order_id, gateway_payment_id, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: rudz
--

COPY public.users (id, name, email, password_hash, role, is_active, reset_token_hash, reset_token_expires, created_at, mobile_number) FROM stdin;
1	Veda Super Admin	admin@vedafinance.com	$2b$10$Kwj/o6VLnfDC1GsSi8mQre4haRlyT2juM4Pa3WUOcBunT5IcK1.N2	super_admin	t	\N	\N	2026-09-19 21:13:23.4915	\N
2	Priya Manager	manager@vedafinance.com	$2b$10$T8X5ej.XbUaFWIBD37EKwuHkRlFfyt4aPqKcRbTbFLmam5K3Zzfa6	manager	t	\N	\N	2026-09-19 21:13:23.600884	\N
3	Test1909	test@gmail.com	$2b$10$.FJs3jWVy6VWt9UlAyzB0eGPhkWk897G6anafKT84CwQDC0RSI/GK	manager	t	\N	\N	2026-09-19 22:27:59.622063	\N
\.


--
-- Name: admin_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudz
--

SELECT pg_catalog.setval('public.admin_notifications_id_seq', 6, true);


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudz
--

SELECT pg_catalog.setval('public.applications_id_seq', 6, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudz
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 20, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudz
--

SELECT pg_catalog.setval('public.customers_id_seq', 6, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudz
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudz
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudz
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_reference_id_key; Type: CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_reference_id_key UNIQUE (reference_id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_notifications_read; Type: INDEX; Schema: public; Owner: rudz
--

CREATE INDEX idx_admin_notifications_read ON public.admin_notifications USING btree (is_read);


--
-- Name: idx_applications_customer; Type: INDEX; Schema: public; Owner: rudz
--

CREATE INDEX idx_applications_customer ON public.applications USING btree (customer_id);


--
-- Name: idx_applications_status; Type: INDEX; Schema: public; Owner: rudz
--

CREATE INDEX idx_applications_status ON public.applications USING btree (status);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: rudz
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_user; Type: INDEX; Schema: public; Owner: rudz
--

CREATE INDEX idx_audit_logs_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_customers_reference; Type: INDEX; Schema: public; Owner: rudz
--

CREATE INDEX idx_customers_reference ON public.customers USING btree (reference_id);


--
-- Name: idx_documents_customer; Type: INDEX; Schema: public; Owner: rudz
--

CREATE INDEX idx_documents_customer ON public.documents USING btree (customer_id);


--
-- Name: idx_payments_application; Type: INDEX; Schema: public; Owner: rudz
--

CREATE INDEX idx_payments_application ON public.payments USING btree (application_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: rudz
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: admin_notifications admin_notifications_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id);


--
-- Name: applications applications_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: applications applications_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: customers customers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: documents documents_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: payments payments_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rudz
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict EmSbsxKWRAAThuoUVNe0zIkOPqKCRUMdColmXa7xYuxT46ekLCHtKsY2CKpddTF

