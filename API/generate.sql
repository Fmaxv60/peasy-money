WITH RECURSIVE cnt(x) AS (
  SELECT 1004
  UNION ALL
  SELECT x + 1 FROM cnt WHERE x < 1100
)
INSERT INTO "transaction" (id, type, ticker, quantity, price, date_of, user_id)
SELECT
  x,
  CASE ABS(RANDOM() % 2)
    WHEN 0 THEN 'achat'
    ELSE 'vente'
  END,
  CASE ABS(RANDOM() % 5)
    WHEN 0 THEN 'AAPL'
    WHEN 1 THEN 'GOOG'
    WHEN 2 THEN 'AMZN'
    WHEN 3 THEN 'MSFT'
    ELSE 'TSLA'
  END,
  ABS(RANDOM() % 100) + 1,
  ROUND((ABS(RANDOM() % 100000) / 100.0) + 10, 2),
  DATE('now', '-' || ABS(RANDOM() % 365) || ' days'),
  3
FROM cnt;
