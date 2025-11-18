import type { Medicamento } from '../types';

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

export const showNotification = async (
  title: string,
  options?: ExtendedNotificationOptions
): Promise<void> => {
  const permission = await requestNotificationPermission();

  if (permission === 'granted') {
    // Si hay service worker disponible, usar showNotification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        badge: '/icon.svg',
        icon: '/icon.svg',
        vibrate: [200, 100, 200],
        tag: 'medicamento-recordatorio',
        requireInteraction: true,
        ...options,
      } as NotificationOptions);
    } else {
      // Fallback a Notification API básica
      new Notification(title, {
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [200, 100, 200],
        ...options,
      } as NotificationOptions);
    }
  }
};

export const scheduleMedicationNotification = (
  medicamento: Medicamento,
  hora: string
): void => {
  const now = new Date();
  const [hours, minutes] = hora.split(':').map(Number);

  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  // Si la hora ya pasó hoy, programar para mañana
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const timeUntilNotification = scheduledTime.getTime() - now.getTime();

  // Programar la notificación
  setTimeout(() => {
    const pastillasText = medicamento.numeroPastillas
      ? ` - ${medicamento.numeroPastillas} ${medicamento.numeroPastillas === 1 ? 'pastilla' : 'pastillas'}`
      : '';

    showNotification(
      `Recordatorio: ${medicamento.nombre}`,
      {
        body: `Es hora de tomar ${medicamento.dosis}${pastillasText} de ${medicamento.nombre}`,
        data: {
          medicamentoId: medicamento.id,
          hora: hora,
        },
        actions: [
          {
            action: 'mark-taken',
            title: 'Marcar como tomado',
          },
          {
            action: 'snooze',
            title: 'Posponer 10 min',
          },
        ],
      }
    );

    // Reprogramar para el día siguiente
    scheduleMedicationNotification(medicamento, hora);
  }, timeUntilNotification);
};

export const scheduleAllMedications = (medicamentos: Medicamento[]): void => {
  medicamentos.forEach((med) => {
    if (med.activo && med.horarios) {
      med.horarios.forEach((hora) => {
        scheduleMedicationNotification(med, hora);
      });
    }
  });
};

export const checkNotificationSupport = (): {
  supported: boolean;
  permission: NotificationPermission;
  serviceWorkerSupported: boolean;
} => {
  return {
    supported: 'Notification' in window,
    permission: 'Notification' in window ? Notification.permission : 'denied',
    serviceWorkerSupported: 'serviceWorker' in navigator,
  };
};
