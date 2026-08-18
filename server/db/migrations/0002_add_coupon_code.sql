-- NEXTHOOD STUDIO Phase 2 commerce migration
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code varchar(100);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code);
