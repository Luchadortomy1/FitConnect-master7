-- Add is_active column to routines table to track which routine is currently active
ALTER TABLE routines
ADD COLUMN is_active BOOLEAN DEFAULT FALSE NOT NULL;

-- Create an index for faster queries
CREATE INDEX idx_routines_user_active ON routines(user_id, is_active);

-- Ensure only one active routine per user with a constraint check
-- Note: PostgreSQL doesn't support UNIQUE with WHERE, so we'll handle this in the app
-- but this comment reminds us that the application layer should enforce single active routine per user
