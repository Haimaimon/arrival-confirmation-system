-- Migration: Make phone field optional in guests table
-- Date: 2024-11-04
-- Description: Allow guests without phone numbers

-- Make phone column nullable
ALTER TABLE guests 
ALTER COLUMN phone DROP NOT NULL;

-- Add a check constraint to ensure phone is valid if provided
-- (The validation will be done in the application layer)

COMMENT ON COLUMN guests.phone IS 'Phone number (optional). If provided, must be in valid format.';

