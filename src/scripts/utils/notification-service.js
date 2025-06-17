import * as APIService from '../data/api.js';
import CONFIG from '../config.js';

const VAPID_PUBLIC_KEY = CONFIG.VAPID_PUBLIC_KEY;

//  mengubah VAPID key ke format yang benar
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

// memulai subscribe
export const initNotificationSubscription = async () => {
    // Minta izin
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.warn('Izin notifikasi tidak diberikan.');
        return;
    }

    // Dapatkan registrasi Service Worker
    const swRegistration = await navigator.serviceWorker.ready;

    // Dapatkan objek susbcribve
    let pushSubscription = await swRegistration.pushManager.getSubscription();

    // Jika belum susbcribe, buat  baru
    if (!pushSubscription) {
        console.log('Belum ada subscribe, membuat yang baru...');
        const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        pushSubscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
        });
    }

    console.log('Push Subscription object:', pushSubscription);

    // Kirim susbcription diubah ke json  ke server
    try {
        const subscriptionJSON  = pushSubscription.toJSON();
        console.log('Data langganan yang akan dikirim:', subscriptionJSON);

        await APIService.subscribeNotification(subscriptionJSON);

        // await APIService.subscribeNotification(subscriptionData);
        console.log('Langganan berhasil dikirim ke server.');
        return true; // Kembalikan true jika berhasil
    } catch (error) {
        console.error('Gagal mengirim langganan ke server:', error);
        await pushSubscription.unsubscribe();
        return false; // Kembalikan false jika gagal
    }

};


// unsubscribe
export const unsubscribeFromNotifications = async () => {
  const swRegistration = await navigator.serviceWorker.ready;
  const pushSubscription = await swRegistration.pushManager.getSubscription();

  if (!pushSubscription) {
    return true;
  }

  try {
// Kirim req untuk menghapus subs dari server 
    console.log('Berhenti berlangganan dari:', pushSubscription.endpoint);
    await APIService.unsubscribeNotification(pushSubscription.toJSON());
    await pushSubscription.unsubscribe();
    console.log('Berhasil berhenti berlangganan.');
    return true;
  } catch (error) {
    console.error('Gagal berhenti berlangganan:', error);
    return false;
  }
};
