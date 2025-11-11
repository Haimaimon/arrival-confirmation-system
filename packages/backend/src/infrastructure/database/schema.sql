-- Database Schema for Arrival Confirmation System
-- Clean Architecture - Infrastructure Layer

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable trigram extension for text search optimisations
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'FREE',
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    event_date TIMESTAMP NOT NULL,
    venue_name VARCHAR(255) NOT NULL,
    venue_address VARCHAR(500) NOT NULL,
    venue_city VARCHAR(100) NOT NULL,
    venue_latitude DECIMAL(10, 8),
    venue_longitude DECIMAL(11, 8),
    venue_google_maps_url TEXT,
    settings JSONB NOT NULL DEFAULT '{}',
    total_invited INTEGER DEFAULT 0,
    total_confirmed INTEGER DEFAULT 0,
    total_declined INTEGER DEFAULT 0,
    total_pending INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_user_id_event_date ON events(user_id, event_date);
CREATE INDEX idx_events_status_event_date ON events(status, event_date);

-- Guests Table
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20), -- Phone is optional
    email VARCHAR(255),
    type VARCHAR(20) NOT NULL DEFAULT 'ADULT',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    number_of_guests INTEGER DEFAULT 1,
    table_number INTEGER,
    seat_number INTEGER,
    notes TEXT,
    sms_count INTEGER DEFAULT 0,
    whatsapp_count INTEGER DEFAULT 0,
    phone_call_count INTEGER DEFAULT 0,
    last_contacted_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guests_event_id ON guests(event_id);
CREATE INDEX idx_guests_status ON guests(status);
CREATE INDEX idx_guests_phone ON guests(phone);
CREATE INDEX idx_guests_table ON guests(table_number);
CREATE INDEX idx_guests_event_id_created_at ON guests(event_id, created_at DESC);
CREATE INDEX idx_guests_event_id_status ON guests(event_id, status);
CREATE INDEX idx_guests_event_id_table ON guests(event_id, table_number);
CREATE INDEX idx_guests_event_id_last_first ON guests(event_id, last_name, first_name);
CREATE INDEX idx_guests_first_name_trgm ON guests USING GIN (first_name gin_trgm_ops);
CREATE INDEX idx_guests_last_name_trgm ON guests USING GIN (last_name gin_trgm_ops);
CREATE INDEX idx_guests_phone_trgm ON guests USING GIN (phone gin_trgm_ops);

-- Tables (Seating) Table
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    occupied_seats INTEGER DEFAULT 0,
    section VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, table_number)
);

CREATE INDEX idx_tables_event_id ON tables(event_id);
CREATE INDEX idx_tables_availability ON tables(event_id, occupied_seats);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- SMS, WHATSAPP, VOICE
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- SENT, DELIVERED, FAILED, PENDING
    message TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    twilio_message_id VARCHAR(255),
    error TEXT,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_event_id ON notifications(event_id);
CREATE INDEX idx_notifications_guest_id ON notifications(guest_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_guest_type ON notifications(guest_id, type);
CREATE INDEX idx_notifications_event_id_created_at ON notifications(event_id, created_at DESC);
CREATE INDEX idx_notifications_guest_id_created_at ON notifications(guest_id, created_at DESC);
CREATE INDEX idx_notifications_guest_type_status ON notifications(guest_id, type, status);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

