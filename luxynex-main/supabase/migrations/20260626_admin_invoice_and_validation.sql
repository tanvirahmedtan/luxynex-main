-- Invoice generation RPC for admin panel
CREATE OR REPLACE FUNCTION public.generate_order_invoice(p_order_id uuid)
RETURNS TABLE(
  invoice_html text,
  invoice_filename text,
  order_number text,
  customer_name text,
  order_total numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_invoice_html text;
  v_items_html text := '';
  v_item record;
  v_item_price numeric;
  v_idx int := 1;
BEGIN
  -- Fetch order details
  SELECT * INTO v_order FROM public.admin_orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Build items table HTML with variant information
  FOR v_item IN 
    SELECT 
      jsonb_array_elements(v_order.items)::jsonb as item_data
  LOOP
    DECLARE
      v_product_name text;
      v_color text;
      v_size text;
      v_variant_info text := '';
      v_quantity numeric;
    BEGIN
      v_product_name := COALESCE(v_item.item_data->>'name', 'Product');
      v_color := v_item.item_data->>'color';
      v_size := v_item.item_data->>'size';
      v_quantity := COALESCE((v_item.item_data->>'quantity')::numeric, 1);
      v_item_price := COALESCE((v_item.item_data->>'price')::numeric, 0);
      
      -- Build variant info string
      IF v_color IS NOT NULL OR v_size IS NOT NULL THEN
        v_variant_info := ' (';
        IF v_color IS NOT NULL THEN
          v_variant_info := v_variant_info || 'Color: ' || v_color;
        END IF;
        IF v_size IS NOT NULL THEN
          IF v_color IS NOT NULL THEN
            v_variant_info := v_variant_info || ', ';
          END IF;
          v_variant_info := v_variant_info || 'Size: ' || v_size;
        END IF;
        v_variant_info := v_variant_info || ')';
      END IF;
      
      v_items_html := v_items_html || format(
        '<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">%s%s</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">%s</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">৳%s</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">৳%s</td>
        </tr>',
        v_product_name,
        v_variant_info,
        v_quantity::text,
        to_char(v_item_price, 'FM999,999.00'),
        to_char(v_item_price * v_quantity, 'FM999,999.00')
      );
    END;
    v_idx := v_idx + 1;
  END LOOP;

  -- Build complete invoice HTML
  v_invoice_html := format(
    '<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice %s</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .invoice { background: white; max-width: 800px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .invoice-title { float: right; font-size: 28px; color: #999; font-weight: bold; }
        .clearfix { clear: both; }
        .invoice-details { margin: 30px 0; }
        .detail-row { margin-bottom: 10px; }
        .detail-label { font-weight: bold; width: 200px; display: inline-block; }
        .invoice-table { width: 100%%; border-collapse: collapse; margin: 30px 0; }
        .invoice-table th { background: #f9f9f9; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
        .invoice-table td { padding: 8px; border-bottom: 1px solid #ddd; }
        .invoice-summary { margin-top: 30px; border-top: 2px solid #ddd; padding-top: 20px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .summary-total { display: flex; justify-content: space-between; margin-top: 20px; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="company-name">LUXYNEX</div>
          <div class="invoice-title">INVOICE</div>
          <div class="clearfix"></div>
        </div>

        <div class="invoice-details">
          <div class="detail-row">
            <span class="detail-label">Invoice #:</span>
            <strong>%s</strong>
          </div>
          <div class="detail-row">
            <span class="detail-label">Order Date:</span>
            <strong>%s</strong>
          </div>
          <div class="detail-row">
            <span class="detail-label">Order Status:</span>
            <strong>%s</strong>
          </div>
        </div>

        <div style="display: flex; gap: 40px; margin: 30px 0;">
          <div style="flex: 1;">
            <strong style="display: block; margin-bottom: 10px;">BILL TO:</strong>
            <div style="line-height: 1.6;">
              <strong>%s</strong><br>
              Phone: %s<br>
              %s
            </div>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            %s
          </tbody>
        </table>

        <div class="invoice-summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>৳%s</span>
          </div>
          <div class="summary-row">
            <span>Shipping Fee:</span>
            <span>৳%s</span>
          </div>
          <div class="summary-row">
            <span>Discount:</span>
            <span style="color: #27ae60;">-৳%s</span>
          </div>
          <div class="summary-total">
            <span>TOTAL DUE:</span>
            <span style="color: #e74c3c;">৳%s</span>
          </div>
          <div class="summary-row" style="margin-top: 20px; font-size: 12px; color: #666;">
            <span>Payment Status:</span>
            <span><strong>%s</strong></span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>For inquiries, contact us at support@luxynex.com</p>
          <p>This invoice was generated on %s</p>
        </div>
      </div>
    </body>
    </html>',
    v_order.order_number,
    v_order.order_number,
    to_char(v_order.created_at, 'DD-Mon-YYYY HH24:MI'),
    v_order.status,
    v_order.customer_name,
    v_order.customer_phone,
    v_order.shipping_address,
    v_items_html,
    to_char(v_order.subtotal, 'FM999,999.00'),
    to_char(v_order.shipping_fee, 'FM999,999.00'),
    to_char(v_order.discount, 'FM999,999.00'),
    to_char(v_order.total, 'FM999,999.00'),
    v_order.payment_status,
    to_char(now(), 'DD-Mon-YYYY HH24:MI:SS')
  );

  RETURN QUERY SELECT 
    v_invoice_html::text,
    ('LUXYNEX-' || v_order.order_number || '-Invoice.html')::text,
    v_order.order_number::text,
    v_order.customer_name::text,
    v_order.total;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_order_invoice(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_order_invoice(uuid) TO anon, authenticated;

-- Data consistency validation RPC
CREATE OR REPLACE FUNCTION public.validate_order_consistency(p_order_id uuid)
RETURNS TABLE(
  is_valid boolean,
  validation_message text,
  missing_variants int,
  total_items int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_total_items int := 0;
  v_items_with_variants int := 0;
  v_missing_variants int := 0;
  v_item record;
  v_has_color boolean;
  v_has_size boolean;
  v_message text := '';
BEGIN
  -- Fetch order
  SELECT * INTO v_order FROM public.admin_orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false::boolean, 'Order not found'::text, 0::int, 0::int;
    RETURN;
  END IF;

  -- Check each item in the order
  FOR v_item IN 
    SELECT jsonb_array_elements(v_order.items)::jsonb as item_data
  LOOP
    v_total_items := v_total_items + 1;
    
    v_has_color := v_item.item_data ? 'color';
    v_has_size := v_item.item_data ? 'size';
    
    -- If product has variants in the admin_products table, order item should too
    IF v_has_color OR v_has_size THEN
      v_items_with_variants := v_items_with_variants + 1;
    ELSE
      v_missing_variants := v_missing_variants + 1;
    END IF;
  END LOOP;

  -- Build validation message
  IF v_missing_variants > 0 THEN
    v_message := format('Warning: %s of %s items missing variant data', v_missing_variants, v_total_items);
  ELSE
    v_message := 'All order items have consistent variant data ✓';
  END IF;

  RETURN QUERY SELECT 
    (v_missing_variants = 0)::boolean,
    v_message::text,
    v_missing_variants::int,
    v_total_items::int;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_order_consistency(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_order_consistency(uuid) TO anon, authenticated;

-- Create order_status_history table to track status changes
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.admin_orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view status history" ON public.order_status_history
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert status history" ON public.order_status_history
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Stock audit trail table for transparency
CREATE TABLE IF NOT EXISTS public.stock_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.admin_products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  change_type TEXT NOT NULL, -- 'purchase', 'sale', 'adjustment', 'return'
  quantity_change INT NOT NULL,
  stock_before INT,
  stock_after INT,
  reference_id UUID, -- order_id or purchase_id
  reference_type TEXT, -- 'order', 'purchase'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.stock_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view stock audit" ON public.stock_audit_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

NOTIFY pgrst, 'reload schema';
