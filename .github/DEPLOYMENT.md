# 🚀 Guía de Despliegue Automático

Este proyecto utiliza GitHub Actions para despliegue automático en Vercel y compilación automática de APK.

## 📋 Requisitos

### 1. Para Vercel (Sitio Web)

Necesitas:
- Cuenta en [Vercel](https://vercel.com)
- Token de Vercel
- Project ID de Vercel
- Organization ID de Vercel

**Pasos:**

1. Ve a https://vercel.com/account/tokens
2. Crea un nuevo token
3. Copia el token
4. Ve a tu repositorio GitHub → Settings → Secrets and variables → Actions
5. Agrega estos secretos:
   - `VERCEL_TOKEN`: Tu token de Vercel
   - `VERCEL_ORG_ID`: Tu Organization ID
   - `VERCEL_PROJECT_ID`: Tu Project ID

### 2. Para APK (Aplicación Móvil)

Necesitas:
- Cuenta en [Expo](https://expo.dev)
- Token de Expo

**Pasos:**

1. Ve a https://expo.dev/settings/tokens
2. Crea un nuevo token
3. Copia el token
4. Ve a tu repositorio GitHub → Settings → Secrets and variables → Actions
5. Agrega este secreto:
   - `EXPO_TOKEN`: Tu token de Expo

### 3. Secretos de Base de Datos

Agrega estos secretos también:
- `DATABASE_URL`: Tu conexión a la base de datos
- `SUPABASE_URL`: Tu URL de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Tu clave de servicio
- `JWT_SECRET`: Tu secreto JWT

## 🔄 Flujo de Despliegue

### Despliegue Automático en Vercel

**Trigger:** Cada push a `main` que modifique archivos web

```
GitHub Push
    ↓
GitHub Actions
    ↓
Build & Test
    ↓
Deploy to Vercel
    ↓
✅ Sitio actualizado
```

### Compilación Automática de APK

**Trigger:** Cada push a `main` que modifique archivos móviles

```
GitHub Push
    ↓
GitHub Actions
    ↓
npm install
    ↓
eas build --platform android
    ↓
Upload Artifact
    ↓
Create Release
    ↓
✅ APK disponible en Releases
```

## 📝 Archivos de Workflow

- `.github/workflows/deploy-vercel.yml` - Despliegue en Vercel
- `.github/workflows/build-apk.yml` - Compilación de APK

## 🎯 Uso

### Desplegar Sitio Web

```bash
git push origin main
# El workflow se ejecuta automáticamente
# Verifica en GitHub → Actions
```

### Compilar APK

```bash
git push origin main
# O ejecuta manualmente:
# GitHub → Actions → Build APK → Run workflow
```

El APK se descargará automáticamente en:
- **Artifacts**: GitHub → Actions → Build APK → Artifacts
- **Releases**: GitHub → Releases

## 🆘 Solución de Problemas

### "Workflow failed: EXPO_TOKEN not set"
- Verifica que `EXPO_TOKEN` esté en Secrets
- Asegúrate de que el token sea válido

### "Vercel deployment failed"
- Verifica que `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` estén correctos
- Revisa los logs en GitHub Actions

### "Build timeout"
- La compilación puede tomar 20-30 minutos
- Aumenta el timeout en el workflow si es necesario

## 📊 Monitoreo

Para ver el estado de los workflows:

1. Ve a tu repositorio
2. Haz clic en "Actions"
3. Selecciona el workflow que quieres ver
4. Haz clic en el run más reciente

## 🔐 Seguridad

- ✅ Los secretos se encriptan en GitHub
- ✅ Solo se usan en los workflows
- ✅ Nunca se muestran en los logs
- ✅ Se regeneran automáticamente si es necesario

## 📞 Soporte

Para más información:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
