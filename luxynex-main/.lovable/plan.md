## Goal

Make the storefront and admin panel one connected, production-ready system. Most pieces already exist (products, categories, orders table, admin pages, real-time sync). This plan closes the gaps: order → customer + stock sync, persistent cart, validation, and a deployment cleanup pass.

## 1. Order → Customer + Stock sync (server-side)

Today `CheckoutPage` inserts into `admin_orders` only. Stock and `admin_customers` are not updated, and a logged-out shopper inserting an order works only because of the permissive "Anyone can insert orders" policy.

Add a Postgres trigger on `admin_orders` (AFTER INSERT) that runs as `SECURITY DEFINER` and:

- Upserts into `admin_customers` keyed by `customer_phone`: name, email, address, increments `total_orders` and adds `total` to `total_spent`.
- Iterates `items` JSONB and, for each item with a resolvable `product_id` (we'll start sending it from checkout — see §2), decrements `admin_products.stock` by `quantity`, clamped to 0. Items without an id are skipped silently so manual admin orders still work.

This keeps the logic atomic and avoids relying on the client. Add a unique index on `admin_customers.phone` to support the upsert.

## 2. Checkout improvements

- Include `product_id` in each item pushed into `admin_orders.items` so the trigger can decrement stock.
- Tighten validation: trim inputs, require a valid Bangladeshi phone (`/^01[3-9]\d{8}$/`), basic email format, address ≥ 5 chars. Show inline errors with `sonner`.
- Pass `delivery_method` into `notes` (until a column is added) so it shows in admin.
- After success, clear cart and route to `/track?order=...` (already done).

## 3. Persistent cart

`CartContext` currently keeps items in memory only — refresh wipes the cart.

- Hydrate `items`, `promoCode`, and `discount` from `localStorage` on mount (guarded behind a `hydrated` flag to avoid SSR-style flashes).
- Persist on every change via a single `useEffect`.
- Expose `hydrated` so `CartPage` can show a spinner until the first read completes (fixes the "loading loop / empty cart" symptom).

## 4. Admin panel ↔ frontend wiring (verification only)

These already work via Supabase realtime — confirm by reading each page after the migration:

- Products created in `AdminCreateProduct` already appear in `useProducts` (Shop, Single Product, Homepage).
- Categories from `AdminCategories` already feed `useCategories` (Header sidebar, Homepage `CategorySidebar`, Footer, Shop filters).
- Orders placed from checkout already appear in `AdminOrders` via realtime; after this plan they will also create/update an `admin_customers` row (visible in `AdminCustomers`) and reduce `admin_products.stock` (visible in `AdminStocks` / `AdminWarehouse`).

No code changes needed in these admin pages; the trigger is the missing link.

## 5. Deployment cleanup

- Remove the unused `AdminPlaceholder` import from `src/App.tsx` (no routes use it, but the import is dead weight). The file itself is unreferenced, so delete it.
- Footer phone placeholder (`+880 1XXX-XXXXXX`) and `hello@luxynex.store` are real-looking defaults — leave unless you want me to replace.
- Quick pass on `<Link>` / button targets across Header, Footer, ProductCard, HomePage to confirm no dead routes.
- No "Coming Soon" strings exist in the codebase (verified with ripgrep).

## Technical Details

### Migration

```sql
-- ensure phone is unique so we can upsert
CREATE UNIQUE INDEX IF NOT EXISTS admin_customers_phone_key
  ON public.admin_customers (phone);

CREATE OR REPLACE FUNCTION public.sync_order_side_effects()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  pid uuid;
  qty int;
BEGIN
  -- 1. upsert customer
  INSERT INTO public.admin_customers (name, phone, email, address, total_orders, total_spent)
  VALUES (NEW.customer_name, NEW.customer_phone, NEW.customer_email,
          NEW.shipping_address, 1, NEW.total)
  ON CONFLICT (phone) DO UPDATE
  SET name = EXCLUDED.name,
      email = COALESCE(EXCLUDED.email, admin_customers.email),
      address = EXCLUDED.address,
      total_orders = admin_customers.total_orders + 1,
      total_spent = admin_customers.total_spent + EXCLUDED.total_spent,
      updated_at = now();

  -- 2. decrement stock per item
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
    pid := NULLIF(item->>'product_id', '')::uuid;
    qty := COALESCE((item->>'quantity')::int, 0);
    IF pid IS NOT NULL AND qty > 0 THEN
      UPDATE public.admin_products
      SET stock = GREATEST(stock - qty, 0)
      WHERE id = pid;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_admin_orders_side_effects
AFTER INSERT ON public.admin_orders
FOR EACH ROW EXECUTE FUNCTION public.sync_order_side_effects();
```

### Frontend files touched

- `src/contexts/CartContext.tsx` — add `localStorage` hydration + `hydrated` flag.
- `src/pages/CartPage.tsx` — show spinner until `hydrated`.
- `src/pages/CheckoutPage.tsx` — phone/email regex, include `product_id` in items, append delivery method to notes.
- `src/App.tsx` — drop dead `AdminPlaceholder` import.
- `src/pages/admin/AdminPlaceholder.tsx` — delete file.

### Out of scope

- Building payment integration for "Online Payment" (still recorded as `pending`).
- Changing multi-variant SKU stock (decrement happens at the product level; variant-level stock would need a separate `variants` schema with its own table).
- Adding new admin UI — existing pages already render the data the trigger will populate.
