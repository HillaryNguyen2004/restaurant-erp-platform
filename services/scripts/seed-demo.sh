#!/usr/bin/env bash
set -euo pipefail

KONG_URL="${KONG_URL:-http://localhost:8000}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-irms-postgres}"
POSTGRES_DB="${POSTGRES_DB:-irms_db}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

json_post() {
  local path="$1"
  local body="$2"
  curl -sS -X POST "$KONG_URL$path" \
    -H "Content-Type: application/json" \
    -d "$body"
}

user_id_by_email() {
  local email="$1"
  docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA \
    -c "SELECT id FROM user_management.users WHERE email = '$email' LIMIT 1;"
}

ensure_user() {
  local email="$1"
  local full_name="$2"
  local role="${3:-}"
  local body
  local response
  local user_id

  body=$(printf '{"email":"%s","password":"secret123","fullName":"%s"}' "$email" "$full_name")
  response="$(json_post "/user-management/users" "$body" || true)"
  user_id="$(node -e "const raw=process.argv[1]||'{}'; try { const x=JSON.parse(raw); console.log(x.id || '') } catch { console.log('') }" "$response")"

  if [[ -z "$user_id" ]]; then
    user_id="$(user_id_by_email "$email")"
  fi

  if [[ -z "$user_id" ]]; then
    echo "Failed to create or locate user $email. Response: $response" >&2
    exit 1
  fi

  if [[ -n "$role" ]]; then
    json_post "/user-management/users/$user_id/roles" "{\"roleName\":\"$role\"}" >/dev/null || true
  fi

  printf '%s %s %s\n' "$email" "$user_id" "${role:-TABLE}"
}

ensure_station() {
  local station_id="$1"
  local name="$2"
  local station_type="$3"
  local supported_dish_types="$4"

  json_post "/kitchen-operation/kitchen/stations" \
    "{\"stationId\":\"$station_id\",\"name\":\"$name\",\"stationType\":\"$station_type\",\"supportedDishTypes\":$supported_dish_types,\"active\":true}" >/dev/null
}

menu_json() {
  curl -sS "$KONG_URL/order-menu/menu"
}

category_id_by_name() {
  local name="$1"
  node -e "const m=JSON.parse(require('fs').readFileSync(0,'utf8')); const c=(m.categories||[]).find(x=>x.name===process.argv[1]); console.log(c?.categoryId || '')" "$name"
}

item_id_by_name() {
  local name="$1"
  node -e "const m=JSON.parse(require('fs').readFileSync(0,'utf8')); const i=(m.items||[]).find(x=>x.name===process.argv[1]); console.log(i?.itemId || '')" "$name"
}

ensure_category() {
  local name="$1"
  local display_order="$2"
  local id
  local response

  id="$(menu_json | category_id_by_name "$name")"
  if [[ -n "$id" ]]; then
    echo "$id"
    return
  fi

  response="$(json_post "/order-menu/menu-management/categories" "{\"name\":\"$name\",\"displayOrder\":$display_order}")"
  node -e "const x=JSON.parse(process.argv[1]); console.log(x.categoryId || x.id)" "$response"
}

ensure_item() {
  local name="$1"
  local description="$2"
  local category_id="$3"
  local price="$4"
  local dish_type="$5"
  local course_type="$6"
  local prep_minutes="$7"
  local allergy_tags="${8:-[]}"
  local id

  id="$(menu_json | item_id_by_name "$name")"
  if [[ -n "$id" ]]; then
    echo "$id"
    return
  fi

  json_post "/order-menu/menu-management/items" \
    "{\"name\":\"$name\",\"description\":\"$description\",\"menuCategoryId\":\"$category_id\",\"price\":$price,\"dishType\":\"$dish_type\",\"courseType\":\"$course_type\",\"prepTimeMinutes\":$prep_minutes,\"allergyTags\":$allergy_tags}" \
    | node -e "const x=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(x.itemId || x.id)"
}

