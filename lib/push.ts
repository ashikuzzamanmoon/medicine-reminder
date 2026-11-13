import * as webpush from "web-push";

let vapidConfigured = false;

export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
}

export function getVapidPrivateKey(): string {
  return process.env.VAPID_PRIVATE_KEY || "";
}

function ensureVapidConfig() {
  if (vapidConfigured) return;
  const publicKey = getVapidPublicKey();
  const privateKey = getVapidPrivateKey();

  if (publicKey && privateKey) {
    webpush.setVapidDetails(
      "mailto:support@medicinereminder.app",
      publicKey,
      privateKey
    );
    vapidConfigured = true;
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  speakText?: string;
  type?: "REMINDER" | "CONFIRMATION" | "MISSED_ALERT" | "INFO";
  showActions?: boolean;
  doseId?: string;
}

export interface PushSubscriptionKeys {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendPushNotification(
  subscription: PushSubscriptionKeys,
  payload: PushPayload
) {
  try {
    ensureVapidConfig();
    const res = await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify(payload)
    );
    return { success: true, statusCode: res.statusCode };
  } catch (error) {
    console.error("Web Push Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
