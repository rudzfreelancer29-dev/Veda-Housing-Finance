-- Veda Finance | Loan Origination System (LOS) & CRM
-- Users table — Super Admin + Manager roles only

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
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