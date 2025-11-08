-- Nota: La base de datos ya debe estar creada antes de ejecutar este script
-- El script asume que ya estás conectado a la base de datos correcta

-- Tabla: categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabla: brands
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabla: product_types
CREATE TABLE product_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabla: unit_types
CREATE TABLE unit_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_countable BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabla: products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(50) UNIQUE,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    brand_id INTEGER REFERENCES brands(id),
    product_type_id INTEGER REFERENCES product_types(id),
    alcohol_percentage DECIMAL(3,1),
    volume_ml INTEGER,
    unit_type_id INTEGER REFERENCES unit_types(id),
    purchase_price DECIMAL(10,2) NOT NULL,
    retail_price DECIMAL(10,2) NOT NULL,
    wholesale_price DECIMAL(10,2),
    wholesale_min_quantity INTEGER DEFAULT 12,
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    max_stock INTEGER DEFAULT 100,
    reorder_point INTEGER DEFAULT 10,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabla: suppliers
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    tax_id VARCHAR(50),
    credit_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Crear tipo ENUM para customer_type
CREATE TYPE customer_type_enum AS ENUM ('individual', 'business');

-- Tabla: customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_type customer_type_enum,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(200),
    tax_id VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    -- Dirección detallada (nuevo formato)
    street VARCHAR(255),
    exterior_number VARCHAR(50),
    interior_number VARCHAR(50),
    neighborhood VARCHAR(100),
    postal_code VARCHAR(10),
    municipality VARCHAR(100),
    state VARCHAR(100),
    -- Campos financieros
    credit_limit DECIMAL(10,2) DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    is_wholesale BOOLEAN DEFAULT false,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Crear tipo ENUM para user_role
CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'cashier', 'warehouse', 'promoter');

-- Crear tipo ENUM para preferred_interface
CREATE TYPE preferred_interface_enum AS ENUM ('desktop', 'mobile');

-- Tabla: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role_enum,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    device_token VARCHAR(255),
    preferred_interface preferred_interface_enum DEFAULT 'desktop',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Crear tipo ENUM para movement_type
CREATE TYPE movement_type_enum AS ENUM ('purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer');

-- Tabla: inventory_movements
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    movement_type movement_type_enum,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tipo ENUM para sale_type
CREATE TYPE sale_type_enum AS ENUM ('retail', 'wholesale');

-- Crear tipo ENUM para payment_method
CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'transfer', 'credit');

-- Crear tipo ENUM para payment_status
CREATE TYPE payment_status_enum AS ENUM ('paid', 'pending', 'partial', 'cancelled');

-- Tabla: sales
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    sale_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    sale_type sale_type_enum,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method_enum,
    payment_status payment_status_enum,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    change_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabla: sale_items
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tipo ENUM para purchase_order_status
CREATE TYPE purchase_order_status_enum AS ENUM ('pending', 'approved', 'ordered', 'partial', 'received', 'cancelled');

-- Tabla: purchase_orders
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id),
    order_date DATE NOT NULL,
    expected_date DATE,
    received_date DATE,
    status purchase_order_status_enum,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabla: purchase_order_items
CREATE TABLE purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: promoter_routes
CREATE TABLE promoter_routes (
    id SERIAL PRIMARY KEY,
    promoter_id INTEGER REFERENCES users(id),
    route_name VARCHAR(200) NOT NULL,
    route_code VARCHAR(50) UNIQUE,
    description TEXT,
    day_of_week INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Crear tipo ENUM para visit_frequency
CREATE TYPE visit_frequency_enum AS ENUM ('weekly', 'biweekly', 'monthly');

-- Tabla: route_customers
CREATE TABLE route_customers (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES promoter_routes(id),
    customer_id INTEGER REFERENCES customers(id),
    visit_order INTEGER DEFAULT 0,
    visit_frequency visit_frequency_enum,
    preferred_visit_time TIME,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tipo ENUM para visit_type
CREATE TYPE visit_type_enum AS ENUM ('planned', 'spontaneous');

-- Crear tipo ENUM para visit_result
CREATE TYPE visit_result_enum AS ENUM ('sale', 'no_sale', 'closed', 'postponed');

-- Tabla: customer_visits
CREATE TABLE customer_visits (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    promoter_id INTEGER REFERENCES users(id),
    visit_date TIMESTAMP NOT NULL,
    visit_type visit_type_enum,
    sale_id INTEGER REFERENCES sales(id),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    notes TEXT,
    visit_result visit_result_enum,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tipo ENUM para sync_status
CREATE TYPE sync_status_enum AS ENUM ('pending', 'syncing', 'completed', 'failed');

-- Tabla: offline_sync_queue
CREATE TABLE offline_sync_queue (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    entity_type VARCHAR(50),
    entity_data JSONB NOT NULL,
    action VARCHAR(20),
    status sync_status_enum DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    synced_at TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_type ON products(product_type_id);
CREATE INDEX idx_products_unit_type ON products(unit_type_id);
CREATE INDEX idx_sales_number ON sales(sale_number);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(created_at);
CREATE INDEX idx_offline_sync_status ON offline_sync_queue(status);

-- Seeds iniciales para product_types
INSERT INTO product_types (name, code, display_order) VALUES
('Cerveza', 'cerveza', 1),
('Tequila', 'tequila', 2),
('Whisky', 'whisky', 3),
('Ron', 'ron', 4),
('Vodka', 'vodka', 5),
('Vino', 'vino', 6),
('Mezcal', 'mezcal', 7),
('Brandy', 'brandy', 8),
('Licor', 'licor', 9),
('Otros', 'otros', 99);

-- Seeds iniciales para unit_types
INSERT INTO unit_types (name, code, is_countable, display_order) VALUES
('Botella', 'botella', true, 1),
('Caja', 'caja', true, 2),
('Six Pack', 'six_pack', true, 3),
('Twelve Pack', 'twelve_pack', true, 4),
('Barril', 'barril', true, 5),
('Lata', 'lata', true, 6),
('Garrafón', 'garrafon', true, 7),
('Litro', 'litro', false, 8),
('Mililitro', 'mililitro', false, 9);

-- Insertar usuario administrador por defecto (password: admin123)
-- Hash generado con bcrypt para 'admin123'
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active)
VALUES ('admin', 'admin@licoreria.com', '$2b$10$YQs7T9G6j4L/G3MRMxqT4.KzXq8VJ0tJDZ3wZ5MX/5kZ9Z5Z5Z5Z5', 'Administrador', 'Sistema', 'admin', true);

-- Comentario: El hash de contraseña anterior es solo un ejemplo
-- En producción, deberás generar un hash real usando bcrypt

-- Tabla: audit_logs (Sistema de Auditoría)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    entity_name VARCHAR(200),
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar el rendimiento de consultas en audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(module, entity_id);
