-- Migration 003: Add performance-oriented indexes
-- Goal: Improve query latency for high-traffic tables

-- Enable pg_trgm extension for advanced text search (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- EVENTS TABLE --------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_user_id_event_date
  ON events (user_id, event_date);

CREATE INDEX IF NOT EXISTS idx_events_status_event_date
  ON events (status, event_date);

-- GUESTS TABLE --------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_guests_event_id_created_at
  ON guests (event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_guests_event_id_status
  ON guests (event_id, status);

CREATE INDEX IF NOT EXISTS idx_guests_event_id_table
  ON guests (event_id, table_number);

CREATE INDEX IF NOT EXISTS idx_guests_event_id_last_first
  ON guests (event_id, last_name, first_name);

CREATE INDEX IF NOT EXISTS idx_guests_first_name_trgm
  ON guests USING GIN (first_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_guests_last_name_trgm
  ON guests USING GIN (last_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_guests_phone_trgm
  ON guests USING GIN (phone gin_trgm_ops);

-- NOTIFICATIONS TABLE -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_notifications_event_id_created_at
  ON notifications (event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_guest_id_created_at
  ON notifications (guest_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_guest_type_status
  ON notifications (guest_id, type, status);

