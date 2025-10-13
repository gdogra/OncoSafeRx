-- Push subscriptions storage (used for Web Push notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: track last update
ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON push_subscriptions;
CREATE TRIGGER set_updated_at
BEFORE INSERT OR UPDATE ON push_subscriptions
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

