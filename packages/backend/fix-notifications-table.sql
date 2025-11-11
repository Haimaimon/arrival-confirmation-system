-- Fix notifications table - update to new schema
-- Run this with: psql -U postgres -d arrival_confirmation -f fix-notifications-table.sql

-- Drop old notifications table if exists
DROP TABLE IF EXISTS notifications CASCADE;

-- Create new notifications table with correct schema
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

-- Create indexes
CREATE INDEX idx_notifications_event_id ON notifications(event_id);
CREATE INDEX idx_notifications_guest_id ON notifications(guest_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_guest_type ON notifications(guest_id, type);

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at 
BEFORE UPDATE ON notifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Show result
SELECT 'Notifications table fixed successfully!' as result;

