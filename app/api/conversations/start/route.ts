import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { LeadRow, toLead } from "@/lib/leads";
import { MessageRow, toMessage } from "@/lib/messages";
import { generateQualifyingMessage } from "@/lib/ai/qualify-lead";
import { sendMessage } from "@/lib/messaging/send";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 }
    );
  }

  const { leadId } = body as Record<string, unknown>;

  if (typeof leadId !== "number" || !Number.isInteger(leadId)) {
    return NextResponse.json(
      { error: "\"leadId\" is required and must be an integer." },
      { status: 400 }
    );
  }

  const db = getDb();

  const leadRow = db
    .prepare("SELECT * FROM leads WHERE id = ?")
    .get(leadId) as LeadRow | undefined;

  if (!leadRow) {
    return NextResponse.json(
      { error: `No lead found with id ${leadId}.` },
      { status: 404 }
    );
  }

  const lead = toLead(leadRow);

  let content: string;
  try {
    content = await generateQualifyingMessage(lead);
  } catch (error) {
    console.error("Failed to generate qualifying message:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error generating message.";
    return NextResponse.json(
      { error: `Failed to generate qualifying message: ${message}` },
      { status: 500 }
    );
  }

  console.log(`[conversations/start] lead ${lead.id}: ${content}`);

  // sendMessage handles its own errors internally and never throws, so an
  // SMS delivery failure never turns into a failed lead-capture request.
  await sendMessage(lead.phone, content);

  const insert = db.prepare(`
    INSERT INTO messages (lead_id, direction, content)
    VALUES (@leadId, 'outbound', @content)
  `);
  const result = insert.run({ leadId: lead.id, content });

  const messageRow = db
    .prepare("SELECT * FROM messages WHERE id = ?")
    .get(result.lastInsertRowid) as MessageRow;

  return NextResponse.json(toMessage(messageRow), { status: 201 });
}
