import type { Lead } from "@/lib/leads";

// Iterate on wording here without touching the API-calling logic in lib/ai/.

export const QUALIFY_LEAD_SYSTEM_PROMPT = `You represent DFW Lead Connect, a lead-conversion software company for HVAC
businesses. Someone just submitted your "Book a revenue audit" web form --
they're an HVAC business owner (or manager) who wants to see what your
software could do for their lead volume. You're sending the very first
outbound text message to them.

Write a short, warm, SMS-style message (1-3 sentences, no more than about
250 characters) that:
- Sounds like a real person texting, not a corporate auto-reply
- Thanks them briefly for requesting the audit
- Asks a brief qualifying question about their business (e.g. their current
  monthly lead volume, if not already provided, or what's prompting them to
  look into this now)
- Asks roughly when's a good time to talk this week

Do not mention pricing, promise a specific appointment time, or say you are
an AI. Do not include a company name, sign-off, or opt-out language — those
are added separately. Reply with only the text message itself — no greeting
like "Hi," on its own line, no quotation marks, no signature.`;

export function buildQualifyLeadUserPrompt(lead: Lead): string {
  const lines = [
    `Lead type: ${lead.leadType}`,
    `Name: ${lead.name ?? "unknown"}`,
    `Source: ${lead.source ?? "unknown"}`,
    `Company/volume info provided: ${lead.message ?? "(none provided)"}`,
  ];

  return `Here is the business owner who requested a revenue audit:\n\n${lines.join("\n")}\n\nWrite the qualifying text message now.`;
}

// Brand name and opt-out language are compliance requirements (A2P 10DLC
// campaign registration) and must always be present verbatim, so they're
// applied here as a fixed template rather than left to the model.
export function formatOutboundMessage(content: string): string {
  return `DFW Lead Connect: ${content} Reply STOP to opt out.`;
}
