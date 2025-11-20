# Guía de Despliegue a Producción

## Estado Actual

✅ **Código subido a GitHub**
- Último commit: "Prospecto y modo oscuro"
- Branch: `main`
- Todo sincronizado con el repositorio remoto

## Opciones de Despliegue

### Opción 1: Vercel (Recomendado) ⭐

**Ventajas:**
- Despliegue automático desde GitHub
- SSL gratis
- CDN global
- Preview deployments para cada PR
- Fácil configuración

**Pasos:**

1. **Crear cuenta en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "Sign Up"
   - Elige "Continue with GitHub"

2. **Importar proyecto**
   - Click en "Add New..." → "Project"
   - Selecciona el repositorio `pastillero`
   - Vercel detectará automáticamente que es Vite

3. **Configurar variables de entorno**
   - En la sección "Environment Variables" agrega:
     ```
     VITE_SUPABASE_URL=tu_supabase_url
     VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
     ```
   - **IMPORTANTE**: Copia estos valores de tu archivo `.env` local

4. **Deploy**
   - Click en "Deploy"
   - Espera 1-2 minutos
   - ¡Listo! Tu app estará en `https://pastillero.vercel.app`

5. **Configurar dominio personalizado (opcional)**
   - Ve a Settings → Domains
   - Agrega tu dominio
   - Sigue las instrucciones de DNS

**Después del primer deploy:**
- Cada `git push` desplegará automáticamente
- Vercel te enviará notificaciones del estado
- Preview URL para cada PR

---

### Opción 2: Netlify

**Pasos:**

1. **Crear cuenta en Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Sign up con GitHub

2. **Nuevo sitio desde Git**
   - Click "Add new site" → "Import an existing project"
   - Selecciona GitHub y autoriza
   - Elige el repositorio `pastillero`

3. **Configuración de build**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Variables de entorno**
   - Site settings → Environment variables
   - Agrega:
     ```
     VITE_SUPABASE_URL
     VITE_SUPABASE_ANON_KEY
     ```

5. **Deploy**
   - Click "Deploy site"
   - Tu sitio estará en `https://pastillero-random.netlify.app`

---

### Opción 3: GitHub Pages (Solo para apps estáticas)

**Limitación:** No soporta variables de entorno en runtime

**Pasos:**

1. **Instalar gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Actualizar package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://tu-usuario.github.io/pastillero"
   }
   ```

3. **Actualizar vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/pastillero/',
     // ... resto de config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

---

## Configuración Post-Despliegue

### 1. Configurar Supabase

**URL permitidas:**

1. Ve a tu proyecto en Supabase Dashboard
2. Settings → Authentication → URL Configuration
3. Agrega tu URL de producción:
   ```
   Site URL: https://tu-app.vercel.app
   Redirect URLs: https://tu-app.vercel.app/**
   ```

### 2. Configurar CORS (si es necesario)

En Supabase Dashboard → Settings → API:
- Asegúrate que tu dominio esté permitido

### 3. Verificar PWA

1. Abre tu app en producción
2. Abre DevTools → Application → Service Workers
3. Verifica que el SW esté registrado
4. Prueba "Add to Home Screen"

### 4. Probar Funcionalidades

- [ ] Login/Registro
- [ ] Crear medicamento
- [ ] Ver prospecto
- [ ] Cambiar a modo oscuro
- [ ] Añadir a pantalla de inicio (PWA)
- [ ] Notificaciones (si están habilitadas)

---

## Monitoreo y Mantenimiento

### Ver logs en Vercel

1. Ve a tu proyecto en Vercel
2. Click en el deployment
3. Pestaña "Functions" o "Logs"

### Analytics

Vercel incluye analytics básico gratis:
- Pageviews
- Unique visitors
- Top pages

Para más detalles, considera:
- Google Analytics
- Plausible Analytics (privacy-friendly)

### Actualizaciones Futuras

**Proceso de actualización:**

1. Hacer cambios localmente
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push
   ```
3. Vercel despliega automáticamente
4. Verifica el deployment en la URL de preview
5. Si todo está bien, se despliega a producción

---

## Rollback (Volver a versión anterior)

**En Vercel:**
1. Ve a Deployments
2. Encuentra el deployment anterior funcional
3. Click en los 3 puntos → "Promote to Production"

**Con Git:**
```bash
git revert HEAD
git push
```

---

## Troubleshooting

### Error: "Environment variables not found"

**Solución:**
1. Verifica que las variables estén en Vercel/Netlify
2. Deben empezar con `VITE_` para estar disponibles en el cliente
3. Re-deploy después de agregar variables

### Error: "Failed to fetch"

**Solución:**
1. Verifica la URL de Supabase
2. Asegúrate que la URL de producción esté en Supabase → Redirect URLs
3. Revisa CORS en Supabase

### PWA no funciona en producción

**Solución:**
1. Verifica que el sitio use HTTPS
2. Revisa que `sw.js` esté accesible
3. Verifica headers en `vercel.json`

### Modo oscuro no persiste

**Solución:**
1. Verifica que localStorage esté permitido
2. Asegúrate que no haya bloqueadores de cookies

---

## Checklist de Producción

Antes de lanzar públicamente:

- [ ] Variables de entorno configuradas
- [ ] URLs de Supabase actualizadas
- [ ] SSL/HTTPS funcionando
- [ ] PWA instalable
- [ ] Modo oscuro funciona
- [ ] Login/registro funciona
- [ ] Búsqueda de prospectos funciona
- [ ] Todos los componentes se ven bien
- [ ] Probado en móvil
- [ ] Probado en diferentes navegadores
- [ ] Políticas de RLS activas en Supabase
- [ ] Datos de prueba eliminados

---

## Comandos Útiles

```bash
# Ver estado de git
git status

# Hacer commit
git add .
git commit -m "feat: nueva funcionalidad"

# Push a GitHub (despliega automáticamente)
git push origin main

# Ver última versión en producción
git log -1

# Construir localmente para probar
npm run build
npm run preview
```

---

## Costos

### Gratis Forever (Free Tier):

**Vercel:**
- 100 GB bandwidth/mes
- Dominios ilimitados
- SSL gratis
- Deployments ilimitados

**Netlify:**
- 100 GB bandwidth/mes
- 300 build minutes/mes

**Supabase:**
- 500 MB database
- 1 GB file storage
- 50,000 usuarios activos mensuales

**GitHub:**
- Repositorios ilimitados
- Actions: 2000 minutos/mes

---

## Próximos Pasos

1. **Monitoreo de errores:** Considera Sentry (gratis para proyectos pequeños)
2. **Analytics:** Google Analytics o Plausible
3. **Custom domain:** Compra un dominio en Namecheap, Google Domains, etc.
4. **Email personalizado:** Para notificaciones de Supabase
5. **Backups:** Configura backups automáticos de Supabase

---

## Soporte

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev/guide/

¡Tu aplicación está lista para producción! 🚀
