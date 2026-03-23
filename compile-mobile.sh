#!/bin/bash

set -e

echo "🚀 StreamFlix Mobile - Compilación y Carga a Google Drive"
echo "=========================================================="
echo ""

# Variables
PROJECT_DIR="/home/ubuntu/streamflix-mobile"
BUILD_DIR="/tmp/streamflix-build-$(date +%s)"
GDRIVE_FOLDER="aplicación"

# Crear directorio de compilación
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

echo "📋 Paso 1: Preparando proyecto..."
cp -r "$PROJECT_DIR" ./streamflix-mobile
cd streamflix-mobile

echo "✅ Proyecto copiado a: $BUILD_DIR/streamflix-mobile"
echo ""

echo "📦 Paso 2: Instalando dependencias..."
npm install --production 2>&1 | grep -E "added|up to date" | tail -1

echo "✅ Dependencias instaladas"
echo ""

echo "🔨 Paso 3: Compilando APK para Android..."
echo "⏳ Esto puede tomar 15-20 minutos. Por favor espera..."
echo ""

# Compilar APK
if eas build --platform android --type apk 2>&1 | tee build.log; then
    echo ""
    echo "✅ Compilación completada"
    
    # Extraer URL de descarga
    APK_URL=$(grep -o "https://[^[:space:]]*\.apk" build.log | head -1)
    
    if [ -n "$APK_URL" ]; then
        echo "📥 Descargando APK desde: $APK_URL"
        
        wget -q -O streamflix-mobile.apk "$APK_URL"
        
        if [ -f streamflix-mobile.apk ]; then
            FILE_SIZE=$(du -h streamflix-mobile.apk | cut -f1)
            echo "✅ APK descargado: streamflix-mobile.apk ($FILE_SIZE)"
            echo ""
            
            echo "📤 Paso 4: Cargando a Google Drive..."
            
            # Crear carpeta en Google Drive
            gws drive files list --params '{"q":"name=\"'"$GDRIVE_FOLDER"'\" and mimeType=\"application/vnd.google-apps.folder\" and trashed=false","pageSize":1}' --format json > /tmp/folder_check.json 2>/dev/null || true
            
            FOLDER_ID=$(grep -o '"id":"[^"]*"' /tmp/folder_check.json | head -1 | cut -d'"' -f4)
            
            if [ -z "$FOLDER_ID" ]; then
                echo "📁 Creando carpeta '$GDRIVE_FOLDER' en Google Drive..."
                FOLDER_RESPONSE=$(gws drive files create --json '{"name":"'"$GDRIVE_FOLDER"'","mimeType":"application/vnd.google-apps.folder"}' --format json)
                FOLDER_ID=$(echo "$FOLDER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
                echo "✅ Carpeta creada: $FOLDER_ID"
            else
                echo "✅ Carpeta encontrada: $FOLDER_ID"
            fi
            
            # Subir archivo
            echo "📤 Subiendo streamflix-mobile.apk..."
            gws drive files create --json '{"name":"streamflix-mobile.apk","parents":["'"$FOLDER_ID"'"]}' --upload streamflix-mobile.apk --format json > /tmp/upload_result.json
            
            UPLOAD_ID=$(grep -o '"id":"[^"]*"' /tmp/upload_result.json | head -1 | cut -d'"' -f4)
            
            if [ -n "$UPLOAD_ID" ]; then
                echo "✅ Archivo cargado exitosamente!"
                echo ""
                echo "📍 Ubicación en Google Drive: $GDRIVE_FOLDER/streamflix-mobile.apk"
                echo "📊 Tamaño: $FILE_SIZE"
                echo ""
                echo "🎉 ¡Compilación y carga completadas!"
                echo ""
                echo "📱 Para instalar en tu dispositivo Android:"
                echo "   1. Descarga el APK desde Google Drive"
                echo "   2. Abre el archivo en tu dispositivo"
                echo "   3. Toca 'Instalar'"
                echo ""
            else
                echo "❌ Error al cargar el archivo a Google Drive"
                exit 1
            fi
        else
            echo "❌ Error: No se pudo descargar el APK"
            exit 1
        fi
    else
        echo "❌ Error: No se encontró URL de descarga del APK"
        cat build.log | tail -20
        exit 1
    fi
else
    echo "❌ Error en la compilación"
    cat build.log | tail -30
    exit 1
fi

echo "✨ Proceso finalizado exitosamente"
