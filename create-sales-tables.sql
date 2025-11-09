-- Script para crear tablas de ventas en producción
-- Ejecutar este script en la base de datos de producción si las tablas no existen

-- Crear enums si no existen
DO $$ BEGIN
    CREATE TYPE sale_type_enum AS ENUM ('retail', 'wholesale');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'transfer', 'credit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('paid', 'pending', 'partial', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabla: sales
CREATE TABLE IF NOT EXISTS sales (
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
CREATE TABLE IF NOT EXISTS sale_items (
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

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_sales_sale_number ON sales(sale_number);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- Verificar que las tablas se crearon correctamente
SELECT 'Tabla sales creada/verificada' as status, 
       (SELECT COUNT(*) FROM sales) as total_ventas;
SELECT 'Tabla sale_items creada/verificada' as status, 
       (SELECT COUNT(*) FROM sale_items) as total_items;

