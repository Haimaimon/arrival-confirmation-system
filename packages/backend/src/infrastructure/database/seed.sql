-- Seed data for development
-- Insert a dummy user for mock authentication

INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    role,
    subscription_tier,
    is_active,
    is_email_verified,
    is_phone_verified
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'demo@example.com',
    '$2a$10$dummyhash',  -- dummy password hash
    'משתמש',
    'דוגמה',
    '0501234567',
    'CLIENT',
    'FREE',
    true,
    true,
    false
) ON CONFLICT (id) DO NOTHING;

