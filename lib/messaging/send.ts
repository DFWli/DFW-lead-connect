// The single seam for the SMS provider (currently Twilio). Nothing outside
// this file should know how messages actually get delivered -- callers just
// await sendMessage() and it logs/handles success or failure internally.

import twilio from "twilio";

let client: ReturnType<typeof twilio> | null = null;

function getTwilioClient(): ReturnType<typeof twilio> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error(
      "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are not set. Copy .env.example to .env.local and add your Twilio credentials."
    );
  }
  if (!client) {
    client = twilio(accountSid, authToken);
  }
  return client;
}

// Twilio requires E.164 (+15551234567). Leads are typically captured as
// plain 10-digit US numbers, so normalize the common cases rather than
// reject anything that isn't already E.164.
function toE164(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.length === 10) return "+1" + cleaned;
  if (cleaned.length === 11 && cleaned.startsWith("1")) return "+" + cleaned;
  return "+" + cleaned;
}

export async function sendMessage(to: string, content: string): Promise<void> {
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    console.error(
      `[sendMessage] TWILIO_PHONE_NUMBER is not set; cannot send SMS to=${to}`
    );
    return;
  }

  const toNumber = toE164(to);

  try {
    const twilioClient = getTwilioClient();
    const message = await twilioClient.messages.create({
      to: toNumber,
      from: fromNumber,
      body: content,
    });
    console.log(`[sendMessage] sent to=${toNumber} sid=${message.sid}`);
  } catch (error) {
    // Never let an SMS failure crash the caller -- a failed text is not a
    // failed lead capture. Just log it so it's visible.
    console.error(`[sendMessage] failed to=${toNumber}`, error);
  }
}
