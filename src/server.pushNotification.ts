import 'reflect-metadata';
import { PushNotificationService } from './services/pushNotification.service';

(async () => {
  const pushNotificationService = new PushNotificationService();
  await pushNotificationService.init();
  console.info('Push notification server started');
})();
