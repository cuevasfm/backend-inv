# Dockerfile para Backend - Sistema de Inventario Licorería
FROM node:18-alpine AS base

# Instalar dependencias del sistema necesarias para PostgreSQL
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (usar npm install si no hay package-lock.json)
RUN npm install --production

# Copiar el código fuente
COPY . .

# Copiar y dar permisos al script de inicialización
COPY init-db-docker.sh /app/
RUN chmod +x /app/init-db-docker.sh

# Exponer puerto
EXPOSE 3000

# Variable de entorno por defecto
ENV NODE_ENV=production

# Comando para iniciar la aplicación (con inicialización de DB)
CMD ["/app/init-db-docker.sh"]

