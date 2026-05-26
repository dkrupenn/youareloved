CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  card_number TEXT    NOT NULL,
  first_name  TEXT,
  city        TEXT,
  found_where TEXT,
  message     TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_card_number ON messages(card_number);
CREATE INDEX IF NOT EXISTS idx_status       ON messages(status);
