-- Database schema for AI bubble predictions

CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    days_until_pop INTEGER NOT NULL,
    submitted_at TEXT NOT NULL,  -- ISO 8601 date string
    predicted_date TEXT NOT NULL,  -- Calculated date when bubble will pop
    ip_hash TEXT  -- Store hashed IP to prevent spam (optional)
);

-- Index for faster average calculations
CREATE INDEX IF NOT EXISTS idx_predicted_date ON predictions(predicted_date);
CREATE INDEX IF NOT EXISTS idx_submitted_at ON predictions(submitted_at);
