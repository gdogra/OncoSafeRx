-- Scheduled push notifications
CREATE TABLE IF NOT EXISTS push_schedules (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT DEFAULT '/',
  require_interaction BOOLEAN DEFAULT FALSE,
  audience TEXT DEFAULT 'all', -- 'all' or 'endpoint'
  endpoint TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending|sent|failed|cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_schedules_status_time ON push_schedules(status, scheduled_at);

