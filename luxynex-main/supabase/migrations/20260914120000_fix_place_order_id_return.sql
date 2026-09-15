-- The production function already has this exact 9-argument signature and
-- returns only order_number. Keep later migrations from introducing an
-- incompatible return shape or overload.

NOTIFY pgrst, 'reload schema';