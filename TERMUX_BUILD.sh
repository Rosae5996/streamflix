#!/bin/bash

# StreamFlix Mobile - Script de Compilación para Termux
# Copia y pega este script en Termux para compilar el APK

echo "🚀 StreamFlix Mobile - Compilación en Termux"
echo "============================================="
echo ""

# Paso 1: Actualizar paquetes
echo "📦 Paso 1: Actualizando paquetes..."
pkg update -y
pkg upgrade -y

# Paso 2: Instalar dependencias
echo "📦 Paso 2: Instalando Node.js y npm..."
pkg install -y nodejs npm git

# Paso 3: Crear directorio de trabajo
echo "📁 Paso 3: Creando directorio de trabajo..."
mkdir -p ~/streamflix-build
cd ~/streamflix-build

# Paso 4: Descargar proyecto
echo "📥 Paso 4: Descargando StreamFlix Mobile..."
# Opción A: Si tienes git
# git clone https://github.com/tu-usuario/streamflix-mobile.git
# cd streamflix-mobile

# Opción B: Descargar desde Google Drive (requiere el enlace)
# wget -O streamflix-mobile.zip "https://drive.google.com/uc?export=download&id=TU_ID"
# unzip streamflix-mobile.zip
# cd streamflix-mobile

echo "⚠️  Necesitas descargar el proyecto manualmente:"
echo "   1. Ve a Google Drive"
echo "   2. Descarga la carpeta streamflix-mobile"
echo "   3. Extrae el ZIP en ~/streamflix-build/"
echo "   4. Continúa con los siguientes pasos"
echo ""
read -p "Presiona Enter cuando hayas completado lo anterior..."

# Paso 5: Instalar dependencias del proyecto
echo "📦 Paso 5: Instalando dependencias del proyecto..."
npm install

# Paso 6: Instalar EAS CLI
echo "📦 Paso 6: Instalando EAS CLI..."
npm install -g eas-cli

# Paso 7: Configurar token de Expo
echo "🔐 Paso 7: Configurando autenticación..."
export EXPO_TOKEN="KyfdFDzhD3vsZY3dSM4Jh9mUh63r7c5nENbzU58N"

# Paso 8: Compilar APK
echo "🔨 Paso 8: Compilando APK para Android..."
echo "⏳ Esto puede tomar 15-20 minutos. Por favor espera..."
echo ""

eas build --platform android --wait

echo ""
echo "✅ ¡Compilación completada!"
echo ""
echo "📱 El APK se descargó en: ~/storage/downloads/"
echo ""
echo "Para instalar:"
echo "1. Abre el Gestor de Archivos"
echo "2. Ve a Descargas"
echo "3. Toca el archivo .apk"
echo "4. Toca 'Instalar'"
echo ""
