#!/bin/bash

# Crear archivo de credenciales temporal
cat > /tmp/eas-creds.txt << 'CREDS'
alfacarlos981@gmail.com
8Car9los@2008
CREDS

# Intentar login con browser
echo "🔐 Iniciando sesión en EAS..."
eas login -b 2>&1 &

# Esperar un poco
sleep 10

# Compilar APK
echo ""
echo "🚀 Compilando APK para Android..."
echo "⏳ Esto puede tomar 15-20 minutos..."
echo ""

eas build --platform android --wait 2>&1 | tee build.log

# Extraer URL de descarga
APK_URL=$(grep -o "https://[^[:space:]]*\.apk" build.log | head -1)

if [ -n "$APK_URL" ]; then
    echo ""
    echo "✅ Compilación completada"
    echo "📥 Descargando APK..."
    
    wget -q -O /tmp/streamflix-mobile.apk "$APK_URL"
    
    if [ -f /tmp/streamflix-mobile.apk ]; then
        FILE_SIZE=$(du -h /tmp/streamflix-mobile.apk | cut -f1)
        echo "✅ APK descargado: $FILE_SIZE"
        echo ""
        
        echo "📤 Cargando a Google Drive..."
        gws drive files create --json '{"name":"streamflix-mobile.apk","parents":["1Akf7hZsC1v97rJiNurubRsCnT8c3LO61"]}' --upload /tmp/streamflix-mobile.apk --format json > /tmp/upload.json 2>&1
        
        if grep -q "id" /tmp/upload.json; then
            echo "✅ Archivo cargado a Google Drive"
            echo ""
            echo "📍 Ubicación: aplicación/streamflix-mobile.apk"
            echo "📊 Tamaño: $FILE_SIZE"
            echo "🎉 ¡Compilación completada!"
        fi
    fi
else
    echo "❌ Error en compilación"
    tail -50 build.log
fi

rm -f /tmp/eas-creds.txt
