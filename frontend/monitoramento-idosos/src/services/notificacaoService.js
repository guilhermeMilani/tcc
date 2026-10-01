import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { atualizarTokenNotificacao } from '../api/api';

// Configura como a notificação aparece quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function configurarNotificacoes(cuidadorId) {
  if (!Device.isDevice) {
    console.log('Notificações só funcionam em dispositivo físico');
    return;
  }

  // Solicita permissão
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permissão de notificação negada');
    return;
  }

  // Configura canal de alta prioridade no Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alertas-criticos', {
      name: 'Alertas Críticos',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
      sound: 'default',
      bypassDnd: true, // ignora modo não perturbe
    });
  }

  // Pega o token do dispositivo
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Token FCM:', token);

  // Envia o token ao backend
  await atualizarTokenNotificacao(cuidadorId, token);

  return token;
}

export function configurarListeners(navigationRef) {
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notificação recebida:', notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    const tipo = response.notification.request.content.data?.tipo;
    if (tipo === 'PANICO' || tipo === 'FREQUENCIA_ALTA' || tipo === 'FREQUENCIA_BAIXA' ||
        tipo === 'SPO2_BAIXO' || tipo === 'TEMPERATURA_ALTA') {
      navigationRef.current?.navigate('Alertas');
    }
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}