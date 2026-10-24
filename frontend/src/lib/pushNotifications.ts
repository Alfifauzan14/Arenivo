import { apiClient } from "./api-client";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/"
    });
    return reg;
  } catch (err) {
    console.error("[FCM SW] Failed to register service worker:", err);
    return null;
  }
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch (err) {
    console.error("[FCM SW] Failed to get push subscription:", err);
    return null;
  }
}

export async function subscribeToPushNotifications(): Promise<{
  success: boolean;
  permission: NotificationPermission;
  error?: string;
}> {
  if (!isPushNotificationSupported()) {
    return {
      success: false,
      permission: "denied",
      error: "Web Push Notification tidak didukung oleh browser ini."
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        permission,
        error: "Izin notifikasi ditolak oleh pengguna."
      };
    }

    // Pastikan service worker terdaftar
    await registerServiceWorker();
    const reg = await navigator.serviceWorker.ready;

    const vapidKey =
      import.meta.env.VITE_FIREBASE_VAPID_KEY ||
      "BAPehpxwYam5l6_DnOzmi9Axz8TIRNLfFWTBEhYUuVIewDRxMOxYkQNYfeylBp5-3ctlNdwnbMsjXXcL6284Fcw";

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource
      });
    }

    const tokenPayload = JSON.stringify(sub);

    // Simpan ke backend
    try {
      await apiClient.post("/me/push-subscriptions", { token: tokenPayload });
      localStorage.setItem("futsal_push_token", tokenPayload);
    } catch (apiErr) {
      console.warn("[FCM SW] Failed to store push token to backend:", apiErr);
    }

    return { success: true, permission: "granted" };
  } catch (err: any) {
    console.error("[FCM SW] Error subscribing to push:", err);
    return {
      success: false,
      permission: Notification.permission,
      error: err?.message || "Gagal mengaktifkan notifikasi push."
    };
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    const token = localStorage.getItem("futsal_push_token") || (sub ? JSON.stringify(sub) : "");

    if (sub) {
      await sub.unsubscribe();
    }

    if (token) {
      try {
        const tokenAuth = localStorage.getItem("sb_access_token");
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";
        await fetch(`${baseUrl}/me/push-subscriptions`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(tokenAuth ? { Authorization: `Bearer ${tokenAuth}` } : {})
          },
          body: JSON.stringify({ token })
        });
      } catch (err) {
        console.warn("[FCM SW] Failed to delete token on backend:", err);
      }
      localStorage.removeItem("futsal_push_token");
    }

    return true;
  } catch (err) {
    console.error("[FCM SW] Error unsubscribing from push:", err);
    return false;
  }
}
