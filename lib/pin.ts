import crypto from "crypto";

export function hashPin(pin: string): string {
  const salt = process.env.NEXTAUTH_SECRET || "medicine-reminder-salt-2026";
  return crypto.createHmac("sha256", salt).update(pin.trim()).digest("hex");
}

export function verifyPin(pin: string, hashedPin: string): boolean {
  return hashPin(pin) === hashedPin;
}

