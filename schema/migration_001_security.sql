-- Security enhancement migration
-- Run this to add indexes to existing database

-- Index for rate limiting queries (ip_hash + submitted_at)
CREATE INDEX IF NOT EXISTS idx_ip_hash_submitted ON predictions(ip_hash, submitted_at);

-- Index for case-insensitive username lookups
CREATE INDEX IF NOT EXISTS idx_username_lower ON predictions(LOWER(username));
