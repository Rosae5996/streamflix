#!/bin/bash

# Quick Admin Setup Script para StreamFlix
# Este script crea un usuario admin de forma rápida

echo "🔐 StreamFlix - Quick Admin Setup"
echo ""
echo "Este script creará un usuario admin automáticamente."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado"
    echo "Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Verificar variables de entorno
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL no está configurado"
    echo ""
    echo "Asegúrate de tener un archivo .env.local con:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=..."
    echo "  SUPABASE_SERVICE_ROLE_KEY=..."
    exit 1
fi

# Cargar variables de entorno
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Ejecutar el script de setup
echo "⏳ Iniciando setup..."
echo ""

node scripts/setup-admin.js
