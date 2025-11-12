-- Migration 004: Add notification batches support for bulk messaging

CREATE TABLE IF NOT EXISTS notification_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    total_recipients INTEGER NOT NULL,
    successful_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING',
    created_by UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES notification_batches(id);

CREATE INDEX IF NOT EXISTS idx_notifications_batch_id ON notifications(batch_id);
CREATE INDEX IF NOT EXISTS idx_notification_batches_event_id ON notification_batches(event_id);
CREATE INDEX IF NOT EXISTS idx_notification_batches_status ON notification_batches(status);

CREATE TRIGGER update_notification_batches_updated_at
    BEFORE UPDATE ON notification_batches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

