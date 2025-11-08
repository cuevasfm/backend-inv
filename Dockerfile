# Dockerfile para Backend - Sistema de Inventario Licorería
FROM node:18-alpine AS base

# Instalar dependencias del sistema necesarias para PostgreSQL
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Variable de entorno por defecto
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["node", "server.js"]

