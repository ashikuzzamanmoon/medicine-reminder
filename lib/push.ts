import * as webpush from "web-push";

const DEFAULT_VAPID_PUBLIC_KEY =
  "BO5uTOkkY95nfsQHI6rcsQTy9FNT-MAtDasOjG16FendkU6SgcX80NvYvQYH9laeCRf4e7x2j1aAUowpkOaRqiU";
const DEFAULT_VAPID_PRIVATE_KEY =
  "u9lczpTUyaszBgZ1NZXpBUQKHEU4003bgxYBEGDGjNk";

let vapidConfigured = false;

export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
}

export function getVapidPrivateKey(): string {
  return process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE_KEY;
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
