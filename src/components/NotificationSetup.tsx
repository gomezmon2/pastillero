import { useState, useEffect } from 'react';
import type { Medicamento } from '../types';
import {
  requestNotificationPermission,
  scheduleAllMedications,
  checkNotificationSupport
} from '../utils/notifications';

interface NotificationSetupProps {
  medicamentos: Medicamento[];
}

export const NotificationSetup = ({ medicamentos }: NotificationSetupProps) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [support, setSupport] = useState(checkNotificationSupport());
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkPermission = () => {
      const currentSupport = checkNotificationSupport();
      setSupport(currentSupport);
      setPermission(currentSupport.permission);

      // Mostrar banner si las notificaciones están soportadas pero no autorizadas
      if (currentSupport.supported && currentSupport.permission === 'default') {
        setShowBanner(true);
      }
    };

    checkPermission();
  }, []);

  useEffect(() => {
    // Programar notificaciones cuando hay medicamentos y permiso concedido
    if (permission === 'granted' && medicamentos.length > 0) {
      scheduleAllMedications(medicamentos);
    }
  }, [medicamentos, permission]);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === 'granted') {
      setShowBanner(false);
      scheduleAllMedications(medicamentos);

      // Mostrar notificación de prueba
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('Notificaciones activadas', {
          body: 'Recibirás recordatorios para tomar tus medicamentos',
          icon: '/icon.svg',
          badge: '/icon.svg',
          vibrate: [200, 100, 200],
        } as NotificationOptions);
      }
    }
  };

  if (!support.supported) {
    return null;
  }

  if (!showBanner && permission !== 'default') {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#92400e' }}>
          Activa las notificaciones
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#78350f' }}>
          Recibe recordatorios para tomar tus medicamentos, incluso cuando la app esté cerrada.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setShowBanner(false)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #d97706',
            borderRadius: '6px',
            color: '#92400e',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Más tarde
        </button>
        <button
          onClick={handleEnableNotifications}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f59e0b',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Activar
        </button>
      </div>
    </div>
  );
};
