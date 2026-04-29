import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Safely get messaging instance (only in browser)
function getMessagingInstance(): Messaging | null {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;
  try {
    return getMessaging(app);
  } catch (error) {
    console.error("Failed to get messaging instance:", error);
    return null;
  }
}

/**
 * Register the Firebase service worker explicitly and get FCM token
 */
export const getFirebaseToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    // Explicitly register the service worker first
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    const messaging = getMessagingInstance();
    if (!messaging) return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token;
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
    return null;
  }
};

/**
 * Subscribe to foreground messages with a callback.
 * Returns an unsubscribe function.
 */
export const onForegroundMessage = (
  callback: (payload: { notification?: { title?: string; body?: string } }) => void
): (() => void) => {
  const messaging = getMessagingInstance();
  if (!messaging) return () => {};

  // onMessage returns an unsubscribe function — this stays active
  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("[FCM] Foreground message received:", payload);
    callback(payload);
  });

  return unsubscribe;
};

export default app;
