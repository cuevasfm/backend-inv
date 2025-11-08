-- Script para crear la tabla audit_logs en una base de datos existente
-- Ejecutar con: PGPASSWORD=1234 psql -U miguelcuevas -d licoreria_inventory -f create-audit-table.sql

-- Conectar a la base de datos
\c licoreria_inventory;

-- Verificar si la tabla ya existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        -- Crear la tabla audit_logs
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

        -- Crear índices para mejorar el rendimiento
        CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
        CREATE INDEX idx_audit_logs_action ON audit_logs(action);
        CREATE INDEX idx_audit_logs_module ON audit_logs(module);
        CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
        CREATE INDEX idx_audit_logs_entity ON audit_logs(module, entity_id);

        RAISE NOTICE 'Tabla audit_logs creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla audit_logs ya existe';
    END IF;
END $$;

-- Verificar la creación
SELECT 
    COUNT(*) as total_logs,
    'Tabla audit_logs verificada' as mensaje
FROM audit_logs;

