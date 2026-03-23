#!/bin/bash

echo "🚀 StreamFlix Mobile - Compilación Local"
echo "========================================"
echo ""
echo "📋 Preparando compilación..."
echo ""

# Instalar dependencias necesarias
echo "📦 Instalando dependencias..."
npm install 2>&1 | tail -3

echo ""
echo "🔨 Compilando APK para Android..."
echo "⏳ Esto puede tomar 10-15 minutos..."
echo ""

# Compilar APK usando expo
expo build:android -t apk 2>&1 | tee /tmp/expo-build.log

# Extraer URL de descarga
APK_URL=$(grep -o "https://[^[:space:]]*\.apk" /tmp/expo-build.log | head -1)

if [ -n "$APK_URL" ]; then
    echo ""
    echo "✅ Compilación completada"
    echo "📥 Descargando APK desde: $APK_URL"
    echo ""
    
    wget -O /tmp/streamflix-mobile.apk "$APK_URL" 2>&1 | tail -5
    
    if [ -f /tmp/streamflix-mobile.apk ]; then
        FILE_SIZE=$(du -h /tmp/streamflix-mobile.apk | cut -f1)
        echo ""
        echo "✅ APK descargado: $FILE_SIZE"
        echo ""
        
        echo "📤 Cargando a Google Drive..."
        
        UPLOAD=$(gws drive files create --json '{"name":"streamflix-mobile.apk","parents":["1Akf7hZsC1v97rJiNurubRsCnT8c3LO61"]}' --upload /tmp/streamflix-mobile.apk --format json 2>&1)
        
        if echo "$UPLOAD" | grep -q '"id"'; then
            echo "✅ Archivo cargado a Google Drive"
            echo ""
            echo "🎉 ¡COMPILACIÓN COMPLETADA!"
            echo ""
            echo "📍 Ubicación: aplicación/streamflix-mobile.apk"
            echo "📊 Tamaño: $FILE_SIZE"
        else
            echo "❌ Error al cargar: $UPLOAD"
        fi
    else
        echo "❌ Error al descargar APK"
    fi
else
    echo "❌ Error en compilación"
    tail -50 /tmp/expo-build.log
fi
