-- Veda Finance | Loan Origination System (LOS) & CRM
-- Users table â€” Super Admin + Manager roles only

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    mobile_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'manager' CHECK (
        role IN ('super_admin', 'manager')
    ),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    reset_token_hash VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Customer Registration Module (PDF Section 3) â€” CIBIL/Credit Bureau fields
-- intentionally excluded per client instruction.
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    reference_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(160),
    date_of_birth DATE,
    pan_number VARCHAR(20),
    aadhaar_number VARCHAR(20),
    employment_details VARCHAR(160),
    monthly_income NUMERIC(14, 2),
    loan_requirement_details TEXT,
    created_by INTEGER REFERENCES users (id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Customer Application Management (PDF Section 4). Status list matches the
-- PDF exactly, minus "CIBIL Checked" (excluded â€” no credit bureau in scope).
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'new_registration' CHECK (
        status IN (
            'new_registration',
            'under_review',
            'documents_pending',
            'eligible',
            'payment_pending',
            'payment_completed',
            'loan_processing',
            'completed',
            'rejected',
            'on_hold'
        )
    ),
    assigned_to INTEGER REFERENCES users (id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Payment Management Module (PDF Section 6) â€” tracking only for now; the
-- Manager-side "create/collect payment" API comes in a later phase.
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL,
    fee_type VARCHAR(60) DEFAULT 'processing_fee',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'successful',
            'failed',
            'refunded'
        )
    ),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_reference ON customers (reference_id);

CREATE INDEX IF NOT EXISTS idx_applications_customer ON applications (customer_id);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);

CREATE INDEX IF NOT EXISTS idx_payments_application ON payments (application_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    action VARCHAR(60) NOT NULL,
    entity VARCHAR(60),
    entity_id INTEGER,
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    actor_user_id INTEGER REFERENCES users (id),
    message VARCHAR(255) NOT NULL,
    entity VARCHAR(60),
    entity_id INTEGER,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications (is_read);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
    doc_type VARCHAR(60) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by INTEGER REFERENCES users (id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_customer ON documents (customer_id);

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(120);

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS gateway_payment_id VARCHAR(120);

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);