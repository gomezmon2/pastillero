# Guía PWA - Pastillero Digital

Esta guía explica cómo funciona la PWA (Progressive Web App) y las notificaciones push.

## ¿Qué es una PWA?

Una PWA es una aplicación web que se puede instalar en dispositivos móviles y desktop como si fuera una app nativa, sin necesidad de Google Play o App Store.

## Características PWA Implementadas

✅ **Instalable**: Se puede agregar a la pantalla de inicio
✅ **Notificaciones Push**: Recordatorios incluso con la app cerrada
✅ **Funciona Offline**: Service Worker para acceso sin conexión
✅ **Caché Inteligente**: Guarda datos de Supabase localmente
✅ **Icono personalizado**: Ícono de píldora azul

## Cómo Probar Localmente

### 1. Build de Producción

```bash
npm run build
npm run preview
```

Abre: http://localhost:4173

### 2. Probar Instalación (Desktop)

En Chrome/Edge:
1. Abre http://localhost:4173
2. Busca el ícono de instalación (➕) en la barra de direcciones
3. Haz clic en "Instalar"
4. La app se abrirá en su propia ventana

### 3. Probar Notificaciones

1. Haz clic en "Activar" en el banner amarillo de notificaciones
2. Acepta el permiso del navegador
3. Verás una notificación de prueba: "Notificaciones activadas"
4. Agrega un medicamento con un horario cercano (ej: 5 minutos en el futuro)
5. Espera y verás la notificación automática

### 4. Verificar Service Worker

En Chrome DevTools:
1. Presiona F12
2. Ve a la pestaña "Application"
3. En el menú lateral: Service Workers
4. Deberías ver el Service Worker registrado y activo
5. También puedes ver el Manifest y el Cache Storage

## Limitaciones Conocidas

### iOS Safari
⚠️ **Limitación importante**: Safari en iOS tiene restricciones severas para notificaciones:
- Las notificaciones push NO funcionan cuando Safari está cerrado
- Solo se permiten notificaciones mientras la app está abierta
- Apple requiere que uses Apple Push Notification Service (APNs) para notificaciones en segundo plano
- Esto es una limitación de Apple, no de nuestra app

**Solución para iOS**: Usar la app web abierta o considerar desarrollar una app nativa iOS en el futuro.

### Android
✅ **Funciona perfectamente**: Chrome y Edge en Android soportan todas las características PWA, incluyendo notificaciones en segundo plano.

### Desktop
✅ **Funciona bien**: Chrome y Edge en Windows/Mac/Linux soportan notificaciones en segundo plano si la app está instalada.

## Arquitectura Técnica

### Service Worker (`/public/sw.js`)
- Maneja notificaciones en segundo plano
- Escucha clics en notificaciones
- Permite acciones: "Marcar como tomado" y "Posponer 10 min"
- Abre la app cuando se hace clic en la notificación

### Notification Scheduler (`/src/utils/notifications.ts`)
- Calcula cuándo mostrar cada notificación
- Usa `setTimeout` para programar notificaciones
- Reprograma automáticamente para el día siguiente
- Verifica permisos antes de mostrar

### PWA Manifest (`/vite.config.ts`)
- Define nombre, iconos y colores de la app
- Configura modo "standalone" (ventana propia)
- Incluye caché para Supabase con estrategia "NetworkFirst"

## Cómo Funciona el Sistema de Notificaciones

### 1. Usuario activa notificaciones
```
Usuario → Clic "Activar" → Permiso del navegador → Service Worker registrado
```

### 2. Programación automática
```
Medicamentos → scheduleAllMedications() → setTimeout por cada horario → Notificación
```

### 3. Notificación aparece
```
Hora programada → showNotification() → Service Worker → Notificación persistente
```

### 4. Usuario interactúa
```
Clic "Marcar como tomado" → Service Worker → Mensaje a App → Marca toma en BD
```

## Desplegar en Vercel

La PWA funciona automáticamente en Vercel. Solo necesitas:

```bash
git add .
git commit -m "Implementar PWA con notificaciones"
git push
```

Vercel detectará automáticamente:
- El Service Worker en `/public/sw.js`
- El manifest generado por Vite PWA
- Los assets pre-cacheados

## Verificar en Producción

Una vez desplegado en Vercel:

1. Abre tu app en el móvil (Android): `https://tu-app.vercel.app`
2. Chrome te ofrecerá instalar la app automáticamente
3. Instala y activa notificaciones
4. Agrega un medicamento de prueba
5. Cierra Chrome completamente
6. Espera la notificación (aparecerá aunque Chrome esté cerrado)

## Debugging

### Ver logs del Service Worker

En Chrome DevTools > Console:
- Filtrar por "Service Worker"
- Ver errores de notificaciones
- Monitorear registro y activación

### Forzar actualización del Service Worker

Si haces cambios al Service Worker:
1. Chrome DevTools > Application > Service Workers
2. Clic en "Update" o marca "Update on reload"
3. O marca "Bypass for network"

### Limpiar caché y empezar de nuevo

```javascript
// En la consola del navegador
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
caches.keys().then(function(names) {
  for(let name of names) {
    caches.delete(name);
  }
});
```

## Próximas Mejoras

### Corto plazo
- [ ] Notificaciones más inteligentes (no repetir si ya se tomó)
- [ ] Snooze configurable (5, 10, 15 min)
- [ ] Sonido personalizado para notificaciones
- [ ] Badge count en el ícono de la app

### Medio plazo
- [ ] Sincronización en segundo plano (Background Sync)
- [ ] Periodic Background Sync para recordatorios recurrentes
- [ ] Push notifications desde servidor (no solo locales)
- [ ] Notificaciones ricas con imágenes

### Largo plazo
- [ ] App nativa iOS (React Native) para soporte completo
- [ ] Web Push Protocol para notificaciones server-side
- [ ] Integración con calendario del dispositivo

## Recursos Útiles

- [PWA en MDN](https://developer.mozilla.org/es/docs/Web/Progressive_web_apps)
- [Notifications API](https://developer.mozilla.org/es/docs/Web/API/Notifications_API)
- [Service Worker API](https://developer.mozilla.org/es/docs/Web/API/Service_Worker_API)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Can I Use - Push API](https://caniuse.com/push-api)

## Troubleshooting

### "Notification permission denied"
- El usuario rechazó los permisos
- Solución: Ir a configuración del navegador > Permisos > Notificaciones > Permitir

### "Service Worker registration failed"
- Error en `/public/sw.js`
- Solución: Ver consola para errores de sintaxis

### Notificaciones no aparecen
1. Verificar que el permiso esté en "granted"
2. Verificar que el Service Worker esté activo
3. Verificar que el horario sea futuro (no pasado)
4. Ver logs en consola del navegador

### La app no se puede instalar
1. Verificar que estés en HTTPS (Vercel lo hace automáticamente)
2. Verificar que el manifest esté bien configurado
3. Revisar Chrome DevTools > Application > Manifest

---

**¡La PWA está lista!** 🎉

Ahora los usuarios pueden instalar Pastillero Digital como una app nativa y recibir recordatorios incluso cuando no estén usando el navegador.
