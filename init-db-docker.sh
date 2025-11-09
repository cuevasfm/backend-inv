#!/bin/sh
# Script para inicializar la base de datos en Docker

echo "Esperando a que PostgreSQL esté listo..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo "PostgreSQL no está listo - esperando..."
  sleep 2
done

echo "PostgreSQL está listo!"

# Verificar si las tablas principales ya existen
TABLE_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='users');")

if [ "$TABLE_EXISTS" = "f" ]; then
  echo "Inicializando base de datos..."
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f /app/src/config/init-db.sql
  echo "Base de datos inicializada!"
else
  echo "Base de datos ya está inicializada"
fi

# Verificar si las tablas de ventas existen
SALES_TABLE_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='sales');")

if [ "$SALES_TABLE_EXISTS" = "f" ]; then
  echo "Creando tablas de ventas..."
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f /app/create-sales-tables.sql
  echo "Tablas de ventas creadas!"
else
  echo "Tablas de ventas ya existen"
fi

# Iniciar la aplicación
echo "Iniciando aplicación..."
exec node server.js

