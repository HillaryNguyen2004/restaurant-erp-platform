CREATE TABLE IF NOT EXISTS kitchen_stations (
    station_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    station_type TEXT NOT NULL,
    supported_dish_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    active BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS kitchen_tickets (
    ticket_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    table_number TEXT,
    station_id TEXT NOT NULL REFERENCES kitchen_stations(station_id),
    course_type TEXT NOT NULL,
    status TEXT NOT NULL,
    priority INTEGER NOT NULL,
    prep_time_minutes INTEGER NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_station ON kitchen_tickets(station_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_order ON kitchen_tickets(order_id);

CREATE TABLE IF NOT EXISTS kitchen_ticket_items (
    ticket_id TEXT NOT NULL REFERENCES kitchen_tickets(ticket_id) ON DELETE CASCADE,
    item_index INTEGER NOT NULL,
    menu_item_name TEXT NOT NULL,
    dish_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    special_instructions TEXT,
    allergy_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    prep_time_minutes INTEGER NOT NULL,
    PRIMARY KEY (ticket_id, item_index)
);
