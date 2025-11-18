# Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu aplicación Pastillero Digital en Vercel de forma gratuita.

## Requisitos Previos

- Cuenta de GitHub (gratis)
- Cuenta de Vercel (gratis)
- Proyecto de Supabase configurado (ver `SUPABASE_SETUP.md`)

---

## Paso 1: Subir el Código a GitHub

### Si no tienes Git inicializado:

1. Abre la terminal en la carpeta del proyecto
2. Ejecuta los siguientes comandos:

```bash
git init
git add .
git commit -m "Initial commit - Pastillero Digital"
```

### Crear repositorio en GitHub:

1. Ve a [https://github.com/new](https://github.com/new)
2. Completa:
   - **Repository name**: `pastillero` (o el nombre que prefieras)
   - **Description**: Aplicación para gestionar medicamentos
   - **Visibility**: Privado o Público (tu elección)
3. NO marques "Initialize this repository with a README"
4. Haz clic en "Create repository"

### Conectar tu código local con GitHub:

Copia y ejecuta los comandos que GitHub te muestra, algo como:

```bash
git remote add origin https://github.com/tu-usuario/pastillero.git
git branch -M main
git push -u origin main
```

---

## Paso 2: Crear Cuenta en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en "Sign Up"
3. Selecciona "Continue with GitHub"
4. Autoriza a Vercel para acceder a tu cuenta de GitHub

---

## Paso 3: Importar Proyecto desde GitHub

1. En el dashboard de Vercel, haz clic en **"Add New..."** > **"Project"**
2. Busca tu repositorio `pastillero`
3. Haz clic en **"Import"**

---

## Paso 4: Configurar el Proyecto

En la pantalla de configuración:

### Build Settings (dejar por defecto):
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables (¡IMPORTANTE!):

Haz clic en **"Environment Variables"** y agrega:

1. Primera variable:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Tu URL de Supabase (ej: `https://xxxxx.supabase.co`)
   - Marca: Production, Preview, Development

2. Segunda variable:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Tu clave anónima de Supabase
   - Marca: Production, Preview, Development

---

## Paso 5: Desplegar

1. Haz clic en **"Deploy"**
2. Espera 1-2 minutos mientras Vercel construye tu aplicación
3. ¡Listo! Verás un mensaje de éxito con confeti 🎉

---

## Paso 6: Acceder a tu Aplicación

1. Vercel te mostrará un enlace como: `https://pastillero.vercel.app`
2. Haz clic en el enlace o en **"Visit"**
3. Tu aplicación está ahora en línea y accesible desde cualquier lugar

---

## Actualizaciones Futuras

Cada vez que hagas cambios en tu código:

1. Guarda tus cambios
2. Ejecuta en la terminal:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

3. Vercel automáticamente detectará los cambios y desplegará la nueva versión
4. Recibirás un email cuando el despliegue esté completo

---

## Configuración de Dominio Personalizado (Opcional)

### Usar dominio de Vercel:

Por defecto tendrás: `https://tu-proyecto.vercel.app`

Para cambiarlo:
1. Ve a tu proyecto en Vercel
2. Settings > Domains
3. Agrega un dominio personalizado de Vercel

### Usar tu propio dominio:

Si tienes un dominio (ej: `mipastillero.com`):

1. Ve a Settings > Domains
2. Agrega tu dominio
3. Configura los DNS según las instrucciones de Vercel

---

## Monitoreo y Analytics

Vercel incluye analytics básicos gratis:

1. Ve a tu proyecto en Vercel
2. Haz clic en "Analytics"
3. Verás:
   - Visitas
   - Tiempo de carga
   - Errores
   - Dispositivos

---

## Troubleshooting

### Build falla con "Error: Command failed"

Revisa que:
- Todas las dependencias estén en `package.json`
- El comando `npm run build` funcione localmente
- No haya errores de TypeScript

### Página en blanco después del deploy

Revisa:
- Las variables de entorno estén configuradas correctamente
- La consola del navegador (F12) para ver errores
- Que Supabase esté configurado correctamente

### "Failed to fetch" en producción

Verifica:
- Las variables de entorno en Vercel
- Que las políticas RLS en Supabase permitan acceso público
- La URL de Supabase sea correcta

---

## Comandos Útiles

### Ver logs de despliegue:
Ve a tu proyecto > Deployments > clic en el deployment > View Function Logs

### Revertir a versión anterior:
1. Ve a Deployments
2. Encuentra el deployment anterior
3. Haz clic en los tres puntos > "Promote to Production"

### Eliminar proyecto:
Settings > General > Delete Project

---

## Límites del Plan Gratuito de Vercel

- ✅ Ancho de banda: 100 GB/mes
- ✅ Despliegues ilimitados
- ✅ SSL automático
- ✅ Preview deployments
- ✅ Analytics básicos
- ✅ Custom domains

Más que suficiente para uso personal y proyectos pequeños.

---

## Próximos Pasos

1. ✅ Comparte el enlace con amigos/familia
2. 📱 Agrega la app a la pantalla de inicio del móvil
3. 🔔 Implementa notificaciones push
4. 👥 Agrega autenticación multi-usuario
5. 📊 Crea dashboard de estadísticas

---

## Enlaces Útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Vite en Vercel](https://vercel.com/guides/deploying-vite-to-vercel)
- [Troubleshooting Vercel](https://vercel.com/support)