seed_tables() {
  docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL' >/dev/null
INSERT INTO table_reservation.restaurant_tables
(table_id, table_number, capacity, status, zone, created_at, updated_at)
VALUES
('11111111-1111-4111-8111-111111111111', 'A1', 4, 'FREE', 'A', now(), now()),
('22222222-2222-4222-8222-222222222222', 'A2', 2, 'FREE', 'A', now(), now()),
('33333333-3333-4333-8333-333333333333', 'B1', 6, 'RESERVED', 'B', now(), now()),
('44444444-4444-4444-8444-444444444444', 'B2', 4, 'OCCUPIED', 'B', now(), now()),
('55555555-5555-4555-8555-555555555555', 'C1', 8, 'FREE', 'C', now(), now()),
('66666666-6666-4666-8666-666666666666', 'A3', 4, 'FREE', 'A', now(), now()),
('77777777-7777-4777-8777-777777777777', 'A4', 2, 'RESERVED', 'A', now(), now()),
('88888888-8888-4888-8888-888888888888', 'A5', 6, 'FREE', 'A', now(), now()),
('99999999-9999-4999-8999-999999999999', 'A6', 4, 'OCCUPIED', 'A', now(), now()),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'B3', 2, 'FREE', 'B', now(), now()),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'B4', 4, 'RESERVED', 'B', now(), now()),
('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'B5', 8, 'FREE', 'B', now(), now()),
('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'B6', 6, 'OCCUPIED', 'B', now(), now()),
('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'C2', 2, 'FREE', 'C', now(), now()),
('ffffffff-ffff-4fff-8fff-ffffffffffff', 'C3', 4, 'FREE', 'C', now(), now()),
('12121212-1212-4121-8121-121212121212', 'C4', 6, 'RESERVED', 'C', now(), now()),
('13131313-1313-4131-8131-131313131313', 'C5', 4, 'OUT_OF_ORDER', 'C', now(), now()),
('14141414-1414-4141-8141-141414141414', 'C6', 10, 'FREE', 'C', now(), now()),
('15151515-1515-4151-8151-151515151515', 'P1', 2, 'FREE', 'Patio', now(), now()),
('16161616-1616-4161-8161-161616161616', 'P2', 4, 'RESERVED', 'Patio', now(), now()),
('17171717-1717-4171-8171-171717171717', 'P3', 4, 'FREE', 'Patio', now(), now()),
('18181818-1818-4181-8181-181818181818', 'P4', 6, 'OCCUPIED', 'Patio', now(), now()),
('19191919-1919-4191-8191-191919191919', 'VIP1', 8, 'RESERVED', 'VIP', now(), now()),
('20202020-2020-4202-8202-202020202020', 'VIP2', 12, 'FREE', 'VIP', now(), now())
ON CONFLICT (table_id) DO UPDATE SET
  table_number = EXCLUDED.table_number,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status,
  zone = EXCLUDED.zone,
  updated_at = now();
SQL
}

seed_reservations() {
  docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL' >/dev/null
INSERT INTO table_reservation.reservations
(reservation_id, customer_name, contact_number, party_size, start_time, end_time, status, table_id, notes, created_at, updated_at)
VALUES
('res-2026-05-07-nguyen-1900', 'Nguyen Minh Anh', '0901000001', 4, '2026-05-07 19:00:00', '2026-05-07 21:00:00', 'CONFIRMED', '33333333-3333-4333-8333-333333333333', 'Birthday cake after mains', now(), now()),
('res-2026-05-07-tran-1930', 'Tran Quoc Bao', '0901000002', 2, '2026-05-07 19:30:00', '2026-05-07 21:00:00', 'CONFIRMED', '77777777-7777-4777-8777-777777777777', 'Window seat if available', now(), now()),
('res-2026-05-07-le-2000', 'Le Hoang Linh', '0901000003', 4, '2026-05-07 20:00:00', '2026-05-07 22:00:00', 'CONFIRMED', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Vegetarian guest', now(), now()),
('res-2026-05-07-pham-2030', 'Pham Gia Huy', '0901000004', 6, '2026-05-07 20:30:00', '2026-05-07 22:30:00', 'PENDING', '12121212-1212-4121-8121-121212121212', 'Needs confirmation call', now(), now()),
('res-2026-05-07-vip-1900', 'HCMUT Faculty Dinner', '0901000005', 8, '2026-05-07 19:00:00', '2026-05-07 22:00:00', 'CONFIRMED', '19191919-1919-4191-8191-191919191919', 'VIP set menu', now(), now()),
('res-2026-05-08-patio-1800', 'Do Thanh Tam', '0901000006', 4, '2026-05-08 18:00:00', '2026-05-08 20:00:00', 'CONFIRMED', '16161616-1616-4161-8161-161616161616', 'Patio table', now(), now())
ON CONFLICT (reservation_id) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  contact_number = EXCLUDED.contact_number,
  party_size = EXCLUDED.party_size,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  status = EXCLUDED.status,
  table_id = EXCLUDED.table_id,
  notes = EXCLUDED.notes,
  updated_at = now();

INSERT INTO table_reservation.dining_sessions
(session_id, table_id, reservation_id, started_at, expected_end_at, actual_end_at, status, billing_status, created_at, updated_at)
VALUES
('dine-live-b2', '44444444-4444-4444-8444-444444444444', NULL, now() - interval '45 minutes', now() + interval '75 minutes', NULL, 'ACTIVE', 'OPEN', now(), now()),
('dine-live-a6', '99999999-9999-4999-8999-999999999999', NULL, now() - interval '25 minutes', now() + interval '95 minutes', NULL, 'ACTIVE', 'OPEN', now(), now()),
('dine-live-b6', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', NULL, now() - interval '70 minutes', now() + interval '20 minutes', NULL, 'ACTIVE', 'OPEN', now(), now()),
('dine-live-p4', '18181818-1818-4181-8181-181818181818', NULL, now() - interval '15 minutes', now() + interval '105 minutes', NULL, 'ACTIVE', 'OPEN', now(), now())
ON CONFLICT (session_id) DO UPDATE SET
  table_id = EXCLUDED.table_id,
  reservation_id = EXCLUDED.reservation_id,
  started_at = EXCLUDED.started_at,
  expected_end_at = EXCLUDED.expected_end_at,
  actual_end_at = EXCLUDED.actual_end_at,
  status = EXCLUDED.status,
  billing_status = EXCLUDED.billing_status,
  updated_at = now();
SQL
}

place_demo_order() {
  local table_id="$1"
  local item_id="$2"
  local quantity="$3"
  local instructions="$4"
  local session
  local session_id

  session="$(json_post "/order-menu/order-sessions" "{\"tableId\":\"$table_id\"}")"
  session_id="$(node -e "const raw=process.argv[1]||'{}'; const x=JSON.parse(raw); console.log(x.sessionId || x.id || '')" "$session")"
  if [[ -z "$session_id" ]]; then
    echo "Failed to create order session for table $table_id. Response: $session" >&2
    exit 1
  fi

  json_post "/order-menu/order-sessions/$session_id/orders" \
    "{\"items\":[{\"menuItemId\":\"$item_id\",\"quantity\":$quantity,\"modifiers\":[],\"specialInstructions\":\"$instructions\"}]}" >/dev/null
}

echo "Checking gateway..."
curl -fsS "$KONG_URL/order-menu/orders/health" >/dev/null
curl -fsS "$KONG_URL/kitchen-operation/kitchen/health" >/dev/null
curl -fsS "$KONG_URL/user-management/api-json" >/dev/null
curl -fsS "$KONG_URL/table-reservation/tables" >/dev/null

echo "Seeding users..."
ensure_user "chef@example.com" "Chef User" "CHEF"
ensure_user "chef.grill@example.com" "Grill Chef" "CHEF"
ensure_user "chef.cold@example.com" "Cold Station Chef" "CHEF"
ensure_user "chef.bar@example.com" "Bar Chef" "CHEF"
ensure_user "chef.pastry@example.com" "Pastry Chef" "CHEF"
ensure_user "cashier@example.com" "Cashier User" "CASHIER"
ensure_user "cashier.night@example.com" "Night Cashier" "CASHIER"
ensure_user "staff@example.com" "Staff User" "SERVER"
ensure_user "server.anna@example.com" "Anna Server" "SERVER"
ensure_user "server.binh@example.com" "Binh Server" "SERVER"
ensure_user "server.chi@example.com" "Chi Server" "SERVER"
ensure_user "admin@example.com" "Admin User" "ADMIN"
ensure_user "manager@example.com" "Restaurant Manager" "MANAGER"
ensure_user "table@example.com" "Table Customer"
ensure_user "customer.mai@example.com" "Mai Customer"
ensure_user "customer.nam@example.com" "Nam Customer"

echo "Seeding kitchen stations..."
ensure_station "grill" "Grill" "HOT" "[\"grill\",\"steak\",\"bbq\"]"
ensure_station "cold" "Cold Station" "COLD" "[\"cold\",\"salad\",\"raw\"]"
ensure_station "fryer" "Fryer" "HOT" "[\"fryer\",\"fried\"]"
ensure_station "wok" "Wok" "HOT" "[\"wok\",\"stir-fry\",\"noodle\"]"
ensure_station "oven" "Oven" "HOT" "[\"oven\",\"pizza\",\"baked\"]"
ensure_station "dessert" "Dessert" "PASTRY" "[\"dessert\",\"cake\",\"ice-cream\",\"sweet\"]"
ensure_station "drinks" "Drinks Station" "BAR" "[\"drinks\",\"juice\",\"tea\"]"
ensure_station "coffee" "Coffee Bar" "BAR" "[\"coffee\",\"espresso\"]"

echo "Seeding menu..."
breakfast_id="$(ensure_category "Breakfast" 0)"
mains_id="$(ensure_category "Mains" 1)"
appetizers_id="$(ensure_category "Appetizers" 2)"
salads_id="$(ensure_category "Salads" 3)"
pasta_id="$(ensure_category "Pasta & Noodles" 4)"
pizza_id="$(ensure_category "Pizza" 5)"
seafood_id="$(ensure_category "Seafood" 6)"
desserts_id="$(ensure_category "Desserts" 7)"
drinks_id="$(ensure_category "Drinks" 8)"
coffee_id="$(ensure_category "Coffee & Tea" 9)"
specials_id="$(ensure_category "House Specials" 10)"

ensure_item "Burger" "Demo grilled burger" "$mains_id" 12.50 "grill" "MAIN" 10 "[]" >/dev/null
ensure_item "Steak" "Demo steak plate" "$mains_id" 24.00 "grill" "MAIN" 16 "[]" >/dev/null
ensure_item "Salad" "Fresh house salad" "$appetizers_id" 7.50 "cold" "STARTER" 5 "[]" >/dev/null
ensure_item "Iced Coffee" "Vietnamese iced coffee" "$drinks_id" 4.00 "drinks" "BEVERAGE" 3 "[\"dairy\"]" >/dev/null
ensure_item "Eggs Benedict" "Poached eggs with hollandaise" "$breakfast_id" 11.00 "grill" "MAIN" 9 "[\"egg\",\"dairy\"]" >/dev/null
ensure_item "Avocado Toast" "Sourdough toast with avocado and herbs" "$breakfast_id" 8.50 "cold" "MAIN" 4 "[\"gluten\"]" >/dev/null
ensure_item "Chicken Wings" "Crispy wings with house sauce" "$appetizers_id" 9.50 "fryer" "APPETIZER" 8 "[]" >/dev/null
ensure_item "Spring Rolls" "Fresh rolls with herbs and dipping sauce" "$appetizers_id" 6.50 "cold" "APPETIZER" 5 "[\"peanut\"]" >/dev/null
ensure_item "Calamari" "Lightly fried calamari with lime aioli" "$appetizers_id" 10.50 "fryer" "APPETIZER" 7 "[\"seafood\",\"egg\"]" >/dev/null
ensure_item "Caesar Salad" "Romaine, parmesan, croutons, caesar dressing" "$salads_id" 8.00 "salad" "STARTER" 4 "[\"dairy\",\"gluten\"]" >/dev/null
ensure_item "Prawn Mango Salad" "Prawns, mango, herbs, lime dressing" "$salads_id" 12.00 "raw" "STARTER" 6 "[\"seafood\"]" >/dev/null
ensure_item "Ribeye Steak" "Ribeye with pepper sauce and fries" "$mains_id" 29.00 "steak" "MAIN" 18 "[]" >/dev/null
ensure_item "BBQ Pork Ribs" "Slow cooked ribs with slaw" "$mains_id" 21.00 "bbq" "MAIN" 20 "[]" >/dev/null
ensure_item "Lemongrass Chicken" "Grilled chicken with rice and pickles" "$mains_id" 14.00 "grill" "MAIN" 12 "[]" >/dev/null
ensure_item "Mushroom Risotto" "Creamy risotto with mixed mushrooms" "$mains_id" 15.00 "wok" "MAIN" 14 "[\"dairy\"]" >/dev/null
ensure_item "Seafood Pasta" "Spaghetti with prawns, squid, tomato sauce" "$pasta_id" 17.50 "wok" "MAIN" 13 "[\"seafood\",\"gluten\"]" >/dev/null
ensure_item "Beef Pho" "Rice noodle soup with beef and herbs" "$pasta_id" 10.00 "noodle" "MAIN" 9 "[]" >/dev/null
ensure_item "Pad Thai" "Stir fried rice noodles with tamarind sauce" "$pasta_id" 12.50 "stir-fry" "MAIN" 10 "[\"peanut\",\"egg\"]" >/dev/null
ensure_item "Margherita Pizza" "Tomato, mozzarella, basil" "$pizza_id" 13.00 "pizza" "MAIN" 12 "[\"dairy\",\"gluten\"]" >/dev/null
ensure_item "Pepperoni Pizza" "Pepperoni, mozzarella, tomato sauce" "$pizza_id" 15.00 "pizza" "MAIN" 13 "[\"dairy\",\"gluten\"]" >/dev/null
ensure_item "Baked Salmon" "Salmon with lemon butter and vegetables" "$seafood_id" 22.00 "baked" "MAIN" 15 "[\"fish\",\"dairy\"]" >/dev/null
ensure_item "Garlic Prawns" "Prawns with garlic butter and baguette" "$seafood_id" 18.00 "grill" "MAIN" 10 "[\"seafood\",\"dairy\",\"gluten\"]" >/dev/null
ensure_item "Chocolate Cake" "Warm chocolate cake with cream" "$desserts_id" 7.00 "cake" "DESSERT" 6 "[\"dairy\",\"gluten\",\"egg\"]" >/dev/null
ensure_item "Mango Sticky Rice" "Sweet sticky rice with mango" "$desserts_id" 6.50 "dessert" "DESSERT" 5 "[]" >/dev/null
ensure_item "Vanilla Ice Cream" "House vanilla ice cream" "$desserts_id" 4.50 "ice-cream" "DESSERT" 3 "[\"dairy\"]" >/dev/null
ensure_item "Lemon Tart" "Lemon curd tart with berries" "$desserts_id" 6.00 "sweet" "DESSERT" 5 "[\"dairy\",\"gluten\",\"egg\"]" >/dev/null
ensure_item "Fresh Lime Soda" "Lime soda with mint" "$drinks_id" 3.50 "juice" "BEVERAGE" 2 "[]" >/dev/null
ensure_item "Passion Fruit Juice" "Fresh passion fruit juice" "$drinks_id" 4.00 "juice" "BEVERAGE" 2 "[]" >/dev/null
ensure_item "Peach Iced Tea" "Black tea with peach" "$coffee_id" 4.00 "tea" "BEVERAGE" 2 "[]" >/dev/null
ensure_item "Latte" "Espresso with steamed milk" "$coffee_id" 4.50 "coffee" "BEVERAGE" 3 "[\"dairy\"]" >/dev/null
ensure_item "Espresso" "Double shot espresso" "$coffee_id" 3.00 "espresso" "BEVERAGE" 2 "[]" >/dev/null
ensure_item "Chef Tasting Plate" "Small portions from grill, cold, and dessert stations" "$specials_id" 32.00 "grill" "MAIN" 22 "[\"dairy\",\"gluten\"]" >/dev/null
ensure_item "Family Combo" "Burger, ribs, wings, salad, and drinks" "$specials_id" 48.00 "bbq" "MAIN" 25 "[\"dairy\",\"gluten\"]" >/dev/null

echo "Seeding tables..."
seed_tables
seed_reservations

if [[ "${SEED_DEMO_ORDERS:-true}" == "true" ]]; then
  echo "Creating live demo orders..."
  burger_id="$(menu_json | item_id_by_name "Burger")"
  wings_id="$(menu_json | item_id_by_name "Chicken Wings")"
  pizza_id="$(menu_json | item_id_by_name "Margherita Pizza")"
  cake_id="$(menu_json | item_id_by_name "Chocolate Cake")"
  coffee_item_id="$(menu_json | item_id_by_name "Latte")"

  place_demo_order "44444444-4444-4444-8444-444444444444" "$burger_id" 2 "Demo live order for table B2"
  place_demo_order "99999999-9999-4999-8999-999999999999" "$wings_id" 3 "Extra napkins"
  place_demo_order "dddddddd-dddd-4ddd-8ddd-dddddddddddd" "$pizza_id" 1 "Slice before serving"
  place_demo_order "18181818-1818-4181-8181-181818181818" "$cake_id" 2 "Birthday candles"
  place_demo_order "18181818-1818-4181-8181-181818181818" "$coffee_item_id" 2 "Serve after dessert"
fi

echo "Demo seed complete."
echo "Demo logins all use password: secret123"
