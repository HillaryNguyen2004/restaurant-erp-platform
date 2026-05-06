CREATE TABLE IF NOT EXISTS menu_categories (
    menu_category_id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER,
    active BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
    menu_item_id UUID PRIMARY KEY,
    menu_category_id UUID REFERENCES menu_categories(menu_category_id),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    available BOOLEAN NOT NULL,
    dish_type TEXT NOT NULL,
    course_type TEXT NOT NULL,
    prep_time_minutes INTEGER NOT NULL,
    allergy_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);

CREATE TABLE IF NOT EXISTS availability_cache (
    menu_item_id UUID PRIMARY KEY,
    available BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS order_sessions (
    order_session_id UUID PRIMARY KEY,
    table_id UUID NOT NULL,
    status TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY,
    order_session_id UUID NOT NULL REFERENCES order_sessions(order_session_id),
    order_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    cancellation_reason TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    modifiers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    special_instructions TEXT,
    menu_item_name TEXT NOT NULL,
    dish_type TEXT NOT NULL,
    course_type TEXT NOT NULL,
    allergy_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    prep_time_minutes INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(order_session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS promotions (
    promotion_id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value NUMERIC(12, 2) NOT NULL,
    valid_from TIMESTAMPTZ,
    valid_to TIMESTAMPTZ,
    active BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS promotion_items (
    promotion_id UUID NOT NULL REFERENCES promotions(promotion_id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL,
    PRIMARY KEY (promotion_id, menu_item_id)
);
