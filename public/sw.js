/* eslint-disable no-undef */
// Service Worker para notificaciones persistentes

self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(self.clients.claim());
});

// Manejar clicks en las notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'mark-taken') {
    // Enviar mensaje a la aplicación para marcar como tomado
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'MARK_MEDICATION_TAKEN',
            medicamentoId: data.medicamentoId,
            hora: data.hora,
          });
        });

        // Si no hay ventanas abiertas, abrir una
        if (clients.length === 0) {
          return self.clients.openWindow('/');
        }
      })
    );
  } else if (action === 'snooze') {
    // Posponer la notificación 10 minutos
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(() => {
          self.registration.showNotification(event.notification.title, {
            body: event.notification.body,
            icon: event.notification.icon,
            badge: event.notification.badge,
            data: data,
            actions: event.notification.actions,
            requireInteraction: true,
          });
          resolve();
        }, 10 * 60 * 1000); // 10 minutos
      })
    );
  } else {
    // Click en la notificación principal - abrir la app
    event.waitUntil(
      self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => {
          // Intentar enfocar una ventana existente
          for (const client of clients) {
            if ('focus' in client) {
              return client.focus();
            }
          }
          // Si no hay ventanas, abrir una nueva
          if (self.clients.openWindow) {
            return self.clients.openWindow('/');
          }
        })
    );
  }
});

// Manejar el cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Notificación cerrada:', event.notification.tag);
});

// Escuchar mensajes de la aplicación
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, options, delay } = event.data;

    setTimeout(() => {
      self.registration.showNotification(title, options);
    }, delay);
  }
});
